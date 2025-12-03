import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

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
