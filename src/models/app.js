const fs = require("fs");
const expectRuntime = require("expect-runtime");
const log = require("loglevel");

module.exports = {
  getAppInfo: function(plistFile){
    const content = fs.readFileSync(plistFile);
    log.log("content:", content.toString().slice(0,100));
    const plist = require("plist");
    try{
      const plistObject = plist.parse(content.toString());
      //log.log("parsed plist:", plistObject);
      return {
        name: plistObject.CFBundleDisplayName || plistObject.CFBundleName,
        exe: plistObject.CFBundleExecutable,
      }
    }catch(e){
      log.log("parse plist fail:", e);
      throw 500;
    }
  },
  getAppInfoList: function(){
    const pathAppDir = "/Applications";
    const dirs = fs.readdirSync(pathAppDir);
    log.log("dirs:", dirs);
    let counter = 0;
    const result = [];
    dirs.forEach(dir => {
      if(dir.match("^.*\.app$")){
        const path = `${pathAppDir}/${dir}/Contents/Info.plist`;
        log.log("path of app:", path);
        expect(fs.existsSync(path)).toBe(true);
        try{
          const one = this.getAppInfo(path);
          expect(one.name).toBeDefined();
          expect(one.exe).toBeDefined();
          log.log(`open -a "${result.exe}"`);
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
    });
    log.log("sucessed %d, total: %d", counter, dirs.length);
    return result;
  },
  search: function(keyword){
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
      log.debug("doc:", doc);
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
}
