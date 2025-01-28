import crypto from 'crypto';
import Email from 'email-templates';
import nodemailer from 'nodemailer';

if (process.env.AWS_SES_REGION) {
  process.env.SMTP_HOST = `email-smtp.${process.env.AWS_SES_REGION}.amazonaws.com`;
  process.env.SMTP_PORT = 587;
  process.env.SMTP_USER = process.env.AWS_SES_ACCESS_KEY_ID;
  // convert secret access key to SMTP password
  // based on pseudocode at: https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html#smtp-credentials-convert
  const date = '11111111';
  const service = 'ses';
  const terminal = 'aws4_request';
  const message = 'SendRawEmail';
  const version = 4;
  let signature;
  signature = crypto
    .createHmac('sha256', `AWS4${process.env.AWS_SES_SECRET_ACCESS_KEY}`, {
      encoding: 'utf8',
    })
    .update(date)
    .digest();
  signature = crypto
    .createHmac('sha256', signature)
    .update(process.env.AWS_SES_REGION)
    .digest();
  signature = crypto.createHmac('sha256', signature).update(service).digest();
  signature = crypto.createHmac('sha256', signature).update(terminal).digest();
  signature = crypto.createHmac('sha256', signature).update(message).digest();
  signature = Buffer.concat([new Uint8Array([version]), signature]);
  process.env.SMTP_PASS = signature.toString('base64');
}

const options = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const transport = nodemailer.createTransport(options);

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
  juice: false,
});

async function send (options) {
  options.locals ||= {};
  options.locals._layout = {
    logoUrl: `${process.env.BASE_URL}/logo.svg`,
  };
  return mailer.send(options);
}

export default { send };
