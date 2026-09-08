import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from 'typeorm';

export class AddUserProfileFields20260908000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'avatar_url',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'bio',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone_verified',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'date_of_birth',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'gender',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'address',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'city',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'country',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'timezone',
        type: 'varchar',
        length: '50',
        default: "'UTC'",
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'language',
        type: 'varchar',
        length: '10',
        default: "'en'",
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'theme',
        type: 'varchar',
        length: '20',
        default: "'light'",
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'metadata',
        type: 'jsonb',
        default: "'{}'",
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '20',
        default: "'active'",
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_role',
        columnNames: ['role'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_tenant_role',
        columnNames: ['tenant_id', 'role'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_tenant_status',
        columnNames: ['tenant_id', 'status'],
      }),
    );

    // Create user_preferences table
    await queryRunner.createTable(
      new Table({
        name: 'user_preferences',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'tenant_id', type: 'varchar', length: '255', isNullable: false },
          { name: 'email_notifications', type: 'boolean', default: true },
          { name: 'sms_notifications', type: 'boolean', default: false },
          { name: 'push_notifications', type: 'boolean', default: true },
          { name: 'marketing_emails', type: 'boolean', default: false },
          { name: 'dashboard_layout', type: 'jsonb', default: "'{}'" },
          { name: 'sidebar_collapsed', type: 'boolean', default: false },
          {
            name: 'preferred_language',
            type: 'varchar',
            length: '10',
            default: "'en'",
          },
          {
            name: 'preferred_timezone',
            type: 'varchar',
            length: '50',
            default: "'UTC'",
          },
          { name: 'profile_public', type: 'boolean', default: false },
          { name: 'show_email', type: 'boolean', default: false },
          { name: 'show_phone', type: 'boolean', default: false },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          },
        ],
        uniques: [{ columnNames: ['user_id'] }],
      }),
      true,
    );

    // Create user_metadata table
    await queryRunner.createTable(
      new Table({
        name: 'user_metadata',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'tenant_id', type: 'varchar', length: '255', isNullable: false },
          { name: 'key', type: 'varchar', length: '100', isNullable: false },
          { name: 'value', type: 'jsonb', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          },
        ],
        uniques: [{ columnNames: ['user_id', 'key'] }],
      }),
      true,
    );

    // Create indexes for metadata
    await queryRunner.createIndex(
      'user_metadata',
      new TableIndex({
        name: 'idx_user_metadata_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('user_metadata', 'idx_user_metadata_tenant_id');
    await queryRunner.dropIndex('users', 'idx_users_tenant_status');
    await queryRunner.dropIndex('users', 'idx_users_tenant_role');
    await queryRunner.dropIndex('users', 'idx_users_role');
    await queryRunner.dropIndex('users', 'idx_users_status');

    // Drop tables
    await queryRunner.dropTable('user_metadata');
    await queryRunner.dropTable('user_preferences');

    // Remove columns from users
    const columnsToRemove = [
      'avatar_url',
      'bio',
      'phone',
      'phone_verified',
      'date_of_birth',
      'gender',
      'address',
      'city',
      'country',
      'timezone',
      'language',
      'theme',
      'metadata',
      'status',
    ];

    for (const col of columnsToRemove) {
      await queryRunner.dropColumn('users', col);
    }
  }
}
