import { IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class UpdateSettingItemDto {
  @ApiProperty({
    description: 'Setting value',
    example: 'Mixer',
  })
  @IsString()
  value: string;

  @ApiProperty({
    description: 'Whether the value should be encrypted',
    example: false,
    required: false,
  })
  @IsOptional()
  isEncrypted?: boolean;
}

export class UpdateSettingsDto {
  @ApiProperty({
    description: 'Settings object with key-value pairs',
    example: {
      app_name: 'Mixer',
      timezone: 'UTC',
    },
    type: 'object',
  })
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => UpdateSettingItemDto)
  data: Record<string, UpdateSettingItemDto>;
}
