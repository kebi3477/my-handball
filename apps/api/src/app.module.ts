import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ScheduleModule } from './schedule/schedule.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [ScheduleModule, TeamModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
