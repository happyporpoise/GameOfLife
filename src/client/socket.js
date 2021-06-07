const socket = io();
window.user={
  'id':undefined,
  'name':'Anonymous',
  'socketid':socket.id
};

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

  if(window.user.id==undefined){
    alert("Please set your username");
    return;
  };
  window.localStorage.setItem('user', JSON.stringify(window.user));
  window.location.href=window.location.origin+tag;
}

function setUser(){
  let username=document.getElementById("usernameInput").value;
  if(username==""){username="Anonymous-"+socket.id.slice(16)};

  if(username==window.user.name && window.user.id !=undefined){
    return;
  }

  socket.emit("setUser", username ,
    (response) => {
      if(response.id!=undefined){
        window.user=response;
        document.getElementById("nameButton").textContent=response.name;
        document.getElementById("usernameInput").value="";
      }
      else{
        alert(`Username ${username} already exists`);
      }
  });
}

function gameSet(tag){
  // Somewhere else
  socket.on('connect', () => {
    window.user = JSON.parse(window.localStorage.getItem('user'));
    window.user['socketid']=socket.id;

    socket.emit("updateUser",window.user,
      (response)=>{
        if(!response){
          redirect("/");
        }
        socket.emit("gameSet", tag , window.user.id,
          (response) => {
            
            window.cb=new colorBoard(response.numColumns,response.numRows);;

            setupVar(GUI_MODE);
            
            socket.on("gameUpdate", processGameUpdate);
            initState();
            startRendering();
            socket.on("dead", () => {
              gameEnd()
            });

            window.addEventListener("keydown", sendEvent("keydown", window.user.id));
            window.addEventListener("keyup", sendEvent("keyup", window.user.id));
        });
      }
    );
  });
}


function gameEnd(){
  socket.close();
  document.getElementById('btn-group2').style.visibility='visible';
              // if (confirm(`You're dead! Restart?`)) {
              //   redirect("/ffa");
              // } else {
              //   redirect("/");
              // }
}