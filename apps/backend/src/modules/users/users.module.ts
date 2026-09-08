import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserMetadataService } from './services/user-metadata.service';
import { UserRepository } from './repositories/user.repository';
import { UserPreferencesRepository } from './repositories/user-preferences.repository';
import { UserMetadataRepository } from './repositories/user-metadata.repository';
import { User } from '../../auth/entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { UserMetadata } from './entities/user-metadata.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserPreferences,
      UserMetadata,
    ]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserPreferencesService,
    UserMetadataService,
    UserRepository,
    UserPreferencesRepository,
    UserMetadataRepository,
  ],
  exports: [
    UsersService,
    UserPreferencesService,
    UserMetadataService,
  ],
})
export class UsersModule {}
