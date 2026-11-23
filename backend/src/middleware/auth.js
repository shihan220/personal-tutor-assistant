import jwt from 'jsonwebtoken';

// auth check
export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid User Login' });
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role, scope: payload.scope };
    next();
  } catch {
    return res.status(401).json({ error: 'JWT Token Expired' });
  }
}

// role check
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Role Not Allowed For Request' });
    }
    next();
  };
}