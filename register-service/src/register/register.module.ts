import { Module } from '@nestjs/common';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { PrismaService } from '../prisma/prisma.service'
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports:[
    ClientsModule.register([
      {
        name: 'MEMBERSHIP_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://127.0.0.1:5672'],
          queue: 'membership-queue',
       
        },
      },
    ]),
  ],
  controllers: [RegisterController],
  providers: [RegisterService,PrismaService]
})
export class RegisterModule {}
