import { Entity, Column } from 'typeorm';
import { TenantEntity } from '../../../common/entities/tenant.entity';

@Entity('product_categories')
export class ProductCategory extends TenantEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ name: 'parent_id', type: 'varchar', length: 36, nullable: true })
  parentId: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}