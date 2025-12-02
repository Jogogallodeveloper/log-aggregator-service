import { IsString, IsNotEmpty, IsIn, IsOptional, IsObject } from 'class-validator';

export class CreateLogDto {
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @IsString()
  @IsIn(['INFO', 'WARN', 'ERROR', 'DEBUG'])
  level: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsObject()
  context?: any;

  @IsOptional()
  @IsString()
  requestId?: string;
}
