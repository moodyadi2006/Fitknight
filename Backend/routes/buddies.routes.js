import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  getAllUsers,
  getBuddyStatus,
  undoRequest,
  getPendingRequests,
  getRequestUserId,
} from '../controllers/buddies.controller.js';
import { approveRequest } from '../controllers/buddies.controller.js';
import { rejectRequest } from '../controllers/buddies.controller.js';
import { createBuddy } from '../controllers/buddies.controller.js';
import { getApprovedBuddies } from '../controllers/buddies.controller.js';
import { search } from '../controllers/buddies.controller.js';

const router = express.Router();

router.get('/getAllUsers', verifyJWT, getAllUsers);
router.get('/getBuddyStatus', verifyJWT, getBuddyStatus);
router.post('/undoRequest', verifyJWT, undoRequest);
router.get('/getPendingRequests', verifyJWT, getPendingRequests);
router.post('/approveRequest/:id', verifyJWT, approveRequest);
router.post('/rejectRequest/:id', verifyJWT, rejectRequest);
router.post('/createBuddy', verifyJWT, createBuddy);
router.get('/getApprovedBuddies', verifyJWT, getApprovedBuddies )
router.get('/search', verifyJWT, search);
router.get('/getRequestUserId', verifyJWT, getRequestUserId);

export default router;
