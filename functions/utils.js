const {
  hyundaiKeywords,
  interjections,
  keyword,
  locations
} = require("./config.js");
const hashtags = require("./hashtags.js");

const createStatus = ({ full_text, id_str, user }) => {
  return fillTemplate(
    "${interjection} ${user} misspelled ${keyword}${location}${hyundai} ${hashtag} ${link}",
    {
      interjection:
        interjections[Math.floor(Math.random() * interjections.length)],
      user: user.name ? `${user.name} (${user.screen_name})` : user.screen_name,
      keyword: keyword.correct,
      location:
        isFromAz(user.location) &&
        `, and even worse, it looks like they are from Arizona! 🤦`,
      hyundai:
        isHyundai(full_text) &&
        `${
          !isFromAz(user.location) ? "." : ""
        } Also, did you know that the Hyundai SUV is named after Tucson, Arizona?`,
      hashtag: `#itstucson${formatHashTag(user)}`,
      link: `https://twitter.com/${user.screen_name}/status/${id_str}`
    }
  );
};

const fillTemplate = (templateString, templateVariables) =>
  templateString.replace(/\${(.*?)}/g, (_, g) => templateVariables[g] || "");

const filterStatus = status =>
  status.full_text.toLowerCase().includes(keyword.incorrect.toLowerCase()) &&
  !status.full_text.toLowerCase().includes(keyword.correct.toLowerCase()) &&
  !status.full_text.includes(keyword.case_sensitive) &&
  !status.entities.user_mentions.some(user =>
    user.screen_name.toLowerCase().includes(keyword.incorrect.toLowerCase())
  );

const formatHashTag = user => {
  let string = "";

  Object.keys(hashtags).forEach(hashtag => {
    const value = hashtags[hashtag](user);

    if (value) {
      string += ` #${value}`;
    }
  });

  return string;
};

const isFromAz = location =>
  location
    .replace(", ", " ")
    .split(" ")
    .some(w => locations.some(l => w.toLowerCase() === l.toLowerCase()));

const isHyundai = full_text =>
  full_text
    .split(" ")
    .some(w => hyundaiKeywords.some(h => w.toLowerCase() === h.toLowerCase()));

module.exports = {
  createStatus,
  filterStatus,
  isFromAz,
  isHyundai
};
