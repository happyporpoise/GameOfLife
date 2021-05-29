const socket = io();

function sendEvent(tag,id){
  return (e) => {
    if (e.defaultPrevented) {
      return; // Do nothing if event already handled
    }
    socket.emit(tag, id, e.code);
    e.preventDefault();
  }
}

function redirect(tag){
  switch(tag){
    case "ffa":
      window.location.href=window.location.origin+"/single";
      break;
    case "single":
      window.location.href="./single";
      break;
  };
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
          redirect("ffa");
        }
        else{
          redirect("main");
        }
      });

      window.addEventListener("keydown", sendEvent("keydown",response.id));
      window.addEventListener("keyup", sendEvent("keyup",response.id));
  });  
}