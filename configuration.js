//Config values can be overwritten directly here or through environment variables
let config = {
        "superadmin": {
                "password": "password"  || process.env.CORELLA_SUPERADMIN_PWD,
                "email": "none@nowhere.com"  || process.env.CORELLA_SUPERADMIN_EMAIL,
                "isAdmin": true
        },
        "mongodb": {
                "host": "localhost" || process.env.CORELLA_DB_HOST,
                "user": "corellaAdmin" || process.env.CORELLA_DB_USER, //Omit this parameter if authentication is not required
                "pwd": "password" || process.env.CORELLA_DB_PWD, //Omit this parameter if authentication is not required
                "dbName": "corella" || process.env.CORELLA_DB_NAME
        },
        "secret": "/CM%e4Sp<Zguvaam\\_g_h%Wnjc5zsc7hdDJG`Y<fU3CS_sYa49" || process.env.CORELLA_SECRET,
        "server": {
                "port": 80 || process.env.CORELLA_PORT
        }
}
if (config.secret === "/CM%e4Sp<Zguvaam\\_g_h%Wnjc5zsc7hdDJG`Y<fU3CS_sYa49") {
	logger.log("info", "WARNING! You are using the default secret string which can be obtained from the public repo. Replace it with a new one in order to stay secure (you don't need to remember it)")
}

module.exports = config;