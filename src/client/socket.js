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
      if (e.defaultPrevented) {
        return; // Do nothing if event already handled
      }
      socket.emit(tag, id, keyboarddMap[e.code]);
      e.preventDefault();
    }
  }
}

function redirect(tag){
  window.location.href=window.location.origin+tag;
}

function gameSet(tag){
  
  socket.emit("gameSet", 'ffa', { username: "Anonymous" },
    (response) => {
      numColumns=response.numColumns;
      numRows=response.numRows;

      let cb=new colorBoard();
      this.cb=cb;

      setupVar(cb)(GUI_MODE);
      console.log(response.id);

      socket.on('draw', draw(response.id,cb));
      socket.on('dead', ()=>{
        socket.close();
        if (confirm(`You're dead! Restart?`)) {
          redirect("/ffa");
        }
        else{
          redirect("/");
        }
      });

      window.addEventListener("keydown", sendEvent("keydown",response.id));
      window.addEventListener("keyup", sendEvent("keyup",response.id));
  });  
}