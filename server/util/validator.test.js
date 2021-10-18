const validator = require("./validator")
// @ponicode
describe("validator.validate", () => {
    test("0", () => {
        validator.validate("\"#'{7855663]}ééàà", "Dillenberg")
    })

    test("1", () => {
        validator.validate("123456789", "Dillenberg")
    })

    test("2", () => {
        validator.validate("Ponicponicodeponiponicoooooooooode18774563", "Elio")
    })
})
