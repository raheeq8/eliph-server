var { expressjwt: jwt } = require("express-jwt");

function authJwt() {
    const secret = "gdjshguyt78q099DJBY_isbnxubZf7678hUGU6VB";
    return jwt({
        secret: secret,
        algorithms: ["HS256"],
    })
}



module.exports = authJwt