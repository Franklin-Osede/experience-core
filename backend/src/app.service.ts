import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getHealth() {
    const useTypeORM = this.configService.get('USE_TYPEORM') !== 'false';
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV') || 'development',
      database: useTypeORM ? 'connected' : 'in-memory',
      version: '1.0.0',
    };
  }
}
