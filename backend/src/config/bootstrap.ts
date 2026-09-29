import logger from '../utils/logger';

function bootstrap(): void {
  // 1. Register all job handlers
  // jobs.forEach(job => queue.register(job.name, job));

  // 2. Register event listeners
  // registerListeners();

  // 3. Start cron scheduler
  // bootScheduler();

  logger.info('[Bootstrap] All services booted');
}

export default bootstrap;
