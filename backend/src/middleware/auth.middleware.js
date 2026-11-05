import { verifyToken } from '../utils/jwt.js';

function getCookieToken(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').filter(Boolean).map((part) => {
    const index = part.indexOf('=');
    const key = index >= 0 ? part.slice(0, index).trim() : part.trim();
    const value = index >= 0 ? part.slice(index + 1).trim() : '';
    return [key, decodeURIComponent(value)];
  }));
  return cookies.dalssi_token || null;
}

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = getCookieToken(req) || (header.startsWith('Bearer ') ? header.slice(7) : null);

  if (!token) return res.status(401).json({ message: 'Sesión no autenticada.' });

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Sesión inválida o expirada.' });
  }
}

export function authorizeUserType(type) {
  return (req, res, next) => {
    if (req.user?.tipo_usuario !== type) {
      return res.status(403).json({ message: 'No tiene permisos para acceder a esta interfaz.' });
    }
    next();
  };
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user?.puesto || !roles.includes(req.user.puesto)) {
      return res.status(403).json({ message: 'No tiene permisos para realizar esta acción.' });
    }
    next();
  };
}
