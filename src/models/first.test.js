/*
 * just test
 */
const app = require("./app");
const expectRuntime = require("expect-runtime");
const expectR = expectRuntime;
const fs = require("fs");
const log = require("loglevel");
const du = require('du')
var PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-quick-search'));
log.setLevel("info");

describe("test", () => {

  it.skip("scan apps plist", async () => {
    const result = await app.getAppInfoList();
    expect(result.length).toBeGreaterThan(0);
  });

  describe("search", () => {
    let db;

    beforeEach(async () => {
      db = new PouchDB(app.DB_NAME);
      await db.destroy();
      db = new PouchDB(app.DB_NAME);
      await app.init();
    }, 1000*30);

    afterEach(async () => {
      db = new PouchDB(app.DB_NAME);
      await db.destroy();
    }, 1000*30);


    it("en", async () => {
      const found = await app.search("WeChat");
      expectR(found).lengthOf.least(1);
      expectR(found).match([{
        exe: expectR.anything(),
      }]);
    }, 1000*30);

    it.only("en", async () => {
      const found = await app.search("monitor");
      log.trace("found:", found);
      expectR(found).lengthOf.least(1);
      expectR(found).match([{
        exe: expectR.anything(),
      }]);
    }, 1000*30);

    it("zh", async () => {
      const found = await app.search("网易");
      expectR(found).lengthOf.least(1);
      expectR(found).match([{
        exe: expectR.anything(),
      }]);
    });

    it("partial", async () => {
      const found = await app.search("We");
      expectR(found).lengthOf.least(1);
      log.trace("found:", found);
      expectR(found).match([{
        exe: expectR.anything(),
      }]);
    });

    it("partial", async () => {
      const found = await app.search("monitor");
      expectR(found).lengthOf.least(1);
      log.trace("found:", found);
      expectR(found).match([{
        exe: expectR.anything(),
      }]);
    });


  });


  describe.skip("PounchDB", () => {
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
////      var lunr = require('../../node_modules/pouchdb-quick-search/node_modules/lunr');
////      require('lunr-languages/lunr.stemmer.support.js')(lunr);
////      require('lunr-languages/lunr.fr')(lunr);
////      //require('lunr-languages/lunr.multi.js')(lunr);
////      require('../../../test/lunr-languages/lunr.zh.js')(lunr);
////      expectRuntime(lunr).defined();
////      expectRuntime(lunr).property("zh").defined();
////      global.lunr = lunr;
//        var lunr = require('../../node_modules/pouchdb-quick-search/node_modules/lunr');
//        require('../../../test/lunr-languages/lunr.stemmer.support.js')(lunr);
//        require('../../../test/lunr-languages/lunr.fr')(lunr);
//        //require('lunr-languages/lunr.multi.js')(lunr);
//        require('../../../test/lunr-languages/lunr.zh.js')(lunr);
//        global.lunr = lunr;

      const isChineseEnabled = true
      if(isChineseEnabled){
        log.warn("load chinese index");
        const lunr = require('../../node_modules/pouchdb-quick-search/node_modules/lunr');
        require('../../node_modules/lunr-languages/lunr.stemmer.support.js')(lunr);
        require('../../node_modules/lunr-languages/lunr.zh')(lunr);
        //@ts-ignore
        global.lunr = lunr;
      }

      const apps = await app.getAppInfoList();
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
        language: isChineseEnabled? 'zh' : undefined,
      });
      log.warn("result:%o", result);
      expectRuntime(result).property("rows").lengthOf.least(1);
    });
  });

  it("files", async () => {
    var glob = require("glob");
    const files = glob.sync("/Users/deanchen/work/test/data/**/*.md");
    expectRuntime(files).lengthOf.above(0);
    log.info("files:", files.length);
    for(let file of files){
      const buffer = fs.readFileSync(file);
      const content = buffer.toString();
      log.trace("content:", content.slice(0, 10));
      log.trace("length: ", content.length);
    }

  });

  describe.skip("PounchDB big data", () => {
    var PouchDB = require("pouchdb");
    PouchDB.plugin(require('pouchdb-quick-search'));
    let db;

    beforeAll(async () => {
      db = new PouchDB("data.pdb");
    });

    afterAll(async () => {
      await db.destroy();
    });

    it("index, search", async () => {
//      var lunr = require('../../node_modules/pouchdb-quick-search/node_modules/lunr');
//      require('lunr-languages/lunr.stemmer.support.js')(lunr);
//      require('lunr-languages/lunr.fr')(lunr);
//      //require('lunr-languages/lunr.multi.js')(lunr);
//      require('../../../test/lunr-languages/lunr.zh.js')(lunr);
//      expectRuntime(lunr).defined();
//      expectRuntime(lunr).property("zh").defined();
//      global.lunr = lunr;
        var lunr = require('../../node_modules/pouchdb-quick-search/node_modules/lunr');
        require('../../../test/lunr-languages/lunr.stemmer.support.js')(lunr);
        require('../../../test/lunr-languages/lunr.fr')(lunr);
        //require('lunr-languages/lunr.multi.js')(lunr);
//        require('../../../test/lunr-languages/lunr.zh.js')(lunr);
        global.lunr = lunr;

        var glob = require("glob");
        let files = glob.sync("/Users/deanchen/work/test/data/**/*.md");
        expectRuntime(files).lengthOf.above(0);
        log.info("files:", files.length);
        files = files.slice(0, 500);
      
      let beginTime = Date.now();

      const appDocs = files.map((file,i) => {
        const buffer = fs.readFileSync(file);
        const content = buffer.toString();
        log.debug("content:", content.slice(0, 10));
        log.debug("length: ", content.length);
        return {
          _id: i + "",
          content,
        }
      });
      appDocs.forEach(async doc => {
        log.trace("doc:", doc);
        await db.put(doc);
      });
      log.warn("build index took time:%d", Date.now() - beginTime);
      beginTime = Date.now();
      const query = {
        query: "javascript",
        fields: {
          'content': 1,
        },
//        include_docs: true,
//        language: 'zh',
      }
      const result = await db.search(query);
      log.trace("result:%o", result);
      log.warn("take time: %d", Date.now() - beginTime);
      expectRuntime(result).property("rows").lengthOf.above(0);

      beginTime = Date.now();

      {
        const result = await db.search(query);
        log.warn("2 take time: %d", Date.now() - beginTime);
        expectRuntime(result).property("rows").lengthOf.above(0);
      }

      //check the size
      {
        const files = fs.readdirSync(".").filter(file => file.match(/data.pdb.*/));
        expectRuntime(files).defined();
        for(let f of files){
          let size = await du(f);
          console.log(`The size of ${f} is: ${size} bytes`)
        }
      }
    }, 1000*60*10);
  });

  it.skip("lunr chinese", () => {
    const found = app.search("网");
    expect(found.length).toBeGreaterThan(0);
  });



  it("icon", async () => {
    var path = "/Applications/Be Focused.app/";//Contents/Resources/AppIconlite.icns";
    const dataURL = await app.getIcon(path);
    console.log(dataURL.slice(0, 200));
    fs.writeFileSync("/Users/deanchen/work/temp/test.png", dataURL);
  });


  it.skip("open app", async () => {
    const shell = require("shelljs");
    const r = await shell.exec("open -a 网易有道词典");
    log.debug("shell:", r);
  });

});

