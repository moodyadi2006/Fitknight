import express from 'express';
import { saveMessage, fetchMessages, saveBuddyMessage, fetchBuddyMessages } from '../controllers/message.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/saveMessage', verifyJWT, saveMessage);
router.get('/fetchMessages', verifyJWT, fetchMessages);
router.post('/saveBuddyMessage', verifyJWT, saveBuddyMessage);
router.get('/fetchBuddyMessages', verifyJWT, fetchBuddyMessages);
export default router;