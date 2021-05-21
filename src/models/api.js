const expect = require("expect-runtime");
const log = require('electron-log');
const app = require("./app");
//log.setLevel("debug");

/*
 * The api to handle input change from UI
 */

module.exports = {
  handleInputChange: async function(input){
    //try to calculate
    try{
      const result = eval(input);
      const calResult = parseFloat(result);
      if(calResult){
        log.debug("cal:", calResult);
        return {
          type: "calculator",
          result: calResult
        }
      }
    }catch(e){
      log.debug("fail:", e);
    }

    //longman case
    let match
    if(input && (match = input.match(/l\s+(.*)/))){
      return {
        type: "openUrl",
        result: {
          url: `https://www.ldoceonline.com/dictionary/${match[1]}`,
        }
      }
    }

    //search app
    const searchResult = await app.search(input);
    return {
      type: "openApp",
      result: {
        list: searchResult,
      },
    }
  },
  action: async function(type, opt){
//    console.info("action:", type, opt);
//    const shell = require("shelljs");
//    shell.config.execPath = String(shell.which('node'))
//    if(type === "openUrl"){
//      const r = await shell.exec(`open ${opt}`);
//    }else if(type === "openApp"){
//      const r = await shell.exec(`open -a "${opt.exe}"`);
//    }
    log.info("action:",type, opt);
    async function exe(command){
      const {execSync} = require("child_process");
      try{
        const result = execSync(command).toString();
      }catch(e){
        log.error("get error when exe command:", e);
      }
    }
    if(type === "openUrl"){
      const r = await exe(`open ${opt}`);
    }else if(type === "openApp"){
      const r = await exe(`open -a "${opt.exe}"`);
    }
    
    
  },
}
