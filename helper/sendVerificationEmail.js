import { resend } from "../lib/resend";
import VerificationEmail from "../emails/VerificationEmail";


export async function sendVerificationEmail(
){
  try {
    await resend.emails.send({
      from: 'send@noreply.botax.me',
      to: email,
      subject: 'Feedback system | Verification code',
      react: VerificationEmail({username, otp: verifyCode}),
    });
    return { success: true, message: 'Verification email send successfully'}
  } catch (emailError) {
    console.error(`Error sending verification email ${emailError}`)
    return { success: false, message: 'Failed to send verification email'}
  }
}