const prisma = require('../prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, organisationName, role } = req.body;

    if (!email || !password || !organisationName) {
      return res.status(400).json({ message: 'Please provide email, password, and organisationName' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const cleanDomain = email.split('@')[1] || 'example.com';
    let org = await prisma.organisation.findUnique({ where: { domain: cleanDomain } });
    
    if (!org) {
      org = await prisma.organisation.create({
        data: {
          name: organisationName,
          domain: cleanDomain
        }
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const allowedRoles = ['EMPLOYEE', 'ETHICS_MEMBER', 'ADMIN'];
    const assignedRole = allowedRoles.includes(role) ? role : 'EMPLOYEE';

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: assignedRole,
        organisationId: org.id
      },
      select: {
        id: true,
        email: true,
        role: true,
        organisationId: true
      }
    });

    const token = signToken(newUser.id);

    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser }
    });

  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    if (user.isLocked) {
      if (user.lockExpiry && new Date() < user.lockExpiry) {
        return res.status(403).json({ message: `Account is locked until ${user.lockExpiry.toISOString()}` });
      }
    }

    const token = signToken(user.id);

    res.status(200).json({
      status: 'success',
      token,
      data: { 
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          organisationId: user.organisationId
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, isLocked: true, organisation: true }
    });

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};
