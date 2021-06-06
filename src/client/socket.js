window.username="Anonymous";
const socket = io();

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
  window.localStorage.setItem('username', username);
  window.location.href=window.location.origin+tag;
}

function setUser(){
  window.username=document.getElementById("usernameInput").value;
  socket.emit("setUser", {'name': window.username },
    (response) => {if(response.assigned){
      document.getElementById("nameButton").textContent=window.username;
      document.getElementById("usernameInput").value="";
    }
    else{
      alert(`Username ${window.username} already exists`);
      window.username="Anonymous";
    }
  });
}

function gameSet(tag){
  // Somewhere else
  window.username = window.localStorage.getItem('username');
  if(window.username=="Anonymous"){
    window.username="Anonymous"+socket.id;
  }
  console.log(socket);
  socket.emit("gameSet", 'ffa', { name: window.username },
    (response) => {
      numColumns=response.numColumns;
      numRows=response.numRows;

    let cb = new colorBoard();
    this.cb = cb;

    setupVar(cb)(GUI_MODE);
    console.log(response.id);
    let myID = response.id;

    // socket.on("draw", draw(response.id, cb));
    socket.on("gameUpdate", processGameUpdate);
    initState();
    startRendering(myID, cb);
    socket.on("dead", () => {
      socket.close();
      if (confirm(`You're dead! Restart?`)) {
        redirect("/ffa");
      } else {
        redirect("/");
      }
    });

    window.addEventListener("keydown", sendEvent("keydown", response.id));
    window.addEventListener("keyup", sendEvent("keyup", response.id));
  });
}
