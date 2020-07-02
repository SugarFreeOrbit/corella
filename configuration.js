//Config values can be overwritten directly here or through environment variables
let config = {
        "superadmin": {
                "password": process.env.CORELLA_SUPERADMIN_PWD || "password",
                "email": process.env.CORELLA_SUPERADMIN_EMAIL || "none@nowhere.com",
                "isAdmin": true
        },
        "mongodb": {
                "host":  process.env.CORELLA_DB_HOST || "localhost",
                "user":  process.env.CORELLA_DB_USER || "corellaAdmin", //Omit this parameter if authentication is not required
                "pwd":  process.env.CORELLA_DB_PWD || "password", //Omit this parameter if authentication is not required
                "dbName": process.env.CORELLA_DB_NAME || "corella"
        },
        "secret":  process.env.CORELLA_SECRET || "/CM%e4Sp<Zguvaam\\_g_h%Wnjc5zsc7hdDJG`Y<fU3CS_sYa49",
        "server": {
                "port":  process.env.CORELLA_PORT || 9080
        }
}
if (config.secret === "/CM%e4Sp<Zguvaam\\_g_h%Wnjc5zsc7hdDJG`Y<fU3CS_sYa49") {
	logger.log("info", "WARNING! You are using the default secret string which can be obtained from the public repo. Replace it with a new one in order to stay secure (you don't need to remember it)")
}

module.exports = config;