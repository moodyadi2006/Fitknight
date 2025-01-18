import { MailtrapClient } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();
const TOKEN = process.env.MAILTRAP_TOKEN;

export const mailTrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: 'hello@demomailtrap.com',
  name: 'Fitknight',
};


