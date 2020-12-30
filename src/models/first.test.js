/*
 * just test
 */
const app = require("./app");
const expectRuntime = require("expect-runtime");
const fs = require("fs");
const log = require("loglevel");

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

  describe.only("PounchDB", () => {
    var PouchDB = require("pouchdb");
    PouchDB.plugin(require('pouchdb-quick-search'));
    let db;

    beforeAll(async () => {
      db = new PouchDB("localtest.pdb");
    });

    afterAll(async () => {
      await db.destroy();
    });

    it("index, search", async () => {
      var lunr = require('lunr');
      require('lunr-languages/lunr.stemmer.support.js')(lunr);
      require('lunr-languages/lunr.fr')(lunr);
      require('lunr-languages/lunr.multi.js')(lunr);
      require('../../../test/lunr-languages/lunr.zh.js')(lunr);
      expectRuntime(lunr).defined();
      expectRuntime(lunr).property("multiLanguage").defined();
      global.lunr = lunr;

      const apps = app.getAppInfoList();
      const appDocs = apps.map((a,i) => {
        return {
          _id: i + "",
          ...a
        }
      });
      appDocs.forEach(async doc => {
      log.debug("doc:", doc);
        await db.put(doc);
      });
      const result = await db.search({
        query: "网",
        fields: {
          'name': 1,
        },
        include_docs: true,
        language: 'zh',
      });
      log.warn("result:", result);
      expectRuntime(result).property("rows").lengthOf.above(0);
    });
  });

  it("lunr chinese", () => {
    const found = app.search("网");
    expect(found.length).toBeGreaterThan(0);
  });



  it("icon", async () => {
    var iconutil = require('iconutil');

    var path = "/Applications/Be Focused.app/Contents/Resources/AppIconlite.icns";

    const bufferMap = await (new Promise((res, rej) => {
      iconutil.toIconset(path, function(err, icons) {
        // icons is an an object where keys are the file names
        // and the values are Buffers containing PNG files
        console.log("err:", err);
        console.log("icons:", icons);
        res(icons);
      });
    }));
    expectRuntime(bufferMap).defined();
    const buffers =  Object.values(bufferMap);
    const buffer = buffers.pop();
    var string = buffer.toString('base64');
    var dataURL = "data:image/png;base64," + string
    console.log(dataURL.slice(0, 200));
    fs.writeFileSync("/Users/deanchen/work/temp/test.png", dataURL);

  });

});
