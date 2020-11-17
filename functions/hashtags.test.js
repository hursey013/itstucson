const hashtags = require("./hashtags");

describe("hashtags", () => {
  describe("hallofshame hashtag", () => {
    it("added when user is from Tucson", () => {
      expect(hashtags.hallofshame({ location: "Tucson, AZ" })).toEqual(
        "hallofshame"
      );
    });

    it("not added when user is not from Tucson", () => {
      expect(hashtags.hallofshame({ location: "Phoenix, Arizona" })).toEqual(
        false
      );
    });
  });

  describe("verified hashtag", () => {
    it("added when user is verified", () => {
      expect(hashtags.verified({ verified: true })).toEqual("verified");
    });

    it("not added when user is not verified", () => {
      expect(hashtags.verified({ verified: false })).toEqual(false);
    });
  });
});
