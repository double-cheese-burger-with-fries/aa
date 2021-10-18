const isAlpha = str => str.match(/^[a-z àáâãäçèéêëìíîïñòóôõöšùúûüýÿž]+$/i) !== null
const unicodePattern = /[^\x00-\x7F]/
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/   /// must contain one lowercase, one uppercase, one digit. To add a symbol: (?=.*[!@#\$%\^&\*])
const emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const datePattern = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/
const urlPattern = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
const storedImagePattern = /^images\/[\w\-. \:()]+\.(gif|png|jpg|jpeg)$/


function validate (value, type) {
	console.log(`VALIDATE _________${value}______________________${type}______________________`)
	try {
		switch (type) {
			case "email":
				return value && value.length >= 8 && value.length <= 70 && !unicodePattern.test(value) && emailPattern.test(value)
			case "password":
				return value && value.length >= 8 && value.length <= 40 && !unicodePattern.test(value) && passwordPattern.test(value)
			case "firstName":
				return value && value.length >= 2 && value.length <= 20 && isAlpha(value)
			case "lastName":
				return value && value.length >= 2 && value.length <= 30 && isAlpha(value)
			case "gender":
				return value && value === 'M' || value === 'F'
			case "orientation":
				return value && value === 'M' || value === 'F' || value === 'FM'
			case "dob":
				const year = parseInt(value.substring(0, 4))
				return value && value.match(datePattern) && year >= 1919 && year <= 2000
			case "job":
				return value && value.length >= 4 && value.length <= 50 && isAlpha(value)
			case "bio":
				return value && value.length >= 4 && value.length <= 3000
			case "tags":
				let valid = true
				if (!value || !value.length) {
					return false
				}
				console.log("VALUE", value)
				value.forEach(tag => {
					valid = valid && tag.length >= 3 && tag.length <= 20 && isAlpha(tag)
				})
				return valid
			case "pic":
				return value && value.length >= 3 && value.length <= 255 &&
					(!!value.match(urlPattern) || !!value.match(storedImagePattern))
		}
	}
	catch (error) {
		console.log(error)
		return false
	}
}

module.exports = {
	validate

}
