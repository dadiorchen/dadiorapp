import React from 'react';
import './App.css';
import Search from "@material-ui/icons/Search";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from '@material-ui/core/styles';
import Calculator from "./AppIcon_128x128x32.png";
import Longman from "./longman.png";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
//import Icon from "/Applications/Be Focused.app/Contents/Resources/AppIconlite.icns";

//dev
if(!window.require){
  //@ts-ignore
  window.require= function(){
    return {
      ipcRenderer: {
        invoke: async (_: any, text: string) => {
          console.log("mock invoke:", text);
          if(text === "1"){
            return {
              type: "calculator",
              result: 2
            };
          }else if(text === "l t"){
            return {
              type: "openUrl",
              result: {
                url: "https://www.ldoceonline.com/dictionary/test",
              }
            };
          }else if(text === "qq"){
            return {
              type: "openApp",
              result: {
                list: [{
                  name: "QQ",
                  exe: "qq",
                },{
                  name: "WeChat",
                  exe: "wechat",
                }],
              }
            };
          }else{
            return undefined;
          }
        }
      }
    };
  }
}

const HEIGHT = 56;
const BACKGROUND_COLOR = "#5B5B5B"
const GRAY_COLOR = "#D5D1CA"
const GRAY_COLOR_2 = "#a5a39e"

