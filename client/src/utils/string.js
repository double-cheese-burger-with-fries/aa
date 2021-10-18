function validatorAux (value, type, rules) {
	// eslint-disable-next-line no-control-regex
	const unicodePattern = /[^\x00-\x7F]/
	switch (type) {
		case 'email':
			const emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
			return !unicodePattern.test(value) && emailPattern.test(value)
		case 'password':
			const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/   /// must contain one lowercase, one uppercase, one digit. To add a symbol: (?=.*[!@#\$%\^&\*])
			return !unicodePattern.test(value) && passwordPattern.test(value)
		case 'date':
			const date = new Date(value)
			return date.getTime() <= rules.isBefore && date.getTime() >= rules.isAfter
		default:
			return true
	}
}

export function validator (value, rules, type) {
	let isValid = true
	if (rules && rules.minLength) {
		isValid = value.length >= rules.minLength && isValid
	}
	if (rules && rules.maxLength) {
		isValid = value.length <= rules.maxLength && isValid
	}
	if (rules && rules.isAlpha) {
		const isAlpha = str => str.match(/^[a-z àáâãäçèéêëìíîïñòóôõöšùúûüýÿž]+$/i) !== null
		isValid = isAlpha(value) && isValid
	}
	return validatorAux(value, type, rules) && isValid
}

export function sanitise (value) {
	return value && value.replace(/\s\s+/g, ' ').trim()
}

export const passwordCriteria = 'Password must have at least 8 characters, including at least one capital letter, one lower case letter and one number'

export function capitalise (text) {
	return text.toLowerCase()
		.split(' ')
		.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
		.join(' ')
}