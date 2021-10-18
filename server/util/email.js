const CONST = require('../../constants')
const nodeMailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport')
const jwt = require('jsonwebtoken')

function confirmationEmailBody (token) {
	return (
		`<a href="${CONST.HOST}confirmation/${token}"
   target="_blank"
   rel="noopener noreferrer"
   data-auth="NotApplicable"
   style="font-size:20px;
   font-family:Helvetica,Arial,sans-serif; 
   color:#ffffff; background-color: #DD0E52; 
   text-decoration:none; text-decoration:none; 
   -webkit-border-radius:7px; -moz-border-radius:7px; 
   border-radius:7px; padding:12px 18px; 
   display:inline-block"> 
   CONFIRMATION ▸
	</a>`
	)
}

function resetPasswordEmailBody (token) {
	return (
		`<a href="${CONST.HOST}reset_password/${token}" 
					target="_blank" 
					rel="noopener noreferrer" 
					data-auth="NotApplicable" 
					style="font-size:20px;
   font-family:Helvetica,Arial,sans-serif; 
   color:#ffffff; background-color: #DD0E52; 
   text-decoration:none; text-decoration:none; 
   -webkit-border-radius:7px; -moz-border-radius:7px; 
   border-radius:7px; padding:12px 18px; 
   display:inline-block">  RESET PASSWORD ▸
					</a>`
	)
}

function emailBody (token, subject) {
	if (subject == 'confirmation') { return confirmationEmailBody(token) }
	return resetPasswordEmailBody(token)

}

const transporter = nodeMailer.createTransport(sendGridTransport({
	auth: {
		api_key: CONST.SEND_GRID_API_KEY
	}
}))


module.exports = {
	sendEmail: async function (key, email, subject) {
		const confirmationToken = jwt.sign(
			{email: email},
			key,
			{expiresIn: '12h'}
		)
		await transporter.sendMail({
			to: email,
			from: 'raghirelli@gmail.com',
			subject: subject,
			html: emailBody(confirmationToken, subject)
		}, (err) => {
			if (err) {
				console.log(err)
				throw new Error(`can't send ${subject} email`) 
			}
		})
	},
}