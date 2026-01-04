import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ScheduleModule } from './schedule/schedule.module';
import { TeamModule } from './team/team.module';
import { RankingModule } from './ranking/ranking.module';
import { WelcomeModule } from './welcome/welcome.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, ScheduleModule, TeamModule, RankingModule, WelcomeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
