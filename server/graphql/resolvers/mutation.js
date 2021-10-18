const jwt = require('jsonwebtoken')
const db = require('../../util/db')
const bcrypt = require('bcryptjs')
const {validate} = require('./../../util/validator')
const emailUtil = require('../../util/email')
const CONST = require('../../../constants')
const pubsub = require('./pubsub')

const checkAuth = (req) => {
	if (!req.isAuth) {
		const error = new Error('Not authenticated!')
		error.code = 401
		throw error
	}
}

const typeOflike = (sender, receiver, like) => {
	switch (true) {
		case sender == 0 && receiver == 0 && like:
			return "like"
		case sender == 0 && receiver == 1 && like:
			return "match"
		case sender == 1 && receiver == 1 && !like:
			return "unmatch"
	}
	return "unlike"
}

async function createUser(_, {userInput}) {
	console.log("CREATE USER")
	if (!validate(userInput.email, "email") || !validate(userInput.password, "password")) {
		const error = new Error('Validation Error')
		error.code = 422
		throw error
	}
	const [row] = await db.query('SELECT * FROM users WHERE email=?', userInput.email)
	if (row.length > 0) {
		throw new Error('User exists already!')
	}
	await emailUtil.sendEmail(CONST.EMAIL_CONFIRMATION_SECRET, userInput.email, 'confirmation')
	const hashedPw = await bcrypt.hash(userInput.password, 12)
	await db.query('Insert into users (email, password) VALUES (?, ?)', [userInput.email, hashedPw])


	// check return value and send error if appropriate
	// console.log(row)
	return {email: userInput.email}
}

async function toggleLike (_, data, graphQlReq) {
	const { req} = graphQlReq
	const { info} = data
	console.log("TOGGLE LIKE")
	checkAuth(req)
	const likeExist = 'SELECT * FROM likes WHERE (sender_id = ?) AND (receiver_id = ?)'
	const [senderLikesReceiver] = await db.query(likeExist, [req.userId, info.receiverId])
	const [receiverLikesSender] = await db.query(likeExist, [info.receiverId, req.userId])
	const likeResult = typeOflike(senderLikesReceiver.length, receiverLikesSender.length, info.liked)

	const query = info.liked
		? 'INSERT INTO likes (sender_id, receiver_id) VALUES (?, ?)'
		: 'DELETE FROM likes WHERE sender_id = ? AND receiver_id = ?'

	if (likeResult !== "unlike") {
		const notificationQuery = 'INSERT INTO notifications (user_id, from_id, type, open) VALUES (?, ?, ?, ?)'
		await db.query(notificationQuery, [info.receiverId, req.userId, likeResult, 0, 'current_timestamp()'])
		const [r] = await db.query('SELECT first_name, last_name FROM users WHERE id = ?', [req.userId])
		const name = r[0].first_name + " " + r[0].last_name
		pubsub.publish('likeToggled', {likeToggled: {value: info.liked, receiver: info.receiverId, sender: req.userId}})
		pubsub.publish('notification', {
			trackNotification: {
				type: likeResult,
				receiver: info.receiverId,
				senderId: req.userId,
				seen: false,
				senderName: name
			}
		})
		if (likeResult === "match") {
			await db.query(notificationQuery, [req.userId, info.receiverId, likeResult, 0, 'current_timestamp()'])
			const [r] = await db.query('SELECT first_name, last_name FROM users WHERE id = ?', [info.receiverId])
			const name = r[0].first_name + " " + r[0].last_name
			pubsub.publish('notification', {
				trackNotification: {
					type: likeResult,
					receiver: req.userId,
					senderId: info.receiverId,
					seen: false,
					senderName: name
				}
			})
		}

	}
	await db.query(query, [req.userId, info.receiverId])
	return {content: "Liked updated successfully"}
}

async function toggleBlock (_, {info}, {req}) {
	console.log("TOGGLE BLOCK")
	checkAuth(req)

	const query = info.blocked
		? 'INSERT INTO blocks (sender_id, receiver_id) VALUES (?, ?)'
		: 'DELETE FROM blocks WHERE sender_id = ? AND receiver_id = ?'

	await db.query(query, [req.userId, info.receiverId])
	return {content: "User blocked successfully"}
}

