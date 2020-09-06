"use strict";

// Init Firebase
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Init Realtime Database
const db = admin.database();
const ref = db.ref("since_id");

// Init Twit
const Twit = require("twit");
const T = new Twit({
  consumer_key: functions.config().twitter.consumer_key,
  consumer_secret: functions.config().twitter.consumer_secret,
  access_token: functions.config().twitter.access_token,
  access_token_secret: functions.config().twitter.access_token_secret
});

exports.scheduledFunction = functions.pubsub
  .schedule("every 1 hours")
  .onRun(context =>
    ref
      .once("value")
      .then(snapshot => snapshot.val())
      .then(since_id =>
        T.get("search/tweets", {
          q: functions.config().twitter.query,
          result_type: "recent",
          since_id
        })
      )
      .then(result => {
        if (result.length) {
          ref.set(result[0].id_str);
        }

        return result;
      })
      .then(result =>
        result.forEach(status =>
          T.post("statuses/update", {
            status: `Uh oh! @${status.user.screen_name} misspelled Tucson: https://twitter.com/${status.user.screen_name}/status/${status.id_str}`
          })
        )
      )
      .catch(err => functions.logger.error(err.stack))
  );
