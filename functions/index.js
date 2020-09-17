"use strict";

// Init Firebase
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Init Realtime Database
const db = admin.database();
const ref = db.ref("/");

// Init Twit
const Twit = require("twit");
const T = new Twit({
  consumer_key: functions.config().twitter.consumer_key,
  consumer_secret: functions.config().twitter.consumer_secret,
  access_token: functions.config().twitter.access_token,
  access_token_secret: functions.config().twitter.access_token_secret
});

// General config
const keyword = {
  correct: "Tucson",
  incorrect: "Tuscon"
};
const query = "lang:en -filter:replies -filter:retweets filter:safe";
const interjections = ["Oh no!", "Oops!", "Uh-oh!", "Yikes!"];

exports.scheduledFunction = functions.pubsub
  .schedule("every 15 minutes")
  .onRun(context =>
    ref
      .once("value")
      .then(snapshot => snapshot.val())
      .then(({ ignore, since_id }) =>
        T.get("search/tweets", {
          q: `${keyword.incorrect} ${ignore
            .map(i => `-${i}`)
            .join(" ")} ${query}`,
          result_type: "recent",
          since_id
        })
      )
      .then(({ data: { statuses } }) => {
        const filtered = statuses.filter(status =>
          status.text.toLowerCase().includes(keyword.incorrect.toLowerCase())
        );
        filtered.length && functions.logger.info(filtered);
        return filtered;
      })
      .then(filtered =>
        Promise.all([
          statuses,
          statuses.length && ref.child("since_id").set(statuses[0].id_str)
        ])
      )
      .then(([statuses]) =>
        statuses.map(({ id_str, user }) =>
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
