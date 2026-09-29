import cron from 'node-cron';
import retryFailedJobs from './tasks/retryFailedJobs';

interface ScheduledTask {
  signature: string;
  expression: string;
  task: () => Promise<unknown>;
}

const tasks: ScheduledTask[] = [
  { signature: 'retry:failed', expression: '*/5 * * * *', task: retryFailedJobs },
];

export function bootScheduler(): void {
  tasks.forEach(({ expression, task, signature }) => {
    if (!cron.validate(expression)) {
      console.error(`[Scheduler] Invalid cron: "${expression}" for ${signature}`);
      return;
    }
    cron.schedule(expression, async () => {
      console.log(`[Scheduler] Running: ${signature}`);
      try {
        const result = await task();
        if (result) console.log(`[Scheduler] ${signature} result:`, JSON.stringify(result, null, 2));
      } catch (err) {
        console.error(`[Scheduler] Task failed (${signature}):`, (err as Error).message);
      }
    });
    console.log(`[Scheduler] Registered: ${signature} → ${expression}`);
  });
  console.log(`[Scheduler] ${tasks.length} task(s) booted`);
}

export { tasks };
