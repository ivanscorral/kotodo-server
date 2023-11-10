// AuthenticationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { JWTStrategy, TokenContext } from '../helpers/JWTFactory';

const jwtStrategy = new JWTStrategy('mysecretkey');
const tokenContext = new TokenContext(jwtStrategy);

export interface RequestWithUserId extends Request {
    userId?: number;
}

export function authenticationMiddleware(req: RequestWithUserId, res: Response, next: NextFunction) {
  // Extract the JWT token from the request headers
  // Assuming the format is: Bearer <token>
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.', code: 401 });
  }
  const decoded = tokenContext.verifyToken(token);
  if (!decoded.valid) {
    return res.status(401).json({ error: decoded.error, code: 401 });
  }
  // Attach the user ID to the request object
  req.userId = decoded.userId;
  next();
} 
