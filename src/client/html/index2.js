const socket = io();

function mysubmit(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
}

function mymessage (msg) {
  let item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}


function mykeydown(e){
  e.preventDefault();
  socket.emit("chat message", e.code);
}



function sendEvent(tag){
  return (e) => {
    if (e.defaultPrevented) {
      return; // Do nothing if event already handled
    }
    socket.emit(tag, e.code);
    e.preventDefault();
  }
}
