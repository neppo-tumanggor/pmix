import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<void>;
  buildKey(...parts: string[]): string;
}

@Injectable()
export class CacheService implements ICacheService {
  private readonly redis: Redis;
  private readonly defaultTTL: number;
  private readonly keyPrefix: string;
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(CacheService.name);
    this.keyPrefix = this.configService.get<string>('CACHE_KEY_PREFIX', 'settings');
    this.defaultTTL = this.configService.get<number>('CACHE_TTL', 300); // 5 minutes

    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
    const redisDb = this.configService.get<number>('REDIS_DB', 0);

    this.redis = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      db: redisDb,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error', error);
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key);
      const value = await this.redis.get(fullKey);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('Cache get error', error);
      return null; // Graceful degradation
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const fullKey = this.buildKey(key);
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(fullKey, ttl, serializedValue);
    } catch (error) {
      this.logger.error('Cache set error', error);
      // Graceful degradation - continue without cache
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      const fullKey = this.buildKey(key);
      await this.redis.del(fullKey);
    } catch (error) {
      this.logger.error('Cache invalidate error', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const fullPattern = this.buildKey(pattern);
      const keys = await this.redis.keys(fullPattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error('Cache invalidate pattern error', error);
    }
  }

  buildKey(...parts: string[]): string {
    return `${this.keyPrefix}:${parts.join(':')}`;
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
