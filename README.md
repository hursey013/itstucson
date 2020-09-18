# itstucson-bot

> Highlighting misspellings of Tucson, AZ, one embarrassing tweet at a time.

## Introduction

Simple bot which uses the Twitter Search API to find occurrences of `Tucson` being misspelled as `Tuscon`. Uses a scheduled Firebase Function to run the search at regular intervals and then retweets any matches. The `id` of the most recently retweeted match is persisted to the RealTime database to prevent duplicate tweets.

Further reading:

- [Firebase SDK for Cloud Functions](https://firebase.google.com/docs/functions)
- [Twitter Standard Search API](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/api-reference/get-search-tweets)

## Functions code

See file [functions/index.js](functions/index.js) for the code.

The dependencies are listed in [functions/package.json](functions/package.json).

## Initial setup

### Clone this repo

- Clone or download this repo and open the `itstucson-bot` directory.

### Create a Firebase project

- Create a Firebase Project using the [Firebase Developer Console](https://console.firebase.google.com)
- Enable billing on your project by switching to the Blaze or Flame plan. See [pricing](https://firebase.google.com/pricing/) for more details. This is required to allow requests to non-Google services within the Function.
- Install [Firebase CLI Tools](https://github.com/firebase/firebase-tools) if you have not already, and log in with `firebase login`.
- Configure this sample to use your project using `firebase use --add` and select your project.

### Install dependencies and add environment variables

- Install dependencies locally by running: `cd functions; npm i; cd -`
- [Add your Twitter API credentials](https://developer.twitter.com/) to the Firebase config:
  ```bash
  firebase functions:config:set \
  twitter.consumer_key=<YOUR TWITTER CONSUMER KEY> \
  twitter.consumer_secret=<YOUR TWITTER CONSUMER SECRET> \
  twitter.access_token=<YOUR TWITTER ACCESS TOKEN> \
  twitter.access_token_secret=<YOUR TWITTER ACCESS TOKEN SECRET> \
  ```

### Modify function

There are a number of variables which can be customized within the function:

- `keyword` - set the `correct` and `incorrect` spellings of your target keyword
- `query` - any additional search filters you would like to include in the query
- `interjections` - an array of interjections that are randomly used when retweeting matches

The function will also look for an `ignore` object in the RealTime database containing an array of terms which, if matched, will cause the tweet to be ignored.

### Deploy the app to production

- Deploy your function using `firebase deploy --only functions`
- By default, the function will be run every 15 minutes
