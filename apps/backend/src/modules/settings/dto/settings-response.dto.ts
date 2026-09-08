import { ApiProperty } from '@nestjs/swagger';

export class SettingsResponseDto {
  @ApiProperty({
    description: 'Response data as key-value pairs',
    example: {
      app_name: 'Mixer',
      timezone: 'UTC',
      language: 'en',
    },
  })
  data: Record<string, any>;

  @ApiProperty({
    description: 'Response metadata',
    example: {
      category: 'general',
      lastUpdated: '2026-09-08T10:30:00.000Z',
    },
  })
  meta: {
    category: string;
    lastUpdated: string;
  };
}
