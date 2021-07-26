const socket = io();
socket.on("timeOut", () => {
  socket.close();
  alert("Your session is timed out");
  redirect("");
});

window.ggluser = JSON.parse(window.localStorage.getItem("ggl.user"));

if (window.ggluser === null) {
  window.ggluser = {
    singlelevel: 0,
    name: "",
    gameMode: "FFA",
  };
}

keyboardMap = JSON.parse(window.localStorage.getItem("keyboardMap"));
if (keyboardMap === null) {
  keyboardMap = {
    KeyS: "movingDown",
    ArrowDown: "movingDown",
    KeyW: "movingUp",
    ArrowUp: "movingUp",
    KeyA: "movingLeft",
    ArrowLeft: "movingLeft",
    KeyD: "movingRight",
    ArrowRight: "movingRight",
    KeyI: "pressedNE",
    KeyO: "pressedNE",
    KeyY: "pressedNW",
    KeyU: "pressedNW",
    KeyH: "pressedSW",
    KeyJ: "pressedSW",
    KeyK: "pressedSE",
    KeyL: "pressedSE",
  };
}

keyboardInverseMap = JSON.parse(window.localStorage.getItem("keyboardInverseMap"));
if (keyboardInverseMap === null) {
  keyboardInverseMap = {
    movingUp: "W",
    movingLeft: "A",
    movingDown: "S",
    movingRight: "D",
    pressedNW: "Y",
    pressedNE: "I",
    pressedSW: "H",
    pressedSE: "K",
  };
}

function sendEvent(tag, id) {
  return (e) => {
    if (e.type == "keyup" || e.type == "keydown") {
      if (e.defaultPrevented || !(e.code in keyboardMap)) {
        return; // Do nothing if event already handled
      }
      socket.emit(tag, id, keyboardMap[e.code]);
      e.preventDefault();
    }
  };
}

function redirect(tag) {
  window.localStorage.clear();
  window.localStorage.setItem("keyboardMap", JSON.stringify(keyboardMap));
  window.localStorage.setItem("keyboardInverseMap", JSON.stringify(keyboardInverseMap));
  window.localStorage.setItem("GUI_MODE", GUI_MODE);
  window.localStorage.setItem("GUIchoice", GUIchoice);
  window.localStorage.setItem("customAliveCellColor", customAliveCellColor);
  window.localStorage.setItem("customDeadCellColor", customDeadCellColor);
  window.localStorage.setItem("ggl.user", JSON.stringify(window.ggluser));
  window.location.href = window.location.origin + "/" + tag.toLowerCase();
}

function gameEnter() {
  window.ggluser.name = document.getElementById("usernameInput").value;
  if (window.ggluser.name == "") {
    alert("Please set your username");
    return;
  }
  if (window.ggluser.gameMode != "FFA" && window.ggluser.gameMode != "SINGLE") {
    alert("Please choose a game mode");
    return;
  }
  redirect(window.ggluser.gameMode);
}

function clearKeyboardMap() {
  keyboardMap = {
    ArrowUp: "movingUp",
    ArrowLeft: "movingLeft",
    ArrowDown: "movingDown",
    ArrowRight: "movingRight",
  };
}

function displayKeyboardInverseMap() {
  document.getElementById("movingUpKey").value = keyboardInverseMap.movingUp;
  document.getElementById("movingLeftKey").value = keyboardInverseMap.movingLeft;
  document.getElementById("movingDownKey").value = keyboardInverseMap.movingDown;
  document.getElementById("movingRightKey").value = keyboardInverseMap.movingRight;
  document.getElementById("pressedNWKey").value = keyboardInverseMap.pressedNW;
  document.getElementById("pressedNEKey").value = keyboardInverseMap.pressedNE;
  document.getElementById("pressedSWKey").value = keyboardInverseMap.pressedSW;
  document.getElementById("pressedSEKey").value = keyboardInverseMap.pressedSE;
}

function setKeyboardMap() {
  keyboardInverseMap.movingUp = document.getElementById("movingUpKey").value;
  keyboardInverseMap.movingLeft = document.getElementById("movingLeftKey").value;
  keyboardInverseMap.movingDown = document.getElementById("movingDownKey").value;
  keyboardInverseMap.movingRight = document.getElementById("movingRightKey").value;
  keyboardMap["Key" + document.getElementById("movingUpKey").value.toUpperCase()] = "movingUp";
  keyboardMap["Key" + document.getElementById("movingLeftKey").value.toUpperCase()] = "movingLeft";
  keyboardMap["Key" + document.getElementById("movingDownKey").value.toUpperCase()] = "movingDown";
  keyboardMap["Key" + document.getElementById("movingRightKey").value.toUpperCase()] = "movingRight";
  keyboardInverseMap.pressedNW = document.getElementById("pressedNWKey").value;
  keyboardInverseMap.pressedNE = document.getElementById("pressedNEKey").value;
  keyboardInverseMap.pressedSW = document.getElementById("pressedSWKey").value;
  keyboardInverseMap.pressedSE = document.getElementById("pressedSEKey").value;
  keyboardMap["Key" + document.getElementById("pressedNWKey").value.toUpperCase()] = "pressedNW";
  keyboardMap["Key" + document.getElementById("pressedNEKey").value.toUpperCase()] = "pressedNE";
  keyboardMap["Key" + document.getElementById("pressedSWKey").value.toUpperCase()] = "pressedSW";
  keyboardMap["Key" + document.getElementById("pressedSEKey").value.toUpperCase()] = "pressedSE";
}

