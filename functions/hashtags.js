"use strict";

module.exports = {
  hallofshame: ({ location }) =>
    location
      .replace(", ", " ")
      .split(" ")
      .some(w => ["Tucson"].some(l => w.toLowerCase() === l.toLowerCase())) &&
    "hallofshame",
  verified: ({ verified }) => verified && "verified"
};
