import { Static, Type } from '@sinclair/typebox';

const createdJobStatus = Type.Literal('created');
const runningJobStatus = Type.Literal('running');
const failedJobStatus = Type.Literal('failed');
const completedJobStatus = Type.Literal('completed');

export const JobStatus = Type.Union([createdJobStatus, runningJobStatus, failedJobStatus, completedJobStatus]);

const jobId = Type.String();

const FailedJobResponse = Type.Object({
  jobId,
  status: failedJobStatus,
  reason: Type.String(),
});

const CompletedJobResponse = Type.Object({
  jobId,
  status: completedJobStatus,
  data: Type.Object({
    url: Type.String()
  }),
});

const DefaultJobResponse = Type.Object({
  jobId,
  status: Type.Union([createdJobStatus, runningJobStatus]),
});

export const JobResponse = Type.Union([FailedJobResponse, CompletedJobResponse, DefaultJobResponse]);

export type Status = Static<typeof JobStatus>;

export type DefaultJobResponseType = Static<typeof DefaultJobResponse>;
export type FailedJobResponseType = Static<typeof FailedJobResponse>;
export type JobResponseType = Static<typeof JobResponse>;
