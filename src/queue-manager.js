import { Logger } from './logger.js';

// In-memory queue for Render free tier (no Redis needed)
export class QueueManager {
  constructor(redisUrl) {
    this.logger = new Logger('queue');
    this.jobs = new Map();
    
    if (!redisUrl) {
      this.logger.info('Using in-memory queue (no Redis configured)');
    }
  }

  async addBatchJob(urls, instructions, selectors) {
    const jobId = Date.now().toString(36) + Math.random().toString(36).slice(2);
    
    // Store job and process immediately
    this.jobs.set(jobId, {
      id: jobId,
      status: 'processing',
      progress: 0,
      data: { urls, instructions, selectors },
      createdAt: new Date().toISOString()
    });

    this.logger.info(`Job ${jobId} added for ${urls.length} URLs`);
    return jobId;
  }

  async getJobStatus(jobId) {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      return { status: 'not_found' };
    }
    
    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      data: job.data,
      error: job.error,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn
    };
  }

  async getJobResults(jobId) {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      return { error: 'Job not found' };
    }
    
    return job.result || { status: job.status };
  }

  async close() {
    this.jobs.clear();
  }
}