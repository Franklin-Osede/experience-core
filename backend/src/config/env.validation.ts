import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 5555;

  // Database
  // Only required if USE_TYPEORM is not 'false'
  @ValidateIf((o) => o.USE_TYPEORM !== 'false')
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  DB_HOST?: string;

  @ValidateIf((o) => o.USE_TYPEORM !== 'false')
  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  DB_PORT?: number = 5432;

  @ValidateIf((o) => o.USE_TYPEORM !== 'false')
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  DB_USERNAME?: string;

  @ValidateIf((o) => o.USE_TYPEORM !== 'false')
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  DB_PASSWORD?: string;

  @ValidateIf((o) => o.USE_TYPEORM !== 'false')
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  DB_DATABASE?: string;

  @IsOptional()
  DB_SYNCHRONIZE: string = 'false';

  @IsOptional()
  DB_LOGGING: string = 'false';

  @IsOptional()
  DB_MIGRATIONS_RUN: string = 'false';

  // JWT
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '7d';

  // Application
  @IsOptional()
  USE_TYPEORM: string = 'true';

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = '*';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
