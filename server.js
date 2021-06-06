const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const e = require('express');
const Game = require('./GameOfLife.js');
const game = new Game(io);
const users={};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/client/html/main.html');
});

app.get('/ffa', (req, res) => {
  res.sendFile(__dirname + '/src/client/html/ffa.html');
});

app.get('/single', (req, res) => {
  res.sendFile(__dirname + '/src/client/html/single.html');
});

app.get('/src/client/:fileName', function (req, res) {
  //console.log(req.params.fileName)
  res.sendFile(__dirname + '/src/client/'+req.params.fileName);
});

app.get('/static/:fileName', function (req, res) {
  //console.log(req.params.fileName)
  res.sendFile(__dirname + '/static/'+req.params.fileName);
});

io.on('connection', (socket) => {
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
    console.log(msg);
  });

  socket.on('keydown', (id,msg) => {
    if(id in game.players && msg!=null ){
      game.keyboardInput(id,msg,true);
    }
  });

  socket.on('keyup', (id,msg) => {
    if(id in game.players && msg!=null){
      game.keyboardInput(id,msg,false);
    }
  });

  socket.on("gameSet", (gametype, userinfo, callback) => {
    game.addPlayer(userinfo.name);
    console.log(Object.keys(game.players));
    callback({
      id:userinfo.name,
      numColumns: Game.numColumns,
      numRows: Game.numRows,
    });
  });

  socket.on("setUser", (userinfo,callback) => {
    const userid=userinfo.name;
    if(userid in users){
      console.log(false);
      callback({assigned:false});
    }
    else{
      userinfo.socketid=socket.id;
      users[userid]=userinfo;
      callback({assigned:true});
    }
    console.log(users);
  });

  socket.on('disconnect',(reason)=>{
    console.log(reason);
    if(socket.id in game.players) delete game.players[socket.id];
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});