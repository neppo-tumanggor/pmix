import { Entity, Column, Index } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';

@Entity('products')
export class Product extends TenantEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ length: 500, nullable: true })
  imageUrl: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;
}
