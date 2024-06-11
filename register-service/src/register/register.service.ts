import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices'; 
import { firstValueFrom } from 'rxjs'; 

@Injectable() 
export class RegisterService {
    constructor( 
      private prisma: PrismaService, 
      @Inject('MEMBERSHIP_SERVICE') private rabbitClient: ClientProxy 
    ) {}

    // Method to register a new user
    async register(user) {
        const findUser = await this.prisma.member.findUnique({ where: { email: user.email } }); // Find user by email in Prisma database

        if (findUser) {
          throw new BadRequestException('User already exists'); // Throw an error if user already exists
        }

        // Create a new member in the database
        let newMember =  await this.prisma.member.create({
            data: {
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
            }
          });

          // Subscribe the new member to a service using RabbitMQ
          const sub = await firstValueFrom(this.rabbitClient.send('member-subscribe', { newMember: newMember.id }));
          if (sub) return { statusCode: "201", message: "user registered successfully" }; // Return success message if subscription is successful
    }

    // Method to find a user by ID
    async findUserById(data){
        const user = await this.prisma.member.findUnique({ where: { id: data.id } }); // Find user by ID in Prisma database
        return user; // Return the user object
    }
}
