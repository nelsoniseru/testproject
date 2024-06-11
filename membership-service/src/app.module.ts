import { Module } from '@nestjs/common';
import { MembersModule } from './members/members.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(),MembersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
