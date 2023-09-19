import { type DefaultJobResponseType, type JobResponseType } from '../../schema/job';

export interface JobEntry extends Omit<DefaultJobResponseType, 'jobId'> {
  url: string
}

export interface JobCache {
  create(jobId: string, data: JobEntry): Promise<DefaultJobResponseType>;
  get(jobId: string): Promise<Nullable<DefaultJobResponseType>>;
  update(jobId: string, data: Partial<JobResponseType>): Promise<void>;
  findByUrl(url: string): Promise<Nullable<JobResponseType>>;
}
