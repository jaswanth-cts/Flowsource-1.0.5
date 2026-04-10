import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const env = configService.get('ENV');
  if (env === 'dev' || env === 'qa') {
    const config = new DocumentBuilder()
      .setTitle('FlowSource App')
      .setDescription('Node Application')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/', app, document);
  }

  await app.listen(3000);
}
bootstrap();