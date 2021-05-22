const fs = require("fs");
const expectRuntime = require("expect-runtime");
const expect = expectRuntime;
//const log = require("loglevel");
const DB_NAME = "dadiorapp.db";
//init DB
var PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-quick-search'));
const isChineseEnabled = true
const iconutil = require('iconutil');
const glob = require("glob");
const log = require('electron-log');
log.trace = () => {};

module.exports = {
  DB_NAME,
  db: undefined,
  getAppInfo: function(plistFile){
    const content = fs.readFileSync(plistFile);
    log.log("content:", content.toString().slice(0,100));
    const plist = require("plist");
    try{
      const plistObject = plist.parse(content.toString());
      //log.log("parsed plist:", plistObject);
      const result = {
        name: plistObject.CFBundleDisplayName || plistObject.CFBundleName,
        exe: plistObject.CFBundleExecutable,
      }
      if(!result.name || !result.exe){
        console.error("bad app:", one, "path:", plistObject);
        throw new Error("bad app");
      }
      return result;
    }catch(e){
      log.trace("parse plist fail:", e);
      throw 500;
    }
  },
  getAppInfoList: async function(){
    const pathAppDir = "/Applications";
    const dirsA = fs.readdirSync(pathAppDir).map(d => `${pathAppDir}/${d}`);
    const pathAppDirB = "/Applications/Utilities";
    const dirsB = fs.readdirSync(pathAppDirB).map(d => `${pathAppDirB}/${d}`);
    const pathAppDirC = "/System/Applications";
    const dirsC = fs.readdirSync(pathAppDirC).map(d => `${pathAppDirC}/${d}`);
    const dirs = [...dirsA, ...dirsB, ...dirsC];
    log.log("dirs:", dirs);
    let counter = 0;
    const result = [];
    for(let dir of dirs){
      if(dir.match("^.*\.app$")){
        const path = `${dir}/Contents/Info.plist`;
        log.info("path of app:", path);
        if(!fs.existsSync(path)){
          log.warn("can not find info list file:", path);
          continue;
        }
        try{
          const one = this.getAppInfo(path);
          log.log(`open -a "${result.exe}"`);
          //icon
          const dataURL = await this.getIcon(`${dir}/Contents/`); 
          one.icon = dataURL;
          counter++;
          result.push(one);
        }catch(e){
          if(e === 500){
            log.debug("parse plist failed!");
          }else{
            throw e;
          }
        }
      }else{
        log.debug("bad app:", dir);
      }
    };
    log.log("sucessed %d, total: %d", counter, dirs.length);
    return result;
  },
  init: async function(path){
    //DB
    const realPath = `${path? path+"/":""}${DB_NAME}`;
    this.db = new PouchDB(realPath);
    log.info("init db, reset the db...");
    //clean
    await this.db.destroy();
    this.db = new PouchDB(realPath);
    log.info("new one");
    if(isChineseEnabled){
      log.warn("load chinese index");
      const lunr = require('../../node_modules/pouchdb-quick-search/node_modules/lunr');
      require('../../node_modules/lunr-languages/lunr.stemmer.support.js')(lunr);
      require('./lunr.zh')(lunr);
      //@ts-ignore
      global.lunr = lunr;
    }

    const apps = await this.getAppInfoList();
    log.info("got app info");

    //manually add some item
    apps.push({
      name: "Activity Monitor",
      exe: "Activity Monitor",
    });
    const appDocs = apps.map((a,i) => {
      return {
        _id: i + "",
        ...a
      }
    });
    appDocs.forEach(async doc => {
    log.trace("doc:", doc);
      await this.db.put(doc);
    });
    log.info("put doc");
    const result = await this.db.search({
      query: "网",
      fields: {
        'name': 1,
      },
      include_docs: true,
      language: isChineseEnabled? 'zh' : undefined,
    });
    log.info("searched");
    log.info("result:%o", result);
    //expectRuntime(result).property("rows").lengthOf.least(1);
  },
  search: async function(keyword){
    const result = await this.db.search({
      query: keyword,
      fields: {
        'name': 1,
      },
      include_docs: true,
      language: isChineseEnabled? 'zh' : undefined,
    });
    return result.rows.map(i => i.doc);
  },
  searchDeprecated: function(keyword){
    const lunr = require("lunr");
    const language = "zh";
    require('../../../test/lunr-languages/lunr.stemmer.support.js')(lunr);
    require('../../../test/lunr-languages/lunr.' + language + '.js')(lunr);
    const apps = this.getAppInfoList();
    const appDocs = apps.map((a,i) => {
      return {
        id: i,
        ...a
      }
    });
    var idx = lunr(function () {
      this.use(lunr[language]);
      this.field('name')
      appDocs.forEach(doc => {
      log.trace("doc:", doc);
        this.add(doc);
      });
    })

    const result = idx.search(keyword)
    log.log("result:", result);
    const find = result.map(r => {
      expectRuntime(r).match({
        ref: expectRuntime.anything(),
      });
      const doc = appDocs.reduce((a,c) => {
        if(c.id === parseInt(r.ref)){
          return c;
        }else{
          return a;
        }
      }, undefined);
      expectRuntime(doc).defined();
      return doc;
    });
    log.log("find:", find);
    return find;
  },
  getIcon: async function(dir){
    const files = glob.sync(`${dir}/**/*.icns`);
    const path = files[0];
    expect(path).match(/.*\.icns/);
    const bufferMap = await (new Promise((res, _rej) => {
      iconutil.toIconset(path, function(err, icons) {
        // icons is an an object where keys are the file names
        // and the values are Buffers containing PNG files
        log.trace("err:", err);
        log.trace("icons:", icons);
        res(icons);
      });
    }));
    if(!bufferMap){
      log.warn("can not load icon:", path);
      return undefined;
    }else{
      const buffers =  Object.values(bufferMap);
      const buffer = buffers.pop();
      var string = buffer.toString('base64');
      var dataURL = "data:image/png;base64," + string
      return dataURL;
    }
  },
}
