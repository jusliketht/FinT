const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);

      // Get user from token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });

      if (!user) {
        return res.status(401).json({ 
          message: 'User not found',
          error: 'User associated with token no longer exists'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth Error:', {
        error: error.message,
        token: token ? `${token.slice(0, 10)}...` : 'No token',
        type: error.name
      });
      
      return res.status(401).json({ 
        message: 'Not authorized',
        error: error.message
      });
    }
  } else if (!token) {
    return res.status(401).json({ 
      message: 'Not authorized, no token provided',
      error: 'Missing Authorization header or Bearer token'
    });
  }
};

// Middleware to check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Not authorized to access this resource'
      });
    }
    next();
  };
};

module.exports = { protect, authorize }; 