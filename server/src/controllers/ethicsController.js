const prisma = require('../prisma');

exports.submitVote = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { decision } = req.body;
    const userId = req.user.id;

    if (!['SUBSTANTIATED', 'UNSUBSTANTIATED', 'INCONCLUSIVE'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision' });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { votes: true }
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'PENDING') {
      return res.status(400).json({ message: 'Complaint is already closed' });
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        complaintId_userId: { complaintId, userId }
      }
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted on this complaint' });
    }

    const vote = await prisma.vote.create({
      data: { complaintId, userId, decision }
    });

    const updatedComplaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { votes: true }
    });

    const totalEthicsMembers = await prisma.user.count({ where: { role: 'ETHICS_MEMBER' } });
    const totalVotes = updatedComplaint.votes.length;

    if (totalVotes >= totalEthicsMembers && totalEthicsMembers > 0) {
      await finalizeComplaintDecision(complaintId);
    }

    res.status(201).json({
      status: 'success',
      data: { vote }
    });

  } catch (error) {
    next(error);
  }
};

const finalizeComplaintDecision = async (complaintId) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: { votes: true, anonMapping: true }
  });
  
  if(complaint.status !== 'PENDING') return;

  const voteCounts = { SUBSTANTIATED: 0, UNSUBSTANTIATED: 0, INCONCLUSIVE: 0 };
  for (const vote of complaint.votes) {
    voteCounts[vote.decision]++;
  }

  let finalDecision = 'INCONCLUSIVE';
  let maxVotes = 0;

  for (const [decision, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      finalDecision = decision;
    } else if (count === maxVotes && maxVotes > 0) {
      finalDecision = 'INCONCLUSIVE'; 
    }
  }

  // Fallback if no votes
  if (maxVotes === 0) finalDecision = 'INCONCLUSIVE';

  await prisma.complaint.update({
    where: { id: complaintId },
    data: { status: finalDecision }
  });

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const fastResolutionDelay = 3 * 24 * 60 * 60 * 1000; 
  const isFast = (new Date() - new Date(complaint.createdAt)) < fastResolutionDelay;

  for (const vote of complaint.votes) {
    let scoreToAdd = 10;
    let isMajority = false;

    if (vote.decision === finalDecision && finalDecision !== 'INCONCLUSIVE') {
      scoreToAdd += 15;
      isMajority = true;
    }

    if (isFast) scoreToAdd += 20;

    await prisma.ethicsScore.upsert({
      where: {
        userId_month_year: { userId: vote.userId, month, year }
      },
      update: {
        score: { increment: scoreToAdd },
        fastResolutionsCount: isFast ? { increment: 1 } : undefined,
        majorityMatchesCount: isMajority ? { increment: 1 } : undefined
      },
      create: {
        userId: vote.userId,
        month,
        year,
        score: scoreToAdd,
        fastResolutionsCount: isFast ? 1 : 0,
        majorityMatchesCount: isMajority ? 1 : 0
      }
    });
  }

  // Misuse Prevention
  if (finalDecision === 'UNSUBSTANTIATED' && complaint.anonMapping) {
    const misusedUserId = complaint.anonMapping.userId;

    const misuseRecord = await prisma.misuseLog.upsert({
      where: { userId: misusedUserId },
      update: { count: { increment: 1 } },
      create: { userId: misusedUserId, count: 1 }
    });

    if (misuseRecord.count >= 4) {
      const lockExpiry = new Date();
      lockExpiry.setDate(lockExpiry.getDate() + 30);
      await prisma.user.update({
        where: { id: misusedUserId },
        data: { isLocked: true, lockExpiry }
      });
    }
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const scores = await prisma.ethicsScore.findMany({
      where: { month, year },
      orderBy: { score: 'desc' },
      include: {
        user: { select: { email: true } }
      }
    });

    res.status(200).json({
      status: 'success',
      data: { leaderboard: scores }
    });
  } catch (error) {
    next(error);
  }
};

exports.finalizeComplaintDecision = finalizeComplaintDecision;
