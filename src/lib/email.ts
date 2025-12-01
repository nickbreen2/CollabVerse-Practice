import * as brevo from '@getbrevo/brevo'
import { getAppBaseUrl } from './appUrl'

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ''
)

interface SendEmailParams {
  to: string | string[]
  subject: string
  htmlContent: string
  textContent?: string
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  htmlContent,
  textContent,
  cc,
  bcc,
  replyTo,
}: SendEmailParams) {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    // Convert to array if single email
    sendSmtpEmail.to = Array.isArray(to)
      ? to.map((email) => ({ email }))
      : [{ email: to as string }]

    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = htmlContent
    sendSmtpEmail.textContent =
      textContent || htmlContent.replace(/<[^>]*>/g, '')

    sendSmtpEmail.sender = {
      email: process.env.BREVO_FROM_EMAIL || 'noreply@collablink.com',
      name: process.env.BREVO_FROM_NAME || 'CollabLink',
    }

    if (cc) {
      sendSmtpEmail.cc = Array.isArray(cc)
        ? cc.map((email) => ({ email }))
        : [{ email: cc as string }]
    }

    if (bcc) {
      sendSmtpEmail.bcc = Array.isArray(bcc)
        ? bcc.map((email) => ({ email }))
        : [{ email: bcc as string }]
    }

    if (replyTo) {
      sendSmtpEmail.replyTo = { email: replyTo }
    }

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    return { success: true, messageId: result.body.messageId }
  } catch (error) {
    console.error('Brevo email error:', error)
    throw new Error('Failed to send email')
  }
}

// Password Reset Email
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string
) {
  const baseUrl = getAppBaseUrl()
  const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Reset Your Password</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hi${userName ? ` ${userName}` : ''},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - CollabLink',
    htmlContent,
  })
}

// Collab Request Email (to creator)
export async function sendCollabRequestEmailToCreator(
  creatorEmail: string,
  creatorName: string,
  senderName: string,
  senderEmail: string,
  brandName?: string,
  budget?: number,
  description?: string,
  links?: string[]
) {
  const baseUrl = getAppBaseUrl()

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">New Collaboration Request</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hi ${creatorName},</p>
          <p>You've received a new collaboration request!</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Request Details</h3>
            <p><strong>From:</strong> ${senderName}</p>
            <p><strong>Email:</strong> ${senderEmail}</p>
            ${brandName ? `<p><strong>Brand:</strong> ${brandName}</p>` : ''}
            ${budget ? `<p><strong>Budget:</strong> $${budget.toLocaleString()}</p>` : ''}
            ${description ? `<p><strong>Description:</strong><br>${description.replace(/\n/g, '<br>')}</p>` : ''}
            ${links && links.length > 0
              ? `
              <p><strong>Links:</strong></p>
              <ul>
                ${links.map((link) => `<li><a href="${link}" target="_blank">${link}</a></li>`).join('')}
              </ul>
            `
              : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/dashboard/collabs" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Request</a>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: creatorEmail,
    subject: `New Collaboration Request from ${senderName}${brandName ? ` - ${brandName}` : ''}`,
    htmlContent,
    cc: senderEmail, // CC the sender so they get a copy
  })
}

// Collab Request Confirmation Email (to sender)
export async function sendCollabRequestConfirmationEmail(
  senderEmail: string,
  senderName: string,
  creatorName: string
) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Request Sent!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hi ${senderName},</p>
          <p>Your collaboration request has been sent to <strong>${creatorName}</strong>.</p>
          <p>They'll review your request and get back to you soon!</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            This is a confirmation email. You've been CC'd on the email sent to ${creatorName}.
          </p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: senderEmail,
    subject: `Your collaboration request to ${creatorName} has been sent`,
    htmlContent,
  })
}

// Email Verification Email
export async function sendEmailVerificationEmail(
  email: string,
  verificationToken: string,
  userName?: string
) {
  const baseUrl = getAppBaseUrl()
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Verify Your Email</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hi${userName ? ` ${userName}` : ''},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            This link will expire in 24 hours. If you didn't request this verification, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - CollabLink',
    htmlContent,
  })
}

