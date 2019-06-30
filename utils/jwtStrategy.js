const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: '/CM%e4Sp<Zguv893\\_g_h%Wnjc5zsc7hdDJG`Y<fU3CS_sYa49'
};

module.exports = new JwtStrategy(opts, (jwt, done) => {
	User.findById(jwt.id).then(user => {

	}).catch(err => {
		logger.info(err);
	});
});