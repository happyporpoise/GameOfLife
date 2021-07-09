const socket = io();
socket.on('timeOut',()=>{
  socket.close();
  alert("Your session is timed out");
  redirect("");
});

window.ggluser = JSON.parse(window.localStorage.getItem('ggl.user'));

if (window.ggluser === null) {
  window.ggluser={
    'name':'',
    'gameMode':'FFA',
  };
}

keyboarddMap={
  "KeyS"      : "movingDown",
  "ArrowDown" : "movingDown",
  "KeyW"      : "movingUp",
  "ArrowUp"   : "movingUp",
  "KeyA"      : "movingLeft",
  "ArrowLeft" : "movingLeft",
  "KeyD"      : "movingRight",
  "ArrowRight": "movingRight",
  "KeyI"      : "pressedNE",
  "KeyO"      : "pressedNE",
  "KeyY"      : "pressedNW",
  "KeyU"      : "pressedNW",
  "KeyH"      : "pressedSW",
  "KeyJ"      : "pressedSW",
  "KeyK"      : "pressedSE",
  "KeyL"      : "pressedSE",
}

function sendEvent(tag,id){
  return (e) => {
    if(e.type=="keyup"||e.type=="keydown"){
      if (e.defaultPrevented || !(e.code in keyboarddMap)) {
        return; // Do nothing if event already handled
      }
      socket.emit(tag, id, keyboarddMap[e.code]);
      e.preventDefault();
    }
  }
}

function redirect(tag){
  window.localStorage.setItem('ggl.user', JSON.stringify(window.ggluser));
  window.location.href=window.location.origin+"/"+tag.toLowerCase();
}

function gameEnter(){
  window.ggluser.name=document.getElementById("usernameInput").value;
  if(window.ggluser.name==""){
    alert("Please set your username");
    return;
  };
  if(window.ggluser.gameMode!="FFA" && window.ggluser.gameMode!="SINGLE"){
    alert("Please choose a game mode");
    return;
  };
  redirect(window.ggluser.gameMode)
}

function setGame(gameMode){
  socket.on('connect', () => {
    console.log(socket.id)
    window.ggluser['socketid']=socket.id;
    window.ggluser['gameMode']=gameMode;

    socket.emit("setGame", window.ggluser.name, gameMode,
      (response)=>{
        
        if(!response || response.status!="SUCCESS"){
          alert((response.errcode) ? response.errcode : "Uncaught error, please try again later." );
          redirect("");
        }
        else{

          socket.on("drawScoreBoard", drawScoreBoard);
          
          window.cb = new colorBoard(response.numColumns,response.numRows);;

          setupVar(GUI_MODE);
          
          socket.on("gameUpdate", processGameUpdate);
            initState();
            startRendering();
            socket.on("dead", () => {
              gameEnd("dead")
            });
            if(gameMode=="SINGLE"){
              socket.on("singleClear", (i) => {
                gameEnd("singleClear",i);
              });
          }

          window.addEventListener("keydown", sendEvent("keydown", window.ggluser.name));
          window.addEventListener("keyup", sendEvent("keyup", window.ggluser.name));
        }

      }
    );
  });
}


function gameEnd(tag,i){
  socket.close();
  if(tag=="dead"){
    document.getElementById("gameResult").textContent="Game over 😢"
  }
  if(tag=="singleClear"){
    document.getElementById("gameResult").textContent="CLEAR!"
    const rankingButton=document.createElement("button");
    rankingButton.textContent="RANKING #"+(i+1);
    document.getElementById('dead-alert').appendChild(rankingButton);
  }
  document.getElementById('dead-alert').style.visibility='visible';
}