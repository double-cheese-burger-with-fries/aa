import moment from "moment";

export function getAge(dob) {
	const epoch = dob.substring(0, dob.length-3)
	return moment().diff(moment.unix(epoch), 'years')
}
