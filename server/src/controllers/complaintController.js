const prisma = require('../prisma');
const crypto = require('crypto');

// Generate short alphanumeric tracking code
const generateTrackingCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
};

exports.submitComplaint = async (req, res, next) => {
  try {
    const { title, description, incidentDate, incidentLocation, accusedName, accusedDepartment, severity } = req.body;
    const userId = req.user.id;

    if (!title || !description || !incidentDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const trackingCode = generateTrackingCode();

    // Deadline is 7 days from now
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);

    // Create complaint strictly without userId
    const complaint = await prisma.complaint.create({
      data: {
        trackingCode,
        title,
        description,
        incidentDate: new Date(incidentDate),
        incidentLocation,
        accusedName,
        accusedDepartment,
        severity: severity || 'MEDIUM',
        deadline,
        evidence: {
          create: req.files ? req.files.map(file => ({
            fileUrl: `/uploads/${file.filename}`,
            fileType: file.mimetype
          })) : []
        }
      },
      include: {
        evidence: true
      }
    });

    // Create AnonMapping separately for misuse tracking
    await prisma.anonMapping.create({
      data: {
        complaintId: complaint.id,
        userId: userId,
      }
    });

    res.status(201).json({
      status: 'success',
      data: {
        trackingCode, // ONLY return tracking code to the reporter
        message: 'Complaint submitted successfully. Please save your tracking code.'
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.getComplaints = async (req, res, next) => {
  try {
    const complaints = await prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: { evidence: true }
    });

    res.status(200).json({
      status: 'success',
      results: complaints.length,
      data: { complaints }
    });
  } catch (error) {
    next(error);
  }
};

const formatVotes = (votes = []) => {
  const counts = {
    SUBSTANTIATED: 0,
    UNSUBSTANTIATED: 0,
    INCONCLUSIVE: 0,
    total: votes.length
  };
  votes.forEach(v => {
    if (counts[v.decision] !== undefined) {
      counts[v.decision]++;
    }
  });
  return counts;
};

exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: { evidence: true, votes: true }
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const voteStats = formatVotes(complaint.votes);

    res.status(200).json({
      status: 'success',
      data: { 
        complaint,
        voteStats
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.trackComplaint = async (req, res, next) => {
  try {
    const { trackingCode } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { trackingCode },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        deadline: true,
        isOverdue: true
      }
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Invalid tracking code' });
    }

    const votes = await prisma.vote.findMany({
      where: { complaintId: complaint.id }
    });

    const voteStats = formatVotes(votes);

    res.status(200).json({
      status: 'success',
      data: { 
        complaint,
        voteStats
      }
    });
  } catch (error) {
    next(error);
  }
};
