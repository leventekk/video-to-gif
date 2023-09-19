import { type JobResponseType } from '@schema/job';

export interface JobRunner {
  run(url: string, taskToRun: () => Promise<void>): Promise<JobResponseType>;
}