async function sendMessage (_, {content, receiverId}, {req}) {
	console.log("SEND MESSAGE")
	checkAuth(req)
	const convId = req.userId < receiverId ? `${req.userId}:${receiverId}` : `${receiverId}:${req.userId}`
	query = `INSERT INTO messages (conversation_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)`
	await db.query(query, [convId, req.userId, receiverId, content])

	const [sender] = await db.query(`SELECT CONCAT(first_name, ' ', last_name) name FROM users WHERE id = ?`, [req.userId])

	const message = {
		senderId: req.userId,
		receiverId: receiverId,
		content: content,
		timestamp: new Date(),
		seen: false,
		conversationName: sender[0].name
	}
	pubsub.publish('newMessage', {newMessage: message})
	return {content: "message added successfully"}
},

module.exports = {
	createUser,
	emailConfirmation: async function (_, {token}) {
		console.log("EMAIL CONFIRMATION")
		let decodedToken;
		try {
			decodedToken = jwt.verify(token, CONST.EMAIL_CONFIRMATION_SECRET);
		} catch (err) {
			const {email} = jwt.verify(token, '🍗🍡⏰', {ignoreExpiration: true})
			const e = new Error(err.message)
			e.data = email
			throw e
		}
		if (!decodedToken) {
			throw new Error("Invalid token")
		}
		const query = `SELECT isConfirmed, id, isOnboarded FROM users WHERE email = ?`
		const [users] = await db.query(query, [decodedToken.email])
		if (users.length <= 0) {
			throw new Error("User does not exist")
		}
		if (users[0].isConfirmed === 1) {
			throw new Error("Account already confirmed")
		}
		const mutation = `UPDATE users SET isConfirmed = 1 WHERE email = ?`
		const [row] = await db.query(mutation, [decodedToken.email])
		console.log(row)

		const authToken = jwt.sign(
			{userId: users[0].id, email: decodedToken.email},
			CONST.SECRET,
			{expiresIn: '1h'}
		)
		return {token: authToken, userId: users[0].id, isOnboarded: !!users[0].isOnboarded}
		// return { content: "Account confirmed successfully"}
	},

	passwordResetEmail: async function (_, {data}) {
		const query = `SELECT id FROM users WHERE email = ?`
		const [users] = await db.query(query, [data.email])
		if (users.length <= 0) {
			throw new Error("User does not exist")
		}
		await emailUtil.sendEmail(CONST.RESET_PASSWORD_SECRET, data.email, data.subject)
		return {content: "Reset password succesfully sent"}
	},

	resetPassword: async function (_, {token, password, confirmationPassword}) {
		console.log("EMAIL CONFIRMATION")
		let decodedToken;
		try {
			decodedToken = jwt.verify(token, CONST.RESET_PASSWORD_SECRET);
		} catch (err) {
			const {email} = jwt.verify(token, CONST.RESET_PASSWORD_SECRET, {ignoreExpiration: true})
			const e = new Error(err.message)
			e.data = email
			throw e
		}
		if (!decodedToken) {
			throw new Error("Invalid token")
		}
		const query = `SELECT isConfirmed, id, isOnboarded FROM users WHERE email = ?`
		const [users] = await db.query(query, [decodedToken.email])
		if (users.length <= 0) {
			throw new Error("User does not exist")
		}
		if (!users[0].isConfirmed) {
			const error = new Error('User is not confirmed')
			error.code = 422
			throw error
		}
		if (!validate(password, "password") || password !== confirmationPassword) {
			const error = new Error('Validation Error')
			error.code = 422
			throw error
		}
		const hashedPw = await bcrypt.hash(password, 12)
		const mutation = `UPDATE users SET password = ? WHERE email = ?`
		const [row] = await db.query(mutation, [hashedPw, decodedToken.email])
		console.log(row)

		const authToken = jwt.sign(
			{userId: users[0].id, email: decodedToken.email},
			CONST.SECRET,
			{expiresIn: '1h'}
		)
		return {token: authToken, userId: users[0].id, isOnboarded: !!users[0].isOnboarded}
		// return { content: "Account confirmed successfully"}
	},

	insertProfileInfo: async function (_, {info}, {req}) {
		console.log("INSERT PROFILE INFO")
		checkAuth(req)
		if (!validate(info.firstName, "firstName") || !validate(info.lastName, "lastName")
			|| !validate(info.gender, "gender") || !validate(info.orientation, "orientation")
			|| !validate(info.dob, "dob")) {
			const error = new Error('Validation Error')
			error.code = 422
			throw error
		}
		const query = `UPDATE users SET first_name = ?, last_name = ?, dob = ?, gender = ?, orientation = ? WHERE email = ?`
		const [row] = await db.query(query, [info.firstName, info.lastName, info.dob, info.gender, info.orientation, req.email])
		console.log(row)
		return {content: "UserProfile data updated successfully"}
	},

	insertBioInfo: async function (_, {info}, {req}) {
		console.log("INSERT BIO INFO")
		checkAuth(req)
		if (!validate(info.job, "job"), !validate(info.bio, "bio"), !validate(info.interests, "tags")) {
			const error = new Error('Validation Error')
			error.code = 422
			throw error
		}
		const query = `UPDATE users SET job = ?, bio = ? WHERE email = ?`
		const [resBioInfo] = await db.query(query, [info.job, info.bio, req.email])
		console.log(resBioInfo)
		const interests = info.interests.map(x => [x])
		const interestQuery = `INSERT IGNORE INTO interests (title) values ?`
		const [resInterests] = await db.query(interestQuery, [interests])
		console.log(resInterests)
		///////// refactor
		const interestsIdQuery = `SELECT id FROM interests WHERE title IN (${info.interests.map(() => "?").join()})`
		const [ids] = await db.query(interestsIdQuery, info.interests)
		console.log(ids)
		const usersInterestsQuery = 'INSERT INTO users_interests (interest_id, user_id) values ?'
		const [resUserInterests] = await db.query(usersInterestsQuery, [ids.map((x) => [x.id, req.userId])])
		console.log(resUserInterests)
		return {content: "Bio data updated successfully"}
	},
	markOnboarded: async function (_, x, {req}) {
		console.log("MARK ONBOARDED")
		checkAuth(req)
		const query = `UPDATE users SET isOnboarded = ? WHERE email = ?`
		const [row] = await db.query(query, [1, req.email])
		console.log(`User ${req.email} marked onboarded\n`, row)
		return {content: "User successfully marked onboarded!"}
	},
	changePassword: async function (_, {info}, {req}) {
		console.log("HERE")
		if (!req.isAuth) {
			return {content: "REQUEST UNAUTHORIZED"}
		}
		const [user] = await db.query('SELECT isOnboarded, password, id, email FROM users WHERE email=?', req.email)
		if (user.length === 0) {
			const error = new Error('User not found.')
			error.code = 401
			throw error
		}
		const isEqual = await bcrypt.compare(info.oldPassword, user[0].password)
		if (!isEqual) {
			const error = new Error('Password is incorrect.')
			error.code = 401
			throw error
		}
		if (info.oldPassword === info.newPassword) {
			return {content: "Invalid new password"}
		}
		const hashedPw = await bcrypt.hash(info.newPassword, 12)
		await db.query('UPDATE users SET password = (?) WHERE email=?', [hashedPw, info.email])
		return {content: "Password succesfully changed "}
	},
	insertPictureInfo: async function (_, {info}, {req}) {
		console.log("INSERT PICTURE INFO")
		checkAuth(req)
		if (!validate(info.profilePic, "pic")) {
			const error = new Error('Validation Error')
			error.code = 422
			throw error
		}
		const query = `UPDATE users SET profilePic = ?, picture2 = ?, picture3 = ?, picture4 = ?, picture5 = ? WHERE email = ?`
		const [row] = await db.query(query, [info.profilePic, info.picture2, info.picture3, info.picture4, info.picture5, req.email])
		return {content: "Pic data updated successfully"}
	},
	resendConfirmationEmail: async function (_, {email}) {
		console.log("RESEND CONFIRMATION EMAIL")
		const [users] = await db.query('SELECT isConfirmed FROM users WHERE email=?', email)
		if (users.length <= 0) {
			throw new Error("User does not exist")
		}
		if (users[0].isConfirmed === 1) {
			throw new Error("Account already confirmed")
		}
		await emailUtil.sendEmail(CONST.EMAIL_CONFIRMATION_SECRET, email, 'confirmation')
		return {content: "Email re-sent successfully"}
	},
	toggleLike,
	toggleBlock,
	saveLocation: async function (_, {lat, long, address}, {req}) {
		console.log("SAVE LOCATION")
		checkAuth(req)
		const query = 'UPDATE users SET latitude = ?, longitude = ?, address = ? WHERE id = ?'
		await db.query(query, [lat, long, address, req.userId])
		return ({content: "location updated successfully"})
	},

	editUser: async function (_, {userInput}, {req}) {
		checkAuth(req)
		console.log(userInput)

		const query = `UPDATE users SET first_name = ?, last_name = ?, email = ?, bio = ?, gender = ?, orientation = ? WHERE id = ?`
		await db.query(query, [userInput.name, userInput.lastName, userInput.email, userInput.bio, userInput.gender, userInput.orientation, req.userId])
		const [inter] = await db.query('Select title from interests')
		const existingInterests = inter.map(y => y.title)
		const newInterests = userInput.interests.filter(element => !existingInterests.includes(element))
		const interestQuery = `INSERT INTO interests (title) values ?`
		const interests = newInterests.map(x => [x])
		if (interests.length > 0) {
			const [resInterests] = await db.query(interestQuery, [interests])
		}
		const interestsIdQuery = `SELECT id FROM interests WHERE title IN (${userInput.interests.map(() => "?").join()})`
		const [ids] = await db.query(interestsIdQuery, userInput.interests)
		const deleteInterest = 'DELETE FROM users_interests WHERE user_id = ?'
		await db.query(deleteInterest, req.userId)
		const usersInterestsQuery = 'INSERT INTO users_interests (interest_id, user_id) values ?'
		await db.query(usersInterestsQuery, [ids.map((x) => [x.id, req.userId])])
		return {content: "User modified"}
	},

	profileVisited: async function (_, {receiverId}, {req}) {
		console.log("PROFILE VISITED")
		checkAuth(req)
		//Insert notification in db
		const notificationQuery = 'INSERT INTO notifications (user_id, from_id, type) VALUES (?, ?, ?)'
		await db.query(notificationQuery, [receiverId, req.userId, "visited"])
		const [sender] = await db.query(`SELECT CONCAT(first_name, ' ', last_name) name FROM users WHERE id = ?`, [req.userId])
		// pubsub.publish('profileVisited', { trackProfileVisited : { sender: req.userId, receiverId: receiverId, }} )
		pubsub.publish('notification', {
			trackNotification: {
				type: "visited",
				receiver: receiverId,
				senderId: req.userId,
				seen: false,
				senderName: sender[0].name,
				createdAt: new Date()
			}
		})
		return {content: "User visited"}
	},

	markNotificationsAsSeen: async function (_, x, {req}) {
		console.log("MARK NOTIFICATIONS AS SEEN FOR USER ", req.userId)
		checkAuth(req)
		query = `UPDATE notifications SET open = 1 WHERE user_id = ? AND open = 0`
		await db.query(query, [req.userId])
		return {content: "notifications marked as seen"}
	},

	markMessagesAsSeen: async function (_, {senderId}, {req}) {
		console.log("MARK MESSAGES AS SEEN")
		checkAuth(req)
		query = `UPDATE messages SET seen = 1 WHERE receiver_id = ? AND seen = 0 AND sender_id = ?`
		await db.query(query, [req.userId, senderId])
		return {content: "messages marked as seen"}
	},

	sendMessage,

	reportUser: async function (_, {userId}, {req}) {
		console.log("Report USer")
		checkAuth(req)
		const query = 'SELECT * FROM reports WHERE (sender_id = ?) AND (receiver_id = ?)'
		const [reportExist] =  await db.query(query, [req.userId, userId])
		if (reportExist.length > 0) {
			return { content: "Already reported" }
		}
		reportQuery = "INSERT INTO reports (sender_id, receiver_id) VALUES (?,?)"

		await db.query(reportQuery, [req.userId, userId])
		return {content: "report succesful"}
	},
}
