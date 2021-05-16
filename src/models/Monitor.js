const axios = require("axios");
const expect = require("expect-runtime");
const log = require('electron-log');

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
      log.warn("a beat");
      try{
//        await axios.get("http://localhost:5984");
        await axios.get("http://midinote.me:5984/");
      }catch(e){
        log.error("catch...,", e.message);
        if(e.message.match("Network Error") || e.message.match(/ECONNREFUSED/)){
          log.error("in:", this._alertHandler);
          this._alertHandler();
        }else{
          log.warn("unkown error:", e);
        }
      }
      log.error("a beat end.", new Date());
    }, 1000*60*30);
  }
}

module.exports = Monitor;
