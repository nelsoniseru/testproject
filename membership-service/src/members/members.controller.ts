import { Body, Controller, Post } from '@nestjs/common';
import { SubscribeDto } from 'src/dto/sub.dto';
import { MembersService } from './members.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('api')
export class MembersController {
    constructor(private readonly   membersService:MembersService) { }
    @Post('subscribe')
    async subscribe(@Body() subDto:SubscribeDto) {
        return this.membersService.subscribe(subDto);
      }
      @EventPattern('member-subscribe')
      memberSubscription(@Payload() data:number) {
      return this.membersService.memberSubscription(data);
    }
}
