const rewire = require("rewire")
const email = rewire("./email")
const confirmationEmailBody = email.__get__("confirmationEmailBody")
const emailBody = email.__get__("emailBody")
// @ponicode
describe("confirmationEmailBody", () => {
    test("0", () => {
        confirmationEmailBody("123")
    })

    test("1", () => {
        confirmationEmailBody("poni_code")
    })

    test("2", () => {
        confirmationEmailBody("poni code")
    })
})

// @ponicode
describe("emailBody", () => {
    test("0", () => {
        emailBody("123", "123")
    })

    test("1", () => {
        emailBody("poni&code", "poni-code")
    })

    test("2", () => {
        emailBody("xyz", "xyz")
    })

    test("3", () => {
        emailBody("1", "xyz")
    })
})
