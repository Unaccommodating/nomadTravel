const multer = require("multer");
const uuid = require("uuid");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "../static/video");
    },
    filename: (req, file, cb) => {
        cb(null, uuid.v4() + ".mp4");
    }
})

const upload = multer({storage: storage})

module.exports = function (req, res, next) {
    return upload.single('file')(req, res, () => {
        if (!req.file) return res.json({ error: Error })
        next()
    })
}