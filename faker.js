const faker = require('faker')
const mysql = require('mysql2')
const randomLocation = require('random-location')
const moment = require('moment')
const fakerUtils = require('./fakerUtils')

const db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "Apple123",
	database: "matchadb"
}).promise()

const getOrientation = (gender, orientation) => {
	const oppositeSex = gender === 'M' ? 'F' : 'M'
	switch (orientation) {
		case "straight":
			return oppositeSex
		case "gay":
			return gender
		default:
			return "FM"
	}
}

const paris = {
	latitude: 48.8529717,
	longitude: 2.3477134,
	address: "Paris"
}

const london = {
	latitude: 51.5074,
	longitude: 0.1278,
	address: "London"

}

const newYork = {
	latitude: 40.7128,
	longitude: -74.0060,
	address: "New York"
}

const getLocation = () => {
	const locations = [paris, london, newYork]
	const city = locations[Math.floor(Math.random() * locations.length)]
	const radius = Math.floor(Math.random() * (10000 - 100)) + 100
	const { latitude, longitude } = (randomLocation.randomCircumferencePoint({ latitude: city.latitude, longitude: city.longitude }, radius))
	return { latitude, longitude, address: city.address }
}

const dummyPassword = "$2a$12$rZHGfYxrMBjazgmd.OXq3OiH5wiocqYo6QB5Mxp6I2msv/JnGQL2K"

const getData = (gender, orient) => {
	const genderCode = gender === 'M' ? 0 : 1
	faker.locale = "fr";
	const firstName = fakerUtils.getFakeFirstName(genderCode);
	const lastName = faker.name.lastName(genderCode);
	const email = `${firstName.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()}.${lastName.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()}@hotmail.com`
	const password = dummyPassword
	const year = Math.floor(Math.random() * (2000 - 1970)) + 1970
	const date = moment(faker.date.past()).format("YYYY-MM-DD")
	const dob = year.toString() + date.substr(4)
	const orientation = getOrientation(gender, orient)
	const { latitude, longitude, address } = getLocation()
	faker.locale = "en";
	const job = faker.name.jobTitle()
	const bio = faker.lorem.paragraph()
	const randomN = Math.floor(Math.random() * 100)
	const profilePicture = `https://randomuser.me/api/portraits/${gender === 'M' ? 'men' : 'women'}/${randomN}.jpg`
	return [firstName, lastName, email, password, dob, gender, orientation, job, bio, profilePicture, latitude, longitude, address]
}


