const multer = require('multer')
const path = require('path')
const fs = require('fs')

module.exports = {

	fileStorage : multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, 'images')
		},
		filename: (req, file, cb) => {
			cb(null, new Date().toISOString() + '-' + file.originalname)
		}
	}),

	fileFilter:  (req, file, cb) => {
		if (
			file.mimetype === 'image/png' ||
			file.mimetype === 'image/jpg' ||
			file.mimetype === 'image/jpeg'
		) {
			cb(null, true)
		} else {
			cb(null, false)
		}
	},

	clearImage: (filePath) => {
		filePath = path.join(__dirname, '..', filePath);
		fs.unlink(filePath, err => console.log(err));
	}
}
