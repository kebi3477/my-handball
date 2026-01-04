import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import type { WelcomeSubmissionDto } from './welcome.types';
import { DATABASE_POOL } from '../database/database.provider';

@Injectable()
export class WelcomeService implements OnModuleInit {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async onModuleInit() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS welcome_submissions (
        id SERIAL PRIMARY KEY,
        user_gender TEXT NOT NULL,
        age_group TEXT NOT NULL,
        team_gender TEXT NOT NULL,
        team_num INTEGER,
        team_name TEXT,
        team_logo_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  async saveSubmission(submission: WelcomeSubmissionDto): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO welcome_submissions (
        user_gender,
        age_group,
        team_gender,
        team_num,
        team_name,
        team_logo_url
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        submission.userGender,
        submission.ageGroup,
        submission.teamGender,
        submission.teamNum ?? null,
        submission.teamName ?? null,
        submission.teamLogoUrl ?? null,
      ],
    );
  }
}
