const axios = require("axios");
const expect = require("expect-runtime");
const log = require("loglevel");

class Monitor{

  constructor(){
    this._timer = undefined;
  }

  onAlert(alertHandler){
    this._alertHandler = alertHandler;
  }

  stop(){
    clearInterval(this._timer);
  }
  
  start(){
    log.warn("start...");
    this._timer = setInterval(async () => {
      log.error("a beat");
      try{
        await axios.get("http://localhost:5984");
      }catch(e){
        log.error("catch...,", e.message);
        if(e.message === "Network Error"){
          log.error("in:", this._alertHandler);
          this._alertHandler();
        }else{
          expect.fail();
          log.warn("unkown error:", e);
        }
      }
      log.error("a beat end.");
    }, 1000);
  }
}

module.exports = Monitor;
