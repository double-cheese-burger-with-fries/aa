import geocoder from 'geocoder'

export function getCurrentPosition () {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject);
	});
};