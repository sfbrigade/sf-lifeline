import Email from 'email-templates';
import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const mailer = new Email({
  message: {
    from: process.env.MAILER_FROM,
  },
  send: true,
  transport,
  views: {
    options: {
      extension: 'ejs',
    },
  },
});

export default mailer;
