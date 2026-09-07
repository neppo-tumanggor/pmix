import { IsString, IsNumber, IsOptional, IsBoolean, MaxLength, Min, Max } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(999999)
  stock?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
