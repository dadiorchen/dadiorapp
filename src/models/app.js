const fs = require("fs");
const expectRuntime = require("expect-runtime");

module.exports = {
  getAppInfo: function(plistFile){
    const content = fs.readFileSync(plistFile);
    console.log("content:", content.toString().slice(0,100));
    const plist = require("plist");
    try{
      const plistObject = plist.parse(content.toString());
      //console.log("parsed plist:", plistObject);
      return {
        name: plistObject.CFBundleDisplayName || plistObject.CFBundleName,
        exe: plistObject.CFBundleExecutable,
      }
    }catch(e){
      console.error("parse plist fail:", e);
      throw 500;
    }
  },
  getAppInfoList: function(){
    const pathAppDir = "/Applications";
    const dirs = fs.readdirSync(pathAppDir);
    console.log("dirs:", dirs);
    let counter = 0;
    const result = [];
    dirs.forEach(dir => {
      if(dir.match("^.*\.app$")){
        const path = `${pathAppDir}/${dir}/Contents/Info.plist`;
        console.log("path of app:", path);
        expect(fs.existsSync(path)).toBe(true);
        try{
          const one = this.getAppInfo(path);
          expect(one.name).toBeDefined();
          expect(one.exe).toBeDefined();
          console.log(`open -a "${result.exe}"`);
          counter++;
          result.push(one);
        }catch(e){
          if(e === 500){
            console.warn("parse plist failed!");
          }else{
            throw e;
          }
        }
      }else{
        console.warn("bad app:", dir);
      }
    });
    console.log("sucessed %d, total: %d", counter, dirs.length);
    return result;
  },
  search: function(keyword){
    const lunr = require("lunr");
    const apps = this.getAppInfoList();
    const appDocs = apps.map((a,i) => {
      return {
        id: i,
        ...a
      }
    });
    var idx = lunr(function () {
      this.field('name')
      appDocs.forEach(doc => {
      console.log("doc:", doc);
        this.add(doc);
      });
    })

    const result = idx.search(keyword)
    console.log("result:", result);
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
    console.log("find:", find);
    return find;
  },
}
