const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const Game = require('./GameOfLife.js');
const game = new Game(io);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/client/html/index2.html');
});

app.get('/src/client/:fileName', function (req, res) {
  console.log(req.params.fileName)
  res.sendFile(__dirname + '/src/client/'+req.params.fileName);
});

app.get('/static/:fileName', function (req, res) {
  console.log(req.params.fileName)
  res.sendFile(__dirname + '/static/'+req.params.fileName);
});

io.on('connection', (socket) => {
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
    console.log(msg);
  });
  socket.on('keydown', msg => {
    io.emit('chat message','(DOWN)\t'+ msg);
    game.keyPressed(msg);
    //console.log('(DOWN)\t'+ msg);
  });

  socket.on('keyup', msg => {
    io.emit('chat message','(UP)\t'+msg);
    game.keyUnpressed(msg);
    //console.log('(UP)\t'+msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});