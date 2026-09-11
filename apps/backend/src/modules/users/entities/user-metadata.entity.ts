import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { generateUuid } from '../../../shared/utils/uuid.util';

@Entity('user_metadata')
export class UserMetadata {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'tenant_id', type: 'varchar', length: 255 })
  tenantId: string;

  @Column({ name: 'key', type: 'varchar', length: 100 })
  key: string;

  @Column({ name: 'value', type: 'simple-json', nullable: true })
  value: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })

  // Auto-generate UUID before insert
  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = generateUuid();
    }
  }
  updatedAt: Date;
}
