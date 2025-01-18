import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  getAddressCoordinates,
  getDistance,
} from '../controllers/maps.controller.js';

const router = Router();


router.get('/getAddressCoordinates', verifyJWT, getAddressCoordinates);

router.post('/calculateDistance', verifyJWT, getDistance);


export default router;
