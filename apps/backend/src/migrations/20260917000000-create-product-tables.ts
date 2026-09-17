import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateProductTables20260917000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'stock',
            type: 'integer',
            default: 0,
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createIndex('products', new TableIndex({
      name: 'idx_products_tenant_id',
      columnNames: ['tenant_id'],
    }));

    await queryRunner.createIndex('products', new TableIndex({
      name: 'idx_products_category',
      columnNames: ['category'],
    }));

    await queryRunner.createIndex('products', new TableIndex({
      name: 'idx_products_created_at',
      columnNames: ['created_at'],
    }));

    await queryRunner.createIndex('products', new TableIndex({
      name: 'idx_products_is_active',
      columnNames: ['is_active'],
    }));

    await queryRunner.createTable(
      new Table({
        name: 'product_categories',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'parent_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createIndex('product_categories', new TableIndex({
      name: 'idx_product_categories_tenant_id',
      columnNames: ['tenant_id'],
    }));

    await queryRunner.createIndex('product_categories', new TableIndex({
      name: 'idx_product_categories_parent_id',
      columnNames: ['parent_id'],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('product_categories', 'idx_product_categories_parent_id');
    await queryRunner.dropIndex('product_categories', 'idx_product_categories_tenant_id');
    await queryRunner.dropTable('product_categories');

    await queryRunner.dropIndex('products', 'idx_products_is_active');
    await queryRunner.dropIndex('products', 'idx_products_created_at');
    await queryRunner.dropIndex('products', 'idx_products_category');
    await queryRunner.dropIndex('products', 'idx_products_tenant_id');
    await queryRunner.dropTable('products');
  }
}