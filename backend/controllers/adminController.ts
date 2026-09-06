import { Request, Response } from 'express';
import { adminDb, adminAuth } from '../firebaseAdmin';

export const handleAdminLogin = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  
  const envUsername = process.env.ADMIN_USERNAME || 'admin';
  const envPassword = process.env.ADMIN_PASSWORD || 'password123';
  
  if (username === envUsername && password === envPassword) {
    try {
      // Create a specific custom token for the admin
      const adminUid = 'admin_user_' + envUsername;
      const customToken = await adminAuth.createCustomToken(adminUid, { admin: true });
      
      // Ensure the admin exists in the admins collection
      await adminDb.collection('admins').doc(adminUid).set({
        userId: adminUid,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      res.json({ token: customToken, adminUid });
    } catch (error: any) {
      console.error('Error minting admin token:', error);
      res.status(500).json({ error: 'Failed to mint admin token' });
    }
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
};
