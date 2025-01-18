import { mailTrapClient, sender } from './mailTrap.config.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {
  JOIN_REQUEST_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from './emailTemplates.js';

export const sendVerificationEmail = asyncHandler(
  async (email, verificationToken) => {
    const recipent = [{ email }];
    try {
      const response = await mailTrapClient.send({
        from: sender,
        to: recipent,
        subject: 'Verify your Email',
        html: VERIFICATION_EMAIL_TEMPLATE.replace(
          '{verificationToken}',
          verificationToken,
        ),
        category: 'Verification Email',
      });

      console.log('Email Sent Successfully ', response);
    } catch (error) {
      throw new ApiError(400, error.message);
    }
  },
);

export const joinRequestEmail = asyncHandler(
  async (fullName, groupName, organizerMail) => {
    const recipent = [{ organizerMail }];
    try {
      const response = await mailTrapClient.send({
        from: sender,
        to: recipent,
        subject: 'Join Request',
        html: JOIN_REQUEST_TEMPLATE.replace('{fullName}', fullName)
          .replace('{groupName}', groupName)
          .replace('{username}', username)
          .replace('{email}', email),
        category: 'Join Request',
      });

      console.log('Email Sent Successfully ', response);
    } catch (error) {
      throw new ApiError(400, error.message);
    }
  },
);
