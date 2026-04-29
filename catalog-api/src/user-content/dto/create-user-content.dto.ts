import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ContentType, ContentStatus } from '@prisma/client';

export class CreateUserContentDto {
  @ApiProperty({ example: '69478', description: 'TMDb ID (String)' })
  @IsString()
  @IsNotEmpty()
  tmdbId: string;

  @ApiProperty({ enum: ContentType, example: 'TV' })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiProperty({ enum: ContentStatus, example: 'WATCHED' })
  @IsEnum(ContentStatus)
  status: ContentStatus;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5, required: false })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({ example: 'O Conto da Aia', required: false })
  @IsString()
  @IsOptional()
  title?: string;
}
