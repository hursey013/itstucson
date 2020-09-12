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

// Config
const keyword = {
  correct: "Tucson",
  incorrect: "Tuscon"
};
const q = `${keyword.incorrect.toLowerCase()} -hyundai lang:en -filter:replies -filter:retweets filter:safe`;
const interjections = ["Oh no!", "Oops!", "Uh-oh!", "Yikes!"];

exports.scheduledFunction = functions.pubsub
  .schedule("every 15 minutes")
  .onRun(context =>
    ref
      .once("value")
      .then(snapshot => snapshot.val())
      .then(since_id =>
        T.get("search/tweets", {
          q,
          result_type: "recent",
          since_id
        })
      )
      .then(({ data: { statuses } }) =>
        statuses.filter(
          status =>
            !status.user.name
              .toLowerCase()
              .includes(keyword.incorrect.toLowerCase()) &&
            !status.user.screen_name
              .toLowerCase()
              .includes(keyword.incorrect.toLowerCase())
        )
      )
      .then(statuses =>
        Promise.all([statuses, statuses.length && ref.set(statuses[0].id_str)])
      )
      .then(([statuses]) =>
        statuses.forEach(({ id_str, user }) =>
          T.post("statuses/update", {
            status: `${
              interjections[Math.floor(Math.random() * interjections.length)]
            } @${user.screen_name} misspelled ${
              keyword.correct
            }: https://twitter.com/${user.screen_name}/status/${id_str}`
          })
        )
      )
      .catch(err => functions.logger.error(err))
  );
