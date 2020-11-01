"use strict";

const { keyword, query, interjections, locations } = require("./config.js");
const { createStatus, filterStatus, isFromAz } = require("./utils.js");

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
      .then(({ data }) => {
        data.statuses.length > 0 &&
          functions.logger.info(JSON.stringify(data, null, 2));

        // Filter tweets not containing keyword in status.text and reverse order
        return data.statuses.filter(filterStatus);
      })
      .then(
        filtered =>
          filtered.length &&
          Promise.all(
            filtered.map(status =>
              // Post new tweet
              T.post("statuses/update", {
                status: createStatus(status)
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
