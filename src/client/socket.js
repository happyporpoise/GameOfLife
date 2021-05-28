const socket = io();

function sendEvent(tag){
  return (e) => {
    if (e.defaultPrevented) {
      return; // Do nothing if event already handled
    }
    socket.emit(tag, e.code);
    e.preventDefault();
  }
}

function gameSet(tag){
  socket.emit(tag, e.code);
}