const config = require("./config.js");
const utils = require("./utils.js");

describe("index", () => {
  beforeEach(() => jest.resetModules());

  describe("createStatus function", () => {
    beforeEach(() => {
      jest.mock("./config.js", () => ({
        keyword: {
          correct: "Tucson",
          incorrect: "Tuscon"
        },

        interjections: ["Oh no!"],
        locations: ["az", "arizona", "phoenix", "tucson"],
        hyundaiKeywords: ["car", "dealership", "hyundai", "suv"]
      }));
    });

    it("does not add extra message if user is not from AZ", () => {
      const utils = require("./utils.js");
      const status = {
        user: {
          name: "Twitter User",
          screen_name: "twitterUser",
          location: "The Moon"
        },
        id_str: "12345",
        full_text: "Eegees is the best in Tuscon!"
      };
      expect(utils.createStatus(status)).toEqual(
        "Oh no! Twitter User (twitterUser) misspelled Tucson #itstucson https://twitter.com/twitterUser/status/12345"
      );
    });

    it("adds extra message if user is from AZ", () => {
      const utils = require("./utils.js");
      const status = {
        user: {
          name: "Twitter User",
          screen_name: "twitterUser",
          location: "Tucson, AZ"
        },
        id_str: "12345",
        full_text: "Eegees is the best in Tuscon!"
      };
      expect(utils.createStatus(status)).toEqual(
        "Oh no! Twitter User (twitterUser) misspelled Tucson, and even worse, it looks like they are from Arizona! 🤦 #itstucson #hallofshame https://twitter.com/twitterUser/status/12345"
      );
    });

    it("adds extra message if there is a Hyundai keyword", () => {
      const utils = require("./utils.js");
      const status = {
        user: {
          name: "Twitter User",
          screen_name: "twitterUser",
          location: ""
        },
        id_str: "12345",
        full_text: "I love my Hyundai Tuscon!"
      };
      expect(utils.createStatus(status)).toEqual(
        "Oh no! Twitter User (twitterUser) misspelled Tucson. Also, did you know that the Hyundai SUV is named after Tucson, Arizona? #itstucson https://twitter.com/twitterUser/status/12345"
      );
    });

    it("adds both extra messages", () => {
      const utils = require("./utils.js");
      const status = {
        user: {
          name: "Twitter User",
          screen_name: "twitterUser",
          location: "AZ"
        },
        id_str: "12345",
        full_text: "I love my Hyundai Tuscon!"
      };
      expect(utils.createStatus(status)).toEqual(
        "Oh no! Twitter User (twitterUser) misspelled Tucson, and even worse, it looks like they are from Arizona! 🤦 Also, did you know that the Hyundai SUV is named after Tucson, Arizona? #itstucson https://twitter.com/twitterUser/status/12345"
      );
    });
  });

  describe("filterStatus function", () => {
    it("returns true when status contains incorrect keyword", () => {
      const status = {
        full_text: "Tuscon, AZ is rad!",
        entities: { user_mentions: [] }
      };
      expect(utils.filterStatus(status)).toEqual(true);
    });

    describe("returns false when status contains  ", () => {
      it("case sensitive keyword", () => {
        const status = {
          full_text: "I'm going to TusCon in Tuscon, AZ!",
          entities: { user_mentions: [] }
        };
        expect(utils.filterStatus(status)).toEqual(false);
      });

      it("user mention contains keyword", () => {
        const status = {
          full_text: "I'm going to Tuscon, AZ!",
          entities: { user_mentions: [{ screen_name: "itstuscon" }] }
        };
        expect(utils.filterStatus(status)).toEqual(false);
      });
    });
  });

  describe("isFromAz function", () => {
    it("returns true when from AZ", () => {
      expect(utils.isFromAz("AZ")).toEqual(true);
      expect(utils.isFromAz("Arizona")).toEqual(true);
      expect(utils.isFromAz("Tucson, AZ")).toEqual(true);
      expect(utils.isFromAz("Phoenix")).toEqual(true);
    });

    it("returns false when not from AZ", () => {
      expect(utils.isFromAz("Kalamazoo, MI")).toEqual(false);
      expect(utils.isFromAz("HyundaiTucson")).toEqual(false);
    });
  });

  describe("isHyundai function", () => {
    it("returns true when status contains keyword", () => {
      expect(utils.isHyundai("SUV")).toEqual(true);
      expect(utils.isHyundai("SUV,")).toEqual(true);
      expect(utils.isHyundai("Hyundai")).toEqual(true);
    });

    it("returns false when status does not contain keyword", () => {
      expect(utils.isHyundai("honda")).toEqual(false);
    });
  });
});
