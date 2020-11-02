const { interjections, keyword, locations } = require("./config.js");

const createStatus = ({ id_str, user }) =>
  `${interjections[Math.floor(Math.random() * interjections.length)]} ${
    user.name ? `${user.name} (${user.screen_name})` : user.screen_name
  } misspelled ${keyword.correct}${
    isFromAz(user.location)
      ? `, and even worse, it looks like they are in ${user.location}!`
      : ":"
  } https://twitter.com/${user.screen_name}/status/${id_str}`;

const filterStatus = status =>
  status.full_text.toLowerCase().includes(keyword.incorrect.toLowerCase()) &&
  !status.full_text.includes(keyword.case_sensitive) &&
  !status.entities.user_mentions.some(user =>
    user.screen_name.toLowerCase().includes(keyword.incorrect.toLowerCase())
  );

const isFromAz = location =>
  location
    .replace(", ", " ")
    .split(" ")
    .some(w => locations.some(l => w.toLowerCase() === l.toLowerCase()));

module.exports = {
  createStatus,
  filterStatus,
  isFromAz
};
