import { MigrationInterface, QueryRunner, Table, TableIndex, TableColumn } from 'typeorm';

export class CreateSettingsAuditTables20260907120000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Create settings table
    await queryRunner.createTable(
      new Table({
        name: 'settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'tenant_id', type: 'varchar', length: '255', isNullable: false },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          { name: 'key', type: 'varchar', length: '100', isNullable: false },
          { name: 'value', type: 'jsonb', isNullable: false },
          { name: 'is_encrypted', type: 'boolean', default: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
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

    // Add check constraint for category
    await queryRunner.query(`
      ALTER TABLE settings
      ADD CONSTRAINT chk_settings_category
      CHECK (category IN (
        'general',
        'email',
        'sms',
        'whatsapp',
        'security',
        'notifications',
        'branding',
        'integrations'
      ))
    `);

    // Create trigger for updated_at auto-update on settings
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_settings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_settings_updated_at
      BEFORE UPDATE ON settings
      FOR EACH ROW
      EXECUTE FUNCTION update_settings_updated_at();
    `);

    // Create audit_logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'tenant_id', type: 'varchar', length: '255', isNullable: false },
          { name: 'user_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'action', type: 'varchar', length: '50', isNullable: false },
          { name: 'resource_type', type: 'varchar', length: '50', isNullable: false },
          { name: 'resource_id', type: 'varchar', length: '255', isNullable: false },
          { name: 'old_values', type: 'jsonb', isNullable: true },
          { name: 'new_values', type: 'jsonb', isNullable: true },
          { name: 'ip_address', type: 'varchar', length: '45', isNullable: false },
          { name: 'user_agent', type: 'text', isNullable: false },
          { name: 'timestamp', type: 'timestamp', default: 'now()' },
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
    // Drop trigger and function
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_settings_updated_at ON settings`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_settings_updated_at()`);

    // Drop audit_logs table
    await queryRunner.dropTable('audit_logs');

    // Drop settings table
    await queryRunner.dropTable('settings');

    // Drop extensions
    await queryRunner.query(`DROP EXTENSION IF EXISTS "pgcrypto"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
