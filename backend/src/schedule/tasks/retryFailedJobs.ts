import queue from '../../queue/Queue';

async function retryFailedJobs(): Promise<void> {
  await queue.retryFailed();
}

export default retryFailedJobs;
