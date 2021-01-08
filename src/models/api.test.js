const api = require("./api");
const expectR = require("expect-runtime");
const sinon = require("sinon");
const app = require("./app");

describe.skip("api", () => {

  it("1+1", async () => {
    const r = await api.handleInputChange("1+1");
    expectR(r).match({
      type: "calculator",
      result: 2,
    });
  });

  it("l test", async () => {
    const r = await api.handleInputChange("l test");
    expectR(r).match({
      type: "openUrl",
      result: {
        url: "https://www.ldoceonline.com/dictionary/test",
      },
    });
  });

  it("wechat", async () => {
    sinon.stub(app, "search").returns([{
      name: "x",
      exe: "e",
    }]);
    const r = await api.handleInputChange("wechat");
    expectR(r).match({
      type: "openApp",
      result: {
        list: [{
          name: expectR.any("string"),
          exe: expectR.any("string"),
        }],
      },
    });
  });

  describe.skip("action", () => {

    it("open url", async () => {
      await api.action("openUrl", "http://www.baidu.com");
    });

    it("open app", async () => {
      await api.action("openApp", {name: "网易有道词典", exe: "网易有道词典"});
    });
  });

});
