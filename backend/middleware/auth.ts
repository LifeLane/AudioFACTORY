/**
@license
* SPDX-License-Identifier: Apache-2.0
* AudioFACTORY Authoritative Authentication Middleware
*/
import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../firebaseAdmin.js';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  isAnonymous: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Allow guest access; controller will handle via extractUserFromRequest
    return next();
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const isAnonymous = decodedToken.firebase?.sign_in_provider === 'anonymous';

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      isAnonymous,
    };

    return next();
  } catch (err: any) {
    console.error('[AuthMiddleware] ID token verification failed:', err.message);
    // Even if token is invalid, allow passing through as guest.
    // The quota system will restrict them as an unauthenticated guest.
    return next();
  }
}
