const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) { 
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, isLocked: true, lockExpiry: true, organisationId: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists' });
    }

    if (user.isLocked) {
      if (user.lockExpiry && new Date() < user.lockExpiry) {
        return res.status(403).json({ message: `Account is locked until ${user.lockExpiry.toISOString()}` });
      } else if (user.lockExpiry && new Date() >= user.lockExpiry) {
        // Unlock user
        await prisma.user.update({
          where: { id: user.id },
          data: { isLocked: false, lockExpiry: null }
        });
        user.isLocked = false;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

module.exports = { authMiddleware, restrictTo };
