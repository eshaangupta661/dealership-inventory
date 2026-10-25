
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://dealership-inventory-eshaan661-s-projects2.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    credentials: false,
  });

  configureApp(app);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