function setGame() {
  socket.on("connect", () => {
    
    console.log(socket.id);
    
    window.ggluser["socketid"] = socket.id;
    let gameMode= window.ggluser["gameMode"];
    if(gameMode=="SINGLE" && !window.ggluser.singlelevel){
      window.ggluser.singlelevel=0;
    }
    window.localStorage.setItem("ggl.user", JSON.stringify(window.ggluser));

    if(gameMode=="SINGLE"){
      gameMode+=":"+window.ggluser.singlelevel;
    }
    console.log(gameMode);

    socket.emit("setGame", window.ggluser.name, gameMode, (response) => {
      if (!response || response.status != "SUCCESS") {
        alert(
          response.errcode
            ? response.errcode
            : "Uncaught error, please try again later."
        );
        redirect("");
      } else {
        socket.on("drawScoreBoard", drawScoreBoard);

        window.cb = new colorBoard(response.numColumns, response.numRows);

        setupVar(GUI_MODE);

        socket.on("gameUpdate", processGameUpdate);
        initState();
        startRendering();
        socket.on("dead", () => {
          gameEnd("dead");
        });
        socket.on("gameClear", (i, time) => {
          gameEnd("gameClear", i, time);
        });

        window.addEventListener(
          "keydown",
          sendEvent("keydown", window.ggluser.name)
        );
        window.addEventListener(
          "keyup",
          sendEvent("keyup", window.ggluser.name)
        );
      }
    });
  });
}

function gameEnd(tag, i, time) {
  socket.close();
  // if (tag == "dead") {
  //   document.getElementById("gameResult").textContent = "Game over 😢";
  // }
  
  // document.getElementById("dead-alert").style.display = "block";
  let x = document.getElementById("menu");
  let y = document.getElementById("menuCenter");
  let z = document.getElementById("menuButtonGroup");
  x.style.display = "block";
  // document.getElementById("optionMenu").style.display = "none";
  
  let br = document.createElement("br");
  y.insertBefore(br, y.firstChild);

  let restartButton = document.createElement("button");
  restartButton.className = "btn btn-success";
  restartButton.type = "button";
  restartButton.style.width = "100%";
  restartButton.textContent = "RESTART ↺";
  restartButton.onclick = function(){redirect(window.ggluser.gameMode)};
  y.insertBefore(restartButton, y.firstChild);

  if(tag == "gameClear"){
    let deadalerth3 = document.createElement("h3");
    let deadalert = document.createElement("span");
    deadalert.className = "badge bg-warning text-dark";
    deadalert.style.width = "100%";
    deadalert.textContent = `(#${i+1}) `+(time/10).toFixed(1)+"s";
    deadalerth3.appendChild(deadalert);
    y.insertBefore(deadalerth3, y.firstChild);
  }

  let deadalerth3 = document.createElement("h3");
  let deadalert = document.createElement("span");
  deadalert.className = "badge bg-warning text-dark";
  deadalert.style.width = "100%";
  deadalert.textContent = (tag == "gameClear") ? "Game clear 🥳" :"Game over 😢";
  deadalerth3.appendChild(deadalert);
  y.insertBefore(deadalerth3, y.firstChild);

  y.removeChild(document.getElementById("CloseMenu"));
  y.removeChild(document.getElementById("gameMenuTitle"));
  y.removeChild(y.lastChild);
  y.removeChild(y.lastChild);



  document.body.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      redirect(window.ggluser.gameMode);
    }
  });
}

function listenBG(){
  socket.on("connect", (response) => {
    socket.emit("listenBG", (response) => {

      window.ggluser["socketid"] = response.id
      //window.ggluser["socketid"] = "Dodger (Bot)"
      console.log(response.id)
      window.cb = new colorBoard(response.numColumns, response.numRows);
      
      GUI_MODE="BACKGROUND";
      setupVar(GUI_MODE);

      socket.on("gameUpdate", processGameUpdate);

      initState();
      startRendering();
    })
  })
}