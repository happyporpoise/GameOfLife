const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const users={};

const e = require('express');
const Game = require('./GameOfLife.js');
const game = new Game(io);

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

  socket.on("gameSet", (gametype, userid, callback) => {
    if(userid in users){
      game.addPlayer(users[userid]['socketid']);
      console.log(Object.keys(game.players));
      callback({
        id:userid,
        numColumns: Game.numColumns,
        numRows: Game.numRows,
      });
    }
  });

  socket.on("setUser", (username,callback) => {
    Object.keys(users).forEach(
      (key)=>{
        if(username==users[key].name){
          callback({'id':undefined});
          return;
        }
      }
    );
      
    const userid=username+socket.id;
    users[userid]={
      'id':userid,
      'name':username,
      'socketid':socket.id
    };
    callback(users[userid]);
    console.log("===== New User =====");
    console.log(users[userid]);
  });

  socket.on("updateUser", (user,callback) => {
    if("id" in user && user['id'] in users){
      Object.keys(user).forEach(
        (key)=>{users[user['id']][key]=user[key];}
      );
      console.log("===== Update User =====");
      console.log(user);  
      callback(true);
    }
    else{
      callback(false);
    }
  });

  socket.on('disconnect',(reason)=>{
    console.log(reason);
    if(reason=='transport close'){

    }
    if(socket.id in game.players) delete game.players[socket.id];
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});