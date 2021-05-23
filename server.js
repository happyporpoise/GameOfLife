const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

console.log(__dirname);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/client/html/index2.html');
});

app.get('/index2.js', (req, res) => {
  res.sendFile(__dirname + '/src/client/html/index2.js');
});

io.on('connection', (socket) => {
  
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  socket.on('keydown', msg => {
    io.emit('chat message','(DOWN)\t'+ msg);
    //gameWorld.keyPressed(msg);
  });

  socket.on('keyup', msg => {
    io.emit('chat message','(UP)\t'+msg);
    //gameWorld.keyUnpressed(msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    setInterval(this.update.bind(this), 1000 / 1);
  }

  update () {
    // io.emit('chat message', "This is a useless message :)");
  }
}

const game = new Game();