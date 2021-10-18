import {GRAPHQLURL} from "../constants";

const graphqlReq = (query, token = null) => {
	const req = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(query)
	}
	return token ? {...req, headers: {...req.headers, Authorization: 'Bearer ' + token}} : req
}

export const fetchGraphql = (query, callBack, token = null, errorCb = null) => {
	fetch(GRAPHQLURL, graphqlReq(query, token))
		.then(res => {
			return res.json()
		})
		.then(resData => {
			callBack(resData)
		})
		.catch(err => {
			errorCb && errorCb()
			console.log(err)
		})
}
