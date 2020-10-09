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
  incorrect: "Tuscon",
  case_sensitive: "TusCon"
};
const query = "lang:en -filter:retweets filter:safe";
const interjections = ["Oh no!", "Oops!", "Uh-oh!", "Yikes!"];

exports.scheduledFunction = functions.pubsub
  .schedule("every 15 minutes")
  .onRun(context =>
    ref
      .once("value")
      .then(snapshot =>
        // Retrieve since_id and array of ignored keywords from db
        snapshot.val()
      )
      .then(({ ignore = [], since_id }) =>
        // Fetch recent tweets matching query after since_id
        T.get("search/tweets", {
          q: `${keyword.incorrect} ${ignore
            .map(i => `-${i}`)
            .join(" ")} ${query}`,
          result_type: "recent",
          tweet_mode: "extended",
          since_id
        })
      )
      .then(({ data: { statuses } }) =>
        // Filter tweets not containing keyword in status.text and reverse order
        statuses.filter(
          status =>
            status.full_text
              .toLowerCase()
              .includes(keyword.incorrect.toLowerCase()) &&
            !status.full_text.includes(keyword.case_sensitive) &&
            !status.entities.user_mentions.some(user =>
              user.screen_name
                .toLowerCase()
                .includes(keyword.incorrect.toLowerCase())
            )
        )
      )
      .then(
        filtered =>
          filtered.length &&
          Promise.all(
            filtered.map(({ id_str, user }) =>
              // Post new tweet
              T.post("statuses/update", {
                status: `${
                  interjections[
                    Math.floor(Math.random() * interjections.length)
                  ]
                } @${user.screen_name} misspelled ${
                  keyword.correct
                }: https://twitter.com/${user.screen_name}/status/${id_str}`
              })
            )
          )
            .then(() =>
              // Record id of most recent tweet in db
              ref.child("since_id").set(filtered[0].id_str)
            )
            .catch(err => functions.logger.error(err))
      )
      .catch(err => functions.logger.error(err))
  );
