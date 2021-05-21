var PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-quick-search'));
const log = require("loglevel");
log.setLevel("debug");

describe("To test the pouchdb behavior", () => {

  it("Search keyword", async () => {
    const lunr = require('../../node_modules/pouchdb-quick-search/node_modules/lunr');
    require('../../node_modules/lunr-languages/lunr.stemmer.support.js')(lunr);
    require('./lunr.zh')(lunr);
    //@ts-ignore
    global.lunr = lunr;
    const dbName = "test-search";
    let db = new PouchDB(dbName);
    log.info("init db, reset the db...");
    //clean
    await db.destroy();
    db = new PouchDB(dbName);
    log.info("new one");

    const apps = [{
      name: "cat",
    },{
      name: "WeChat",
    },{
      name: "网易",
    }];
    log.info("got app info");
    const appDocs = apps.map((a,i) => {
      return {
        _id: i + "",
        name: a.name,
      }
    });
    for(const doc of appDocs){
      log.log("doc:", doc);
      try{
        await db.put(doc);
      }catch(e){
        log.error("error when put doc:", e);
      }
    }
    log.info("put doc");
    {
      const result = await db.search({
        query: "we",
      fields: {
        'name': 1,
      },
        include_docs: true,
        language: 'zh',
      });
      log.info("searched");
      log.info("result:%o", result);
      expect(result.rows).toHaveLength(1);
    }
    {
      const result = await db.search({
        query: "网",
        fields: ['name'],
        include_docs: true,
        language: 'zh',
      });
      log.info("searched");
      log.info("result:%o", result);
      expect(result.rows).toHaveLength(1);
    }

  });
});
