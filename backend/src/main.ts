import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Versioning: /api/v1/...
  app.setGlobalPrefix('api/v1');

  // Validation Pipe (Global)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger / OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('Experience Core API')
    .setDescription('The House/Afrobeats Event Platform API')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Events')
    .addTag('Finance')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5555;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger Docs available at: ${await app.getUrl()}/api/docs`);
}
void bootstrap();
