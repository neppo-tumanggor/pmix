import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAuthTables20260907154627 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'email', type: 'varchar', length: '255', isUnique: true },
          { name: 'password', type: 'varchar', length: '255' },
          { name: 'name', type: 'varchar', length: '255' },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            default: "'user'",
          },
          {
            name: 'email_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'email_verification_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'email_verification_expires',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'password_reset_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'password_reset_expires',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'failed_login_attempts',
            type: 'integer',
            default: 0,
          },
          {
            name: 'locked_until',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_login',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            length: '255',
          },
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
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for users table
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );

    // Create refresh_tokens table
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'token', type: 'varchar', length: '255', isUnique: true },
          { name: 'user_id', type: 'uuid', isNullable: false },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'revoked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
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
      }),
      true,
    );

    // Create sessions table
    await queryRunner.createTable(
      new Table({
        name: 'sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'token', type: 'varchar', length: '255', isUnique: true },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'last_activity',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_at',
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
      }),
      true,
    );

    // Create password_history table
    await queryRunner.createTable(
      new Table({
        name: 'password_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'password_hash', type: 'varchar', length: '255' },
          {
            name: 'created_at',
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
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'idx_refresh_tokens_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'idx_sessions_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'password_history',
      new TableIndex({
        name: 'idx_password_history_user_id',
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('password_history');
    await queryRunner.dropTable('sessions');
    await queryRunner.dropTable('refresh_tokens');
    await queryRunner.dropTable('users');
  }
}
