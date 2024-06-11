import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
   
      {
        name: 'REGISTER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://127.0.0.1:5672'],
          queue: 'register-queue',
          queueOptions: {
            durable: true, 
          },
       
        },
      },
     
    ]),
  ],
  providers: [MembersService,PrismaService],
  controllers:[MembersController]
})
export class MembersModule {}
