import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

export const createLoggerConfig = (
  configService: ConfigService,
): WinstonModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const isProduction = nodeEnv === 'production';

  return {
    level: isProduction ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      isProduction
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, context, ...meta }) => {
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                const contextStr = context ? `[${String(context)}]` : '';
                const metaStr = Object.keys(meta).length
                  ? ` ${JSON.stringify(meta)}`
                  : '';
                return `${String(timestamp)} ${String(level)} ${contextStr} ${String(message)}${metaStr}`;
              },
            ),
          ),
    ),
    transports: [
      new winston.transports.Console({
        handleExceptions: true,
        handleRejections: true,
      }),
      // In production, also log to file
      ...(isProduction
        ? [
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              maxsize: 5242880, // 5MB
              maxFiles: 5,
            }),
            new winston.transports.File({
              filename: 'logs/combined.log',
              maxsize: 5242880, // 5MB
              maxFiles: 5,
            }),
          ]
        : []),
    ],
  };
};
