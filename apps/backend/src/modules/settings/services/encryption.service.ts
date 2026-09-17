import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits

  constructor(private readonly configService: ConfigService) {
    this.validateKey();
  }

  private validateKey(): void {
    const key = this.configService.get<string>('ENCRYPTION_KEY');

    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    const keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length !== this.keyLength) {
      throw new Error(
        `ENCRYPTION_KEY must be ${this.keyLength} bytes (${this.keyLength * 8} bits)`,
      );
    }
  }

  private getKey(): Buffer {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    return Buffer.from(key, 'hex');
  }

  encrypt(plaintext: string): EncryptedData {
    if (!plaintext || plaintext.trim() === '') {
      throw new Error('Plaintext cannot be empty');
    }

    const key = this.getKey();
    const iv = crypto.randomBytes(16); // 128-bit IV for AES-GCM
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  decrypt(encryptedData: EncryptedData): string {
    if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
      throw new Error('Invalid encrypted data format');
    }

    try {
      const key = this.getKey();
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        key,
        Buffer.from(encryptedData.iv, 'hex'),
      );

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed. Invalid key or corrupted data.');
    }
  }

  encryptObject<T extends Record<string, any>>(obj: T): Record<string, EncryptedData> {
    const encrypted: Record<string, EncryptedData> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        encrypted[key] = this.encrypt(value);
      } else if (typeof value === 'object' && value !== null) {
        encrypted[key] = this.encrypt(JSON.stringify(value));
      } else {
        encrypted[key] = this.encrypt(String(value));
      }
    }

    return encrypted;
  }

  decryptObject<T>(encryptedObj: Record<string, EncryptedData>): T {
    const decrypted: Record<string, any> = {};

    for (const [key, encryptedData] of Object.entries(encryptedObj)) {
      try {
        const decryptedValue = this.decrypt(encryptedData);

        // Try to parse as JSON, fallback to string
        try {
          decrypted[key] = JSON.parse(decryptedValue);
        } catch {
          decrypted[key] = decryptedValue;
        }
      } catch (error) {
        decrypted[key] = null;
      }
    }

    return decrypted as T;
  }

  isEncrypted(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      'encrypted' in value &&
      'iv' in value &&
      'authTag' in value
    );
  }
}
