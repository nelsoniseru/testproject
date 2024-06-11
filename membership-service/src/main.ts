import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';





async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://127.0.0.1:5672'],
      queue: 'membership-queue',
       
    },
  });
 
  app.useGlobalPipes(new ValidationPipe());

  await app.startAllMicroservices();
  await app.listen(3002);

  
 
}

bootstrap();