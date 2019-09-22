const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: CONFIG.secret
};

module.exports = new JwtStrategy(opts, (jwt, done) => {
	User.findById(jwt.id, {password: -1}).then(user => {
		if(user) {
			done(null, user);
		} else {
			done(null, false);
		}
	}).catch(err => {
		done(err, false);
	});
});