const prisma = require('../prisma');

exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: { alerts } });
  } catch (error) {
    next(error);
  }
};

exports.acknowledgeAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await prisma.alert.update({
      where: { id },
      data: { isAcknowledged: true }
    });

    res.status(200).json({ status: 'success', data: { alert } });
  } catch (error) {
    next(error);
  }
};

exports.getKPIs = async (req, res, next) => {
  try {
    const totalComplaints = await prisma.complaint.count();
    const activeAlerts = await prisma.alert.count({ where: { isAcknowledged: false } });
    
    const complaintsByStatus = await prisma.complaint.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalComplaints,
        activeAlerts,
        complaintsByStatus
      }
    });
  } catch (error) {
    next(error);
  }
};
