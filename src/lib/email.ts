import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    await transporter.sendMail({
      from: `"MNSTS IMS" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

export function getAdminVerificationEmailTemplate(userDetails: {
  firstName: string,
  lastName: string,
  email: string,
  verificationToken: string
}) {
  const { firstName, lastName, email, verificationToken } = userDetails
  const verificationUrl = `${process.env.NEXTAUTH_URL}/admin/verify-user?token=${verificationToken}`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New User Registration - MNSTS IMS</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #F8F6F0;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2D5F3F;
          margin-bottom: 10px;
        }
        .title {
          color: #2D5F3F;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .content {
          color: #6B6B6B;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .user-details {
          background-color: #F8F6F0;
          border-left: 4px solid #2D5F3F;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .user-details h4 {
          color: #2D5F3F;
          margin-top: 0;
          margin-bottom: 15px;
        }
        .user-details p {
          margin: 8px 0;
          color: #2D5F3F;
        }
        .button {
          display: inline-block;
          background-color: #2D5F3F;
          color: #FFFFFF;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button.approve {
          background-color: #059669;
        }
        .button.reject {
          background-color: #DC2626;
          margin-left: 10px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          font-size: 14px;
          color: #6B6B6B;
          text-align: center;
        }
        .buttons-container {
          text-align: center;
          margin: 30px 0;
        }
        .warning {
          background-color: #FEF3C7;
          border: 1px solid #F59E0B;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #92400E;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">MNSTS IMS</div>
          <p style="color: #6B6B6B;">Medellin National Science and Technology School</p>
        </div>

        <h1 class="title">New User Registration Request</h1>

        <div class="content">
          <p>Hello Admin,</p>
          <p>A new user has registered for the MNSTS Inventory Management System and requires approval before they can access the system.</p>

          <div class="user-details">
            <h4>👤 User Information</h4>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div class="warning">
            <strong>⚠️ Admin Action Required:</strong><br>
            This user account is currently inactive and requires your approval before the user can sign in to the system.
          </div>

          <p>Please review this registration request and choose one of the following actions:</p>

          <div class="buttons-container">
            <a href="${verificationUrl}&action=approve" class="button approve">✅ Approve User</a>
            <a href="${verificationUrl}&action=reject" class="button reject">❌ Reject Registration</a>
          </div>

          <p><strong>What happens next:</strong></p>
          <ul>
            <li><strong>If you approve:</strong> The user will be activated and can sign in immediately</li>
            <li><strong>If you reject:</strong> The registration will be deleted and the user will need to register again</li>
          </ul>

          <p>If the buttons don't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2D5F3F; font-size: 12px;">${verificationUrl}</p>
        </div>

        <div class="footer">
          <p>This verification request was sent by MNSTS Inventory Management System</p>
          <p>As the system administrator, only you can approve new user registrations.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getVerificationEmailTemplate(firstName: string, verificationToken: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify?token=${verificationToken}`
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Verification - MNSTS IMS</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #F8F6F0;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2D5F3F;
          margin-bottom: 10px;
        }
        .title {
          color: #2D5F3F;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .content {
          color: #6B6B6B;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background-color: #2D5F3F;
          color: #FFFFFF;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          font-size: 14px;
          color: #6B6B6B;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">MNSTS IMS</div>
          <p style="color: #6B6B6B;">Medellin National Science and Technology School</p>
        </div>
        
        <h1 class="title">Verify Your Email Address</h1>
        
        <div class="content">
          <p>Hello ${firstName},</p>
          <p>Thank you for creating an account with the MNSTS Inventory Management System. To complete your registration and start managing inventory, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2D5F3F;">${verificationUrl}</p>
          
          <p>This verification link will expire in 24 hours for security purposes.</p>
          
          <p>If you didn't create this account, you can safely ignore this email.</p>
        </div>
        
        <div class="footer">
          <p>This email was sent by MNSTS Inventory Management System</p>
          <p>If you have any questions, please contact your system administrator.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export interface LowStockItem {
  name: string
  sku: string
  category: string
  currentStock: number
  minStock: number
  shortage: number
}

export function getLowStockAlertEmailTemplate(firstName: string, lowStockItems: LowStockItem[]) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Low Stock Alert - MNSTS IMS</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #F8F6F0;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2D5F3F;
          margin-bottom: 10px;
        }
        .alert-title {
          color: #DC2626;
          font-size: 24px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .alert-icon {
          background-color: #FEE2E2;
          color: #DC2626;
          padding: 8px;
          border-radius: 50%;
          font-size: 20px;
        }
        .content {
          color: #6B6B6B;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background-color: #FEF7F0;
          border-radius: 8px;
          overflow: hidden;
        }
        .items-table th {
          background-color: #FED7AA;
          color: #9A3412;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
        }
        .items-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #FED7AA;
          font-size: 14px;
        }
        .items-table tr:last-child td {
          border-bottom: none;
        }
        .shortage {
          background-color: #FEE2E2;
          color: #DC2626;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          text-align: center;
        }
        .urgent {
          background-color: #FECACA;
          color: #991B1B;
        }
        .button {
          display: inline-block;
          background-color: #DC2626;
          color: #FFFFFF;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          font-size: 14px;
          color: #6B6B6B;
          text-align: center;
        }
        .summary {
          background-color: #FEF2F2;
          border-left: 4px solid #DC2626;
          padding: 16px;
          margin: 20px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">MNSTS IMS</div>
          <p style="color: #6B6B6B;">Medellin National Science and Technology School</p>
        </div>

        <h1 class="alert-title">
          <span class="alert-icon">⚠</span>
          Low Stock Alert
        </h1>

        <div class="content">
          <p>Hello ${firstName},</p>
          <p>This is an automated alert from the MNSTS Inventory Management System. The following items have fallen below their minimum stock levels and require immediate attention:</p>

          <div class="summary">
            <strong>Alert Summary:</strong><br>
            • <strong>${lowStockItems.length}</strong> item(s) below minimum stock<br>
            • Immediate restocking recommended<br>
            • Generated on: ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current</th>
                <th>Min Required</th>
                <th>Shortage</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockItems.map(item => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.sku}</td>
                  <td>${item.category}</td>
                  <td>${item.currentStock}</td>
                  <td>${item.minStock}</td>
                  <td class="shortage ${item.currentStock === 0 ? 'urgent' : ''}">${item.shortage}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <p><strong>Recommended Actions:</strong></p>
          <ul>
            <li>Review and update procurement orders</li>
            <li>Check with suppliers for availability</li>
            <li>Consider alternative sourcing if needed</li>
            <li>Update stock levels once items are restocked</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/overview" class="button">View Dashboard</a>
          </div>
        </div>

        <div class="footer">
          <p>This is an automated alert from MNSTS Inventory Management System</p>
          <p>Please do not reply to this email. For questions, contact your system administrator.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function sendLowStockAlert(lowStockItems: LowStockItem[]) {
  try {
    // First, get all verified users from the database
    const { prisma } = await import('./prisma')
    const users = await prisma.user.findMany({
      where: {
        isVerified: true
      },
      select: {
        email: true,
        firstName: true
      }
    })

    if (users.length === 0) {
      console.log('No active users found to send low stock alerts')
      return { success: false, error: 'No active users found' }
    }

    // Send email to all users
    const emailPromises = users.map(user =>
      sendEmail({
        to: user.email,
        subject: `🚨 Low Stock Alert - ${lowStockItems.length} Items Need Attention`,
        html: getLowStockAlertEmailTemplate(user.firstName, lowStockItems)
      })
    )

    const results = await Promise.allSettled(emailPromises)

    const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length
    const failed = results.length - successful

    console.log(`Low stock alert sent: ${successful} successful, ${failed} failed`)

    return {
      success: true,
      message: `Alert sent to ${successful} users${failed > 0 ? `, ${failed} failed` : ''}`,
      stats: { successful, failed, total: users.length }
    }

  } catch (error) {
    console.error('Error sending low stock alerts:', error)
    return { success: false, error: 'Failed to send low stock alerts' }
  }
}

export function getPasswordResetEmailTemplate(firstName: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset - MNSTS IMS</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #F8F6F0;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2D5F3F;
          margin-bottom: 10px;
        }
        .title {
          color: #2D5F3F;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .content {
          color: #6B6B6B;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background-color: #F4C430;
          color: #2D5F3F;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          font-size: 14px;
          color: #6B6B6B;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">MNSTS IMS</div>
          <p style="color: #6B6B6B;">Medellin National Science and Technology School</p>
        </div>
        
        <h1 class="title">Reset Your Password</h1>
        
        <div class="content">
          <p>Hello ${firstName},</p>
          <p>We received a request to reset your password for your MNSTS IMS account. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2D5F3F;">${resetUrl}</p>
          
          <p>This password reset link will expire in 1 hour for security purposes.</p>
          
          <p><strong>If you didn't request this password reset, please ignore this email.</strong> Your password will remain unchanged.</p>
        </div>
        
        <div class="footer">
          <p>This email was sent by MNSTS Inventory Management System</p>
          <p>If you have any questions, please contact your system administrator.</p>
        </div>
      </div>
    </body>
    </html>
  `
}