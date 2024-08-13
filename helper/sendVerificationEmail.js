const { resend } = require("../lib/resend");
const {VerificationEmail} = require("../emails/VerificationEmail.jsx")


const sendVerificationEmail = async (
  email,
  name,
  verifyCode
) => {
  try {
    await resend.emails.send({
      from: 'HiBuyShopping <noreply@hibuyshopping.com>',
      to: email,
      subject: 'HiBuyShopping | Verification code',
      react: VerificationEmail({ name, otp: verifyCode }),
    });
    return { success: true, message: 'Verification email send successfully' }
  } catch (emailError) {
    console.error(`Error sending verification email ${emailError}`)
    return { success: false, message: 'Failed to send verification email' }
  }
}

module.exports = { sendVerificationEmail }
