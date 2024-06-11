import { Body, Controller, Post, UsePipes,Request } from '@nestjs/common';
import { RegisterService } from './register.service';
import { MemberDto } from 'src/dto/member.dto';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller('api')
export class RegisterController {
    constructor(private readonly registerService:RegisterService) { }
    @Post('register')
    register(@Body() user:MemberDto, @Request() request) {
    
      return this.registerService.register(user);
    }
    @EventPattern('find-userbyid')
    findUserById(@Payload() data:number) {
      return this.registerService.findUserById(data);
    }
}
