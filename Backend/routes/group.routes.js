import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import {
  getAllGroups,
  getRequestResult,
  getRequests,
  handleApprove,
  handleReject,
  registerGroup,
  sendRequest,
  undoRequest,
  updateMembersCount,
  updateMembers,
  getUserStatus,
  updateGroupDetails,
  getGroupProfile,
  updateGroupImage,
  search,
} from '../controllers/fitnessGroup.controller.js';

const router = Router();

router.post('/register', verifyJWT, upload.single('groupImage'), registerGroup);

router.get('/getAllGroups', verifyJWT, getAllGroups);

router.post('/sendRequest', verifyJWT, sendRequest);

router.post('/undoRequest', verifyJWT, undoRequest);

router.get('/getRequests/:id', verifyJWT, getRequests);

router.post('/approveRequest/:id', verifyJWT, handleApprove);

router.post('/rejectRequest/:id', verifyJWT, handleReject);

router.post('/getRequestResult', verifyJWT, getRequestResult);

router.post('/updateMembersCount', verifyJWT, updateMembersCount);

router.post('/updateMembers', verifyJWT, updateMembers);

router.get('/getUserStatus', verifyJWT, getUserStatus);

router.patch('/updateGroupDetails', verifyJWT, updateGroupDetails);

router.get('/search', verifyJWT, search);

router.patch(
  '/updateGroupImage',
  verifyJWT,
  upload.single('groupImage'),
  updateGroupImage
);

router.get('/getGroupProfile', verifyJWT, getGroupProfile);
export default router;
