const app = require('./app');
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

const initCronJobs = require('./src/jobs/scheduler');

async function startServer() {
  try {
    // Optional: await prisma.$connect();
    initCronJobs();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
