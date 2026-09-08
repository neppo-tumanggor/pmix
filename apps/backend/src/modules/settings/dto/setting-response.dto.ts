import { ApiProperty } from '@nestjs/swagger';

export class SettingResponseDto {
  @ApiProperty({
    description: 'Setting key',
    example: 'app_name',
  })
  key: string;

  @ApiProperty({
    description: 'Setting value',
    example: 'Mixer',
  })
  value: any;

  @ApiProperty({
    description: 'Whether the value is encrypted',
    example: false,
  })
  isEncrypted: boolean;

  @ApiProperty({
    description: 'Setting description',
    example: 'Application name',
    required: false,
  })
  description?: string;
}
