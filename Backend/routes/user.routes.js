import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import {
  getAnyProfile,
  getPendingRequests,
  getProfileWithUsername,
  getUserGroups,
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateAccountDetails,
  updateLocation,
  updateProfile,
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Corrected route definition
router.post('/register', upload.single('profile'), registerUser);

router.post('/login', loginUser);

router.get('/profile', verifyJWT, getUserProfile);

router.post('/logout', verifyJWT, logoutUser);

router.patch('/updateAccountDetails', verifyJWT, updateAccountDetails);

router.patch(
  '/updateProfile',
  verifyJWT,
  upload.single('profile'),
  updateProfile,
);

router.get('/myGroups', verifyJWT, getUserGroups);

router.get('/getPendingRequests', verifyJWT, getPendingRequests);

router.get('/getAnyProfile/:id', verifyJWT, getAnyProfile);

router.get('/getProfileWithUsername', verifyJWT, getProfileWithUsername);

router.post('/updateLocation', verifyJWT, updateLocation);

export default router;
