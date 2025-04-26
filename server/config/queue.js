const Queue = require('bull');
require('dotenv').config();

const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  }
};

// Create queues for different job types
const emailQueue = new Queue('email', redisConfig);
const notificationQueue = new Queue('notification', redisConfig);

// Error handling for queues
[emailQueue, notificationQueue].forEach(queue => {
  queue.on('error', (error) => {
    console.error(`Queue ${queue.name} error:`, error);
  });

  queue.on('failed', (job, error) => {
    console.error(`Job ${job.id} in queue ${queue.name} failed:`, error);
  });
});

module.exports = {
  emailQueue,
  notificationQueue
}; 