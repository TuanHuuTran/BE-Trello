const brevo = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new brevo.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (toEmail, customSubject, htmlContent) => {
  // Khởi tạo một cái sendSmtpEmail với những thôn tin cần thiết
  let sendSmtpEmail = new brevo.SendSmtpEmail()

  // Tài khoản gửi mail: là Email tạo account trên Brevo
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  // Những tài khoản nhận Email
  // 'to' phải là một array để sau ta có thể gửi email đến nhiều user
  sendSmtpEmail.to = [{ email: toEmail }]

  // Tiêu đề gửi Email:
  sendSmtpEmail.subject = customSubject

  // Nội dung Email:
  sendSmtpEmail.htmlContent = htmlContent

  // Gọi hành động gửi mail
  // sendTransacEmail trả về một Promise
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}
