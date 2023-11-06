import jwt, { JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
export interface TokenStrategy {
  createToken(userId: number, expiresIn: string): string;
  verifyToken(token: string): { valid: boolean; error?: string; userId?: number };
}

export class JWTStrategy implements TokenStrategy {
  private secret: string;
  
  constructor(secret: string) {
    this.secret = secret;
  }
  
  createToken(userId: number, expiresIn: string): string {
    const payload = {
      userId,
      jti: uuidv4(),
    };
    const options = {
      expiresIn,
    };
    return jwt.sign(payload, this.secret, options);
  }
  
  verifyToken(token: string): { valid: boolean; error?: string; userId?: number } {
    try {
      const decoded = jwt.verify(token, this.secret) as jwt.JwtPayload;
      return { valid: true, userId: decoded.userId };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return { valid: false, error: 'Token expired' };
      } else if (error instanceof JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' };
      } else {
        return { valid: false, error: 'Token verification failed' };
      }
    }
  }
}


export class TokenContext {
  private strategy: TokenStrategy;
  
  constructor(strategy: TokenStrategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy: TokenStrategy) {
    this.strategy = strategy;
  }
  
  createToken(userId: number, expiresIn: string): string {
    return this.strategy.createToken(userId, expiresIn);
  }
  
  verifyToken(token: string): { valid: boolean; error?: string; userId?: number } {
    return this.strategy.verifyToken(token);
  } 
}
