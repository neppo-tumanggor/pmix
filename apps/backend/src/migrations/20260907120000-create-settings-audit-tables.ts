import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSettingsAuditTables20260907120000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const jsonType = queryRunner.connection.options.type === 'postgres' ? 'jsonb' : 'text';
    
    // Create settings table
    await queryRunner.createTable(
      new Table({
        name: 'settings',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          { name: 'tenant_id', type: 'varchar', length: '255', isNullable: false },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          { name: 'key', type: 'varchar', length: '100', isNullable: false },
          { name: 'value', type: jsonType, isNullable: false },
          { name: 'is_encrypted', type: 'boolean', default: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'created_at', type: 'datetime' },
          { name: 'updated_at', type: 'datetime' },
          { name: 'deleted_at', type: 'datetime', isNullable: true },
        ],
      }),
      true
    );

    // Create indexes for settings table
    await queryRunner.createIndex(
      'settings',
      new TableIndex({
        name: 'idx_settings_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );
    await queryRunner.createIndex(
      'settings',
      new TableIndex({
        name: 'idx_settings_category',
        columnNames: ['category'],
      }),
    );
    await queryRunner.createIndex(
      'settings',
      new TableIndex({
        name: 'idx_settings_tenant_category',
        columnNames: ['tenant_id', 'category'],
      }),
    );
    await queryRunner.createIndex(
      'settings',
      new TableIndex({
        name: 'idx_settings_tenant_category_key',
        columnNames: ['tenant_id', 'category', 'key'],
        isUnique: true,
      }),
    );

    // Create audit_logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          { name: 'tenant_id', type: 'varchar', length: '255', isNullable: false },
          { name: 'user_id', type: 'varchar', length: '36', isNullable: true },
          { name: 'action', type: 'varchar', length: '50', isNullable: false },
          { name: 'resource_type', type: 'varchar', length: '50', isNullable: false },
          { name: 'resource_id', type: 'varchar', length: '255', isNullable: false },
          { name: 'old_values', type: jsonType, isNullable: true },
          { name: 'new_values', type: jsonType, isNullable: true },
          { name: 'ip_address', type: 'varchar', length: '45', isNullable: false },
          { name: 'user_agent', type: 'text', isNullable: false },
          { name: 'timestamp', type: 'datetime',  },
        ],
      }),
      true
    );

    // Create indexes for audit_logs table
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_timestamp',
        columnNames: ['timestamp'],
      }),
    );
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_resource',
        columnNames: ['resource_type', 'resource_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('settings');
  }
}
