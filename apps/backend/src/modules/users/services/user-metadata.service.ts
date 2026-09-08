import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserMetadataRepository } from '../interfaces/user-metadata.repository.interface';
import { UserMetadata } from '../entities/user-metadata.entity';

@Injectable()
export class UserMetadataService {
  constructor(
    private readonly metadataRepository: IUserMetadataRepository,
  ) {}

  async getAllMetadata(userId: string): Promise<Record<string, any>> {
    const metadataList = await this.metadataRepository.findByUserId(userId);
    const result: Record<string, any> = {};
    metadataList.forEach(meta => {
      result[meta.key] = meta.value;
    });
    return result;
  }

  async getMetadataByKey(userId: string, key: string): Promise<any> {
    const metadata = await this.metadataRepository.findByKey(userId, key);
    if (!metadata) {
      throw new NotFoundException(`Metadata key "${key}" not found`);
    }
    return metadata.value;
  }

  async setMetadata(
    userId: string,
    tenantId: string,
    key: string,
    value: any,
  ): Promise<UserMetadata> {
    return this.metadataRepository.upsert(userId, tenantId, key, value);
  }

  async deleteMetadata(userId: string, key: string): Promise<void> {
    await this.metadataRepository.deleteByKey(userId, key);
  }
}
