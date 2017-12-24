// config/passport.js

// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy;

// set up database access
var pgp = require('pg-promise')({
  // initialization options
});
DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/node-authentication'
var db = pgp(DATABASE_URL);

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            var q = 'SELECT * from facebook WHERE facebook_id = $1';
            db.one(q, profile.id)
              .then(user => {
                // if the user is found, then log them in
                if (user) {
                  return done(null, user); // user found, return that user
                } else {
                  // if there is no user found with that facebook id, create them
                  var facebook_info = {
                    facebook_id: profile.id,
                    facebook_token: token,
                    facebook_name: profile.name.givenName + ' ' + profile.name.familyName,
                    facebook_email: profile.emails[0].value
                  };
                  var q = 'INSERT INTO facebook \
                    VALUES (default, ${facebook_id}, ${facebook_token}, ${facebook_name}, ${facebook_email}) RETURNING id';
                  db.one(q, facebook_info)
                    .then(function (result) {
                      // if successful, return the new user
                      var newUser = new User();
                      // set all of the facebook information in our user model
                      newUser.facebook.id    = profile.id; // set the users facebook id
                      newUser.facebook.token = token; // we will save the token that facebook provides to the user
                      newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                      newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                      return done(null, newUser);
                    })
                    .catch(err => {
                      throw err;
                    });
                }
              })
              .catch(err => {
                return done(err);
              });
        });

    }));

};
