import { Controller, Get, Query } from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { ScheduleResponse } from "./types";

@Controller("schedule")
export class ScheduleController {
  constructor(private readonly svc: ScheduleService) {}

  /**
   * GET /schedule?gender=W&season=2025&type=1
   */
  @Get()
  async getSchedule(
    @Query("gender") gender: "W" | "M" = "W",
    @Query("season") season = "2025",
    @Query("type") type = "1",
    @Query("month") month = "",
  ): Promise<ScheduleResponse> {
    return this.svc.fetchSchedule(gender, season, type, month);
  }
}