const useStyles = makeStyles({
  root: {
    background: BACKGROUND_COLOR,
    height: "100vh",
  },
  headBox:{
    justifyContent: "space-between",
    height: HEIGHT ,
  },
  searchBox:{
    width: HEIGHT,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  searchIcon: {
    fontSize: 32,
    fill: GRAY_COLOR,
  },
  inputBox:{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  input: {
    width: "100%",
    color: GRAY_COLOR,
    fontSize: 32,
    border: "0px solid white",
    outline: "none",
    background: BACKGROUND_COLOR,
  },
  divider:{
    background: GRAY_COLOR_2,
  },
  box2: {
    flexGrow: 1,
  },
  box3: {
    flexWrap: "nowrap",
    flexDirection: "row",
    height: "100%",
  },
  box4: {
  },
  calBox: {
    height: "100%",
    flexDirection: "column",
    padding: 20,
    flexWrap: "nowrap",
  },
  calBoxUp: {
    height: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    padding: 10,
    color: GRAY_COLOR,
  },
  calBoxDown: {
    height: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 10,
    color: GRAY_COLOR,
  },
  listBox: {
    flexDirection: "column",
  },
  listItemBox: {
    color: GRAY_COLOR,
    padding: "10px 20px",
  },
  listHighlight: {
    background: "#155FCF",
  },
});

const ipc = window.require("electron").ipcRenderer;
const {shell} = window.require("electron");

function launchLongman(keyword: any){
  console.log("lanch Longman");
  shell.openExternal(`https://www.ldoceonline.com/dictionary/${keyword}`)
    .then(() => {
      console.log("shell opened");
      setTimeout(() => {
        ipc.send("close-window");
      }, 500);
    });
}

function cal(text: any){
  return ipc.invoke("cal", text);
}

function close(){
  return ipc.send("close-window");
}

function App() {
  const refInput = React.useRef(null);
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const classes = useStyles();
  const [mode, setMode] = React.useState("");
//  const [result, setResult] = React.useState<any>(undefined);
  const [result, setResult] = React.useState<any>(
            {
              type: "openApp",
              result: {
                list: [{
                  name: "QQ",
                  exe: "qq",
                },{
                  name: "WeChat",
                  exe: "wechat",
                }],
              }
            });
  const [listIndex, setListIndex] = React.useState<number>(0);
  function handleKeyUp(e: any){
    console.log("handle key:", e.key);
      if(e.key === "Enter"){
        console.log("enter");
        if(result.type === "openUrl"){
          ipc.invoke("action", "openUrl", result.result.url);
          //launchLongman(result.result.url);
        }else if(result.type === "openApp"){
          ipc.invoke("action", "openApp", result.result.list[listIndex]);
        }
//        var match
//        if(input && (match = input.match(/l\s+(.*)/))){
//          console.log("launch longman", match[1]);
//          launchLongman(match[1]);
//        }
      }else if(e.key === "Escape"){
        console.log("escape");
        if(input !== ""){
          console.log("clean");
          setInput("");
          setOutput("");
        }else{
          console.log("close");
          close();
        }
      }else if(e.key === "ArrowUp"){
        if(result?.type === "openApp"){
          setListIndex(
            listIndex === 0?
              result.result.list.length -1
            :
              (listIndex - 1) % result.result.list.length);
        }
      }else if(e.key === "ArrowDown"){
        if(result?.type === "openApp"){
          setListIndex((listIndex + 1) % result.result.list.length);
        }
      }
  }

  function handleChange(e: any){
    console.log("handle...", e.target);
    setInput(e.target.value);
    ipc.invoke("handleInputChange", e.target.value)
      .then((r: any) => {
        setResult(r);
//        if(r.type === "calculator"){
//          setOutput(r.result + "");
//          setMode("calculator");
//        }else if(r.type === "openUrl"){
//          setOutput('');
//          setMode("longman");
//        }
      });
//    cal(e.target.value)
//      .then((r: any) => {
//        if(r){
//          console.log("r:", r);
//          setOutput(r + "");
//          setMode("calculator");
//        }else{
//          var match;
//          if(input && (match = input.match(/l\s+(.*)/))){
//            setOutput('');
//            setMode("longman");
//          }else{
//            setOutput('');
//            setMode("");
//          }
//        }
//      });
  }

  React.useEffect(() => {
    console.log("effect");
    //@ts-ignore
    refInput.current.focus();
  }, []);

//  window.addEventListener("focus", function(e){
//    console.log("window focus");
//    setTimeout(() => {
//      console.log("focus focus");
//      input.focus();
//    });
//  });
//
//  window.onload = function(e){
//    console.log("on load");
//    setTimeout(() => {
//      console.log("load focus");
//      input.focus();
//    });
//  }
  return (
    <Grid container className={classes.root} direction="column" >
      <Grid item>
        <Grid container className={classes.headBox} >
          <Grid item className={classes.searchBox} >
            <Search className={classes.searchIcon} />
          </Grid>
          <Grid item className={classes.inputBox} >
            <input 
              className={classes.input}
              placeholder="Dadior Search"
              ref={refInput} 
              onChange={handleChange} 
              onKeyUp={handleKeyUp}
              style={{fontSize: 25}} 
              value={input} />
          </Grid>
          <Grid item className={classes.searchBox} >
            {!result &&
              <Box/>
            }
            {result?.type === "calculator" &&
              <Avatar variant="rounded" src={Calculator} />
            }
            {result?.type === "openUrl" &&
              <Avatar variant="rounded" src={Longman} />
            }
            {result?.type === "openApp" && result?.result?.list && result.result.list[listIndex]?.icon &&
              <Avatar variant="rounded" src={result.result.list[listIndex].icon} />
            }
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Divider className={classes.divider} />
      </Grid>
      <Grid item className={classes.box2} >
        <Grid container className={classes.box3} >
          <Grid item xs={4} >
            {result?.type === "openApp" &&
              <Grid container className={classes.listBox} >
                {result?.result.list.map((app: any, i: number) => 
                  <Grid item className={`${classes.listItemBox} ${i === listIndex?classes.listHighlight:''}`} >
                    {app.name}
                  </Grid>
                )}
              </Grid>
            }
          </Grid>
          <Grid item>
            <Divider className={classes.divider} orientation="vertical" />
          </Grid>
          <Grid item xs={8} >
            {result?.type === "calculator" &&
              <Grid container className={classes.calBox} >
                <Grid item className={classes.calBoxUp} >
                  <Typography variant="h5" >
                    {input} = 
                  </Typography>
                </Grid>
                <Grid item>
                  <Divider className={classes.divider} />
                </Grid>
                <Grid item className={classes.calBoxDown} >
                  <Typography variant="h4" >
                    <span>{result.result}</span>
                  </Typography>
                </Grid>
              </Grid>
            }
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default App;
