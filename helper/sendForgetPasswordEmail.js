const { resend } = require("../lib/resend.js");
const { EmailForgetPassword } = require("../emails/EmailForgetPassword.jsx");


const sendForgetPasswordEmail = async (
  email,
  name,
  verifyCode
) => {
  try {
    await resend.emails.send({
      from: 'HiBuyShopping <support@hibuyshopping.com>',
      to: email,
      subject: 'HiBuyShopping | Verification code',
      react: EmailForgetPassword({ name, otp: verifyCode }),
    });
    return { success: true, message: 'Verification email send successfully' }
  } catch (emailError) {
    console.error(`Error sending verification email ${emailError}`)
    return { success: false, message: 'Failed to send verification email' }
  }
}

module.exports = { sendForgetPasswordEmail }
