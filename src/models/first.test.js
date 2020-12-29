/*
 * just test
 */
const app = require("./app");
const expectRuntime = require("expect-runtime");

describe("test", () => {

  it.skip("", () => {
    const os = require('os');
    const { exec } = require('shelljs');

    const APP_REF = 'com.tnt.Adobe-Zii-2019';//'com.adobe.Photoshop';
    const isMacOs = os.platform() === 'darwin';

    /**
     * Helper function to shell out various commands.
     * @returns {String} The result of the cmd minus the newline character.
     */
    function shellOut(cmd) {
      return exec(cmd, { silent: true }).stdout.replace(/\n$/, '');
    }


    if (isMacOs) {

      const appName = shellOut(`osascript -e 'tell application "Finder" \
      to get displayed name of application file id "${APP_REF}"'`);

      console.log("app name:", appName);

      if (appName) {
        const version = shellOut(`osascript -e 'tell application "Finder" \
        to get version of application file id "${APP_REF}"'`).split(' ')[0];

        console.log(version); // Log the version to console.

        //shellOut(`open -a "${appName}"`); // Launch the application.
      } else {
        console.log('Photoshop is not installed');
      }
    }
  });

  it("get display name", () => {
    const path = "/Applications/WeChat.app/Contents/Info.plist";
    const result = app.getAppInfo(path);
    expect(result.name).toBeDefined();
    expect(result.exe).toBeDefined();
  });

  it("get display name, special", () => {
    const path = "/Applications/Keynote.app/Contents/Info.plist";
    expect(() => {
      app.getAppInfo(path);
    }).toThrow();
  });

  it("scan apps plist", () => {
    const result = app.getAppInfoList();
    expect(result.length).toBeGreaterThan(0);
  });

  it("lunr", () => {
    const found = app.search("WeChat");
    expect(found.length).toBeGreaterThan(0);
  });

  it.only("lunr chinese", () => {
    const found = app.search("网");
    expect(found.length).toBeGreaterThan(0);
  });

});
