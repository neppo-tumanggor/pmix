import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserMetadataRepository } from '../interfaces/user-metadata.repository.interface';
import { UserMetadata } from '../entities/user-metadata.entity';

@Injectable()
export class UserMetadataRepository {
  constructor(
    @InjectRepository(UserMetadata)
    private readonly metadataRepository: Repository<UserMetadata>,
  ) {}

  async findByUserId(userId: string): Promise<UserMetadata[]> {
    return this.metadataRepository.find({ where: { userId } });
  }

  async findByKey(userId: string, key: string): Promise<UserMetadata | null> {
    return this.metadataRepository.findOne({ where: { userId, key } });
  }

  async upsert(
    userId: string,
    tenantId: string,
    key: string,
    value: any,
  ): Promise<UserMetadata> {
    let metadata = await this.findByKey(userId, key);

    if (metadata) {
      metadata.value = value;
    } else {
      metadata = this.metadataRepository.create({
        userId,
        tenantId,
        key,
        value,
      });
    }

    return this.metadataRepository.save(metadata);
  }

  async deleteByKey(userId: string, key: string): Promise<void> {
    await this.metadataRepository.delete({ userId, key });
  }
}
