const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'kavinath50@gmail.com',
    pass: 'etwskpbapoxbuidr'
  },
  tls: { rejectUnauthorized: false },
  family: 4 // Force IPv4
});
transporter.verify().then(() => console.log('IPv4 OK')).catch(e => console.error(e));