const createUsersTable = `CREATE TABLE users (
    id int(11) unsigned NOT NULL AUTO_INCREMENT,
    first_name varchar(20),
    last_name varchar(30),
    email varchar(70)  NOT NULL,
    password varchar(70)  NOT NULL,
    dob date DEFAULT NULL,
    gender char(1),
    orientation char(2),
    job varchar(50),
    bio varchar(3000),
    profilePic varchar(255),
    picture2 varchar(255),
    picture3 varchar(255),
    picture4 varchar(255),
    picture5 varchar(255),
    latitude decimal(20,17),
		longitude decimal(20,17),
		address varchar(255),
		isOnboarded tinyint(1) NOT NULL DEFAULT 0,
		isConfirmed tinyint(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;

const populateUsersTable = `INSERT INTO users (first_name, last_name, email, password,
dob, gender, orientation, job, bio, profilePic, latitude, longitude, address, isOnboarded, isConfirmed)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`

const createInterestsTable = `CREATE TABLE interests (
		id int(11) unsigned NOT NULL AUTO_INCREMENT,
    title varchar(20) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;

const populateInterestsTable = `INSERT INTO interests (title) VALUES ?`

const createUsersInterestsTable = `CREATE TABLE users_interests (
    interest_id int(11) unsigned NOT NULL REFERENCES interests(id),
    user_id int(11) unsigned NOT NULL REFERENCES users(id),
    PRIMARY KEY (user_id, interest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;

const populateUsersInterestsTable = `INSERT INTO users_interests (interest_id, user_id) VALUES ?`

const createLikesTable = `CREATE TABLE likes (
		sender_id int(11) unsigned NOT NULL REFERENCES users(id),
		receiver_id int(11) unsigned NOT NULL REFERENCES users(id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

const createBlocksTable = `CREATE TABLE blocks (
		sender_id int(11) unsigned NOT NULL REFERENCES users(id),
		receiver_id int(11) unsigned NOT NULL REFERENCES users(id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

const createReportsTable = `CREATE TABLE reports (
			sender_id int(11) unsigned NOT NULL REFERENCES users(id),
			receiver_id int(11) unsigned NOT NULL REFERENCES users(id)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

const createChatsTable = `CREATE TABLE messages (
		conversation_id varchar(10) NOT NULL,
		sender_id int(11) unsigned NOT NULL REFERENCES users(id),
		receiver_id int(11) unsigned NOT NULL REFERENCES USERS(id),
		content varchar(2000) NOT NULL,
		time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
		seen tinyint(1) NOT NULL DEFAULT 0
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 `


const populateChatsTable = `INSERT INTO messages (conversation_id, sender_id, receiver_id, content, time, seen) values 
		( "1:2", 1, 2, "Hi", '2019-01-01 08:23', 1), 
		( "1:2", 2, 1, "Hi to you too", '2019-01-01 08:40', 1 ),
		( "1:2", 1, 2, "How are you? This message is a bit longer because I need to see what it looks like", '2019-01-01 09:23', 1),
		( "1:2", 2, 1, "1 has not yet seen this message", '2019-01-01 09:40', 0),
		( "1:3", 3, 1, "You are pretty", '2019-01-04 15:45', 0)
		`

const createNotificationTable = `CREATE TABLE notifications (
	user_id int(11) unsigned NOT NULL REFERENCES users(id),
	from_id int(11) unsigned NOT NULL REFERENCES users(id),
	type varchar(15) NOT NULL,
	open tinyint(1) NOT NULL DEFAULT 0,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 `

const getRandomUser = () => {
	const sex = ['M', 'F']
	const orient = ['straight', 'straight', 'straight', 'straight', 'straight', 'gay', 'bisexual']
	return { gender: sex[Math.floor(Math.random() * sex.length)], orientation: orient[Math.floor(Math.random() * orient.length)] }
}


db.connect()
	.then(() => {
		console.log("Connected!")
		return db.query("DROP TABLE IF EXISTS users_interests")
	})
	.then(() => {
		console.log("Table 'users_interest' deleted")
		return db.query("DROP TABLE IF EXISTS users")
	})
	.then(() => {
		console.log("Table 'users' deleted")
		return db.query("DROP TABLE IF EXISTS interests")
	})
	.then(() => {
		console.log("Table 'interests' deleted")
		return db.query("DROP TABLE IF EXISTS likes")
	})
	.then(() => {
		console.log("Table 'likes' deleted")
		return db.query("DROP TABLE IF EXISTS blocks")
	})
	.then(() => {
		console.log("Table 'blocks' deleted")
		return db.query("DROP TABLE IF EXISTS messages")
	})
	.then(() => {
		console.log("Table 'messages' deleted")
		return db.query("DROP TABLE IF EXISTS notifications")
	})
	.then(() => {
		console.log("Table 'notifications' deleted")
		return db.query("DROP TABLE IF EXISTS reports")
	})
	.then(() => {
		console.log("Table 'reports' deleted")
		return db.query(createUsersTable)
	})
	
	
	.then(async function () {
		console.log("Table 'users' created");
		for (let i = 0; i < 300; i++) {
			let user = getRandomUser()
			const data = getData(user.gender, user.orientation)
			await db.query(populateUsersTable, data)
		}
		console.log("User data inserted")
		return db.query(createInterestsTable)
	})
	.then(async function () {
		console.log("Table 'interests' created");
		await db.query(populateInterestsTable, [fakerUtils.interests.map(x => [x])])
	})
	.then(async function () {
		console.log("Interests data inserted")
		return db.query(createUsersInterestsTable)
	})
	.then(async function () {
		console.log("Table 'users_interests' created")
		let users_interests = []
		for (let i = 1; i < 301; i++) {
			users_interests = users_interests.concat(fakerUtils.get5fakeInterest().map(x => [x, i]))
		}
		await db.query(populateUsersInterestsTable, [users_interests])
	})
	.then(async function () {
		console.log("Interests data inserted")
		await db.query(createLikesTable)
	})
	.then(async function () {
		console.log("Notification table created")
		await db.query(createNotificationTable)
	})
	.then(async function () {
		console.log("Report table created")
		await db.query(createReportsTable)
	})
	.then(async function () {
		console.log("Table 'likes' created")
		await db.query(createBlocksTable)
	})
	.then(async function () {
		console.log("Table 'blocks' created")
		await db.query(createChatsTable)
	})
	.then(async function () {
		console.log("Table 'messages' created")
		await db.query(populateChatsTable)
	})
	.then(() => {
		console.log("Chats data inserted")
		db.end()
	})
	.catch((err) => {
		console.log(err)
		db.end()
	})