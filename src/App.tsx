import React from 'react';
import logo from './logo.svg';
import './App.css';

const ipc = window.require("electron").ipcRenderer;
const {shell} = window.require("electron");

function launchLongman(keyword: any){
  console.log("lanch Longman");
  shell.openExternal(`https://www.ldoceonline.com/dictionary/${keyword}`)
  setTimeout(() => {
    ipc.send("close-window");
  }, 500);
}

function cal(text: any){
  return ipc.invoke("cal", text);
}

function App() {
  const refInput = React.useRef(null);
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");

  function handleKeyUp(e: any){
      if(e.key === "Enter"){
        console.log("enter");
        var match
        if(input && (match = input.match(/l\s+(.*)/))){
          console.log("launch longman", match[1]);
          launchLongman(match[1]);
        }
      }
  }

  function handleChange(e: any){
    console.log("handle...", e.target);
    setInput(e.target.value);
    cal(e.target.value)
      .then((r: any) => {
        if(r){
          setOutput(r);
        }else{
          setOutput('');
        }
      });
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
    <div style={{background:"white"}}>
      <input 
        ref={refInput} 
        onChange={handleChange} 
        onKeyUp={handleKeyUp}
        style={{fontSize: 25}} 
        value={input} />
      <span 
        style={{
          marginTop: 5,
          fontSize:25}}
      >{output}</span>
    </div>
  );
}

export default App;
