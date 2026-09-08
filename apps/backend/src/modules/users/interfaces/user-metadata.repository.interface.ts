import { EntityRepository } from 'typeorm';
import { UserMetadata } from '../entities/user-metadata.entity';

export interface IUserMetadataRepository extends EntityRepository<UserMetadata> {
  findByUserId(userId: string): Promise<UserMetadata[]>;
  findByKey(userId: string, key: string): Promise<UserMetadata | null>;
  upsert(userId: string, tenantId: string, key: string, value: any): Promise<UserMetadata>;
  deleteByKey(userId: string, key: string): Promise<void>;
}
