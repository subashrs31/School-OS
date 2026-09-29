import Job from '../models/job.model';
import FailedJob from '../models/failedJob.model';
import { JobPayload } from '../types';

interface JobEntry {
  _id: number;
  name: string;
  payload: JobPayload;
  priority: number;
  maxAttempts: number;
  attempts: number;
}

interface JobHandler {
  handle: (payload: JobPayload) => Promise<void>;
}

interface DispatchOptions {
  priority?: number;
  maxAttempts?: number;
  scheduledAt?: Date;
}

const PRIORITY = { HIGH: 1, NORMAL: 2, LOW: 3 } as const;

const jobHandlers: Record<string, JobHandler> = {};
const pending: JobEntry[] = [];

const register = (name: string, handler: JobHandler): void => {
  jobHandlers[name] = handler;
};

const dispatch = async (name: string, payload: JobPayload = {}, { priority = 2, maxAttempts = 3, scheduledAt }: DispatchOptions = {}): Promise<void> => {
  const doc = await Job.create({ name, payload, priority, maxAttempts, scheduledAt });
  pending.push({ _id: doc.id, name, payload, priority, maxAttempts, attempts: 0 });
  pending.sort((a, b) => a.priority - b.priority);
  void _drain();
};

let draining = false;

const _drain = async (): Promise<void> => {
  if (draining) return;
  draining = true;
  while (pending.length) {
    const job = pending.shift()!;
    await _run(job);
  }
  draining = false;
};

const _run = async (job: JobEntry): Promise<void> => {
  const handler = jobHandlers[job.name];
  if (!handler) { await _fail(job, `No handler registered for "${job.name}"`); return; }

  job.attempts++;
  await Job.update({ status: 'running', startedAt: new Date(), attempts: job.attempts }, { where: { id: job._id } });
  try {
    await handler.handle(job.payload);
    await Job.destroy({ where: { id: job._id } });
    console.log(`[Queue] ✓ ${job.name}`);
  } catch (err) {
    const error = err as Error;
    if (job.attempts < job.maxAttempts) {
      const delay = Math.pow(5, job.attempts) * 1000;
      console.error(`[Queue] ✗ ${job.name} attempt ${job.attempts}/${job.maxAttempts} — retrying in ${delay / 1000}s`);
      await Job.update({ status: 'pending', error: error.message }, { where: { id: job._id } });
      setTimeout(() => { pending.push(job); pending.sort((a, b) => a.priority - b.priority); void _drain(); }, delay);
    } else {
      await _fail(job, error.message);
    }
  }
};

const _fail = async (job: JobEntry, error: string): Promise<void> => {
  console.error(`[Queue] ✗ ${job.name} failed permanently — ${error}`);
  await FailedJob.create({ name: job.name, payload: job.payload, priority: job.priority, attempts: job.attempts, maxAttempts: job.maxAttempts, error, retryAfter: new Date(Date.now() + 60000) });
  await Job.destroy({ where: { id: job._id } });
};

const retryFailed = async (): Promise<void> => {
  const jobs = await FailedJob.findAll({ where: { resolved: false }, order: [['priority', 'ASC']] });
  for (const doc of jobs) {
    const handler = jobHandlers[doc.name];
    if (!handler) continue;
    try {
      await handler.handle(doc.payload);
      await doc.destroy();
      console.log(`[Queue] ✓ Retried ${doc.name} #${doc.id}`);
    } catch (err) {
      const error = err as Error;
      doc.attempts++;
      doc.error = error.message;
      doc.retryAfter = new Date(Date.now() + Math.pow(5, doc.attempts) * 1000);
      await doc.save();
      console.error(`[Queue] ✗ Retry failed ${doc.name} #${doc.id} — ${error.message}`);
    }
  }
};

export default { register, dispatch, retryFailed, PRIORITY };
