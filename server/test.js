const jwt = require('jsonwebtoken')

const token = jwt.sign(
	{email: "benedetta.dalcanton@gmail.com"},
	"๐๐กโฐ",
	{expiresIn: 1}
)

console.log(token)


const something = () => {

	let decodedToken;
	try {
		decodedToken = jwt.verify(token, '๐๐กโฐ');
	} catch (err) {
		console.log(err.message)
		const payload = jwt.verify(token, '๐๐กโฐ', {ignoreExpiration: true})
		console.log(payload)
	}
}
setTimeout(something, 3000)


