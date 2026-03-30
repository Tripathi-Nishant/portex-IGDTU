const cron = require('node-cron');
const prisma = require('../prisma');
const { finalizeComplaintDecision } = require('../controllers/ethicsController');

const initCronJobs = () => {
  // 1. Check Deadlines - Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('[CRON] Running deadline checks');
    try {
      const pendingComplaints = await prisma.complaint.findMany({
        where: { status: 'PENDING' }
      });

      const now = new Date();
      for (const complaint of pendingComplaints) {
        if (new Date(complaint.deadline) < now) {
          await prisma.complaint.update({
            where: { id: complaint.id },
            data: { isOverdue: true }
          });
          await finalizeComplaintDecision(complaint.id);
        }
      }
    } catch (e) {
      console.error('[CRON] Deadline check failed:', e);
    }
  });

  // 2. Alert Engine - Daily at Midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running alert detection engine');
    try {
      const accusedClusters = await prisma.complaint.groupBy({
        by: ['accusedName', 'accusedDepartment'],
        where: { status: { not: 'UNSUBSTANTIATED' } },
        _count: { id: true }
      });

      for (const cluster of accusedClusters) {
        if (!cluster.accusedName) continue;
        
        const count = cluster._count.id;
        let severity = null;
        let type = 'ACCUSED_THRESHOLD';
        let threshold = 0;

        if (count >= 7) {
          severity = 'CRITICAL';
          threshold = 7;
        } else if (count >= 5) {
          severity = 'HIGH';
          threshold = 5;
        } else if (count >= 3) {
          severity = 'MEDIUM';
          threshold = 3;
        }

        if (severity) {
          const existingAlert = await prisma.alert.findFirst({
            where: {
              accusedName: cluster.accusedName,
              thresholdReached: { gte: threshold }
            }
          });

          if (!existingAlert) {
            await prisma.alert.create({
              data: {
                type,
                severity,
                description: `High number of complaints (${count}) against ${cluster.accusedName}`,
                accusedName: cluster.accusedName,
                accusedDepartment: cluster.accusedDepartment,
                thresholdReached: threshold
              }
            });
          }
        }
      }
    } catch (e) {
      console.error('[CRON] Alert engine failed:', e);
    }
  });

  // 3. Auto lock lifts - Daily at 1 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('[CRON] Checking account lock expiries');
    try {
      const now = new Date();
      await prisma.user.updateMany({
        where: {
          isLocked: true,
          lockExpiry: { lte: now }
        },
        data: {
          isLocked: false,
          lockExpiry: null
        }
      });
    } catch (e) {
      console.error('[CRON] Lock lift check failed:', e);
    }
  });

  console.log('Cron jobs initialized.');
};

module.exports = initCronJobs;
