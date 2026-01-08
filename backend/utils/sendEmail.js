import nodemailer from 'nodemailer'

const sendEmail = async ({ to, subject, html }) => {
  if (!to) {
    throw new Error('sendEmail: missing recipient (to)')
  }

  console.log('📧 Sending email to:', to)

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

export default sendEmail
