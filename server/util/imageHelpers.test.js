const imageHelpers = require("./imageHelpers")
// @ponicode
describe("imageHelpers.fileFilter", () => {
    test("0", () => {
        imageHelpers.fileFilter("https://ponicode.com?a=1&b=2", { mimetype: "image/jpg" }, "callback detected, not supported yet")
    })

    test("1", () => {
        imageHelpers.fileFilter("https://ponicode.com", { mimetype: "image/jpeg" }, "callback detected, not supported yet")
    })

    test("2", () => {
        imageHelpers.fileFilter("www.ponicode.com", { mimetype: "image/jpeg" }, "callback detected, not supported yet")
    })
})
