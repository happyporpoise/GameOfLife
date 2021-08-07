const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

//const sqlite3 = require('sqlite3');
//const db = new sqlite3.Database('./rankingBoard.db');
const userControl = require( "./users.js");
const usercon = new userControl();
const Game = require('./GameOfLife.js');
const games = {"FFA" : new Game(io,"FFA","FFA",200,200)};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/client/html/main.html');
});

app.get('/ranking.json', (req, res) => {
  res.sendFile(__dirname + '/ranking.json');
});

app.get('/ffa', (req, res) => {
  res.sendFile(__dirname + '/src/client/html/arena.html');
});

app.get('/single', (req, res) => {
  res.sendFile(__dirname + '/src/client/html/arena.html');
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
    if(id in usercon.users){
      let game=games[usercon.users[id].chatroom];
      if(socket.id==usercon.users[id].socketid && socket.id in game.players && msg!=null ){
        game.keyboardInput(socket.id,msg,true);
      }
    }
  });

  socket.on('keyup', (id,msg) => {
    if(id in usercon.users){
      let game=games[usercon.users[id].chatroom];
      if(socket.id==usercon.users[id].socketid && socket.id in game.players && msg!=null ){
        game.keyboardInput(socket.id,msg,false);
      }
    }
  });

  socket.on("listenBG", (callback) => {
    socket.join("FFA");
    let playerlist = Object.keys(games['FFA'].players);
    callback({
      numColumns: games['FFA'].numColumns,
      numRows: games['FFA'].numRows,
      id: playerlist[0],
    });
  });

  socket.on("setGame", (name, gameMode, callback) => {
    if(name in usercon.users){
      callback({
        id: name,
        status: "FAIL",
        errcode: `Player ${name} exists in the arena now.`
      });
    }
    else{
      
      gameMode=gameMode.split(":");

      let newuser = usercon.addUser({
        "name" : name,
        'gameMode':gameMode,
        'socketid':socket.id
      });

      if(!newuser){
        callback({
          id: name,
          status: "FAIL",
          errcode: `Player ${name} is not a valid name.`
        });
        return;
      }

      if(gameMode[0]=="FFA"){     
        socket.join("FFA");
        games['FFA'].addPlayer(newuser['socketid'],newuser['name']);
        newuser["chatroom"]="FFA";
        callback({
          id: newuser[usercon.pk],
          numColumns: games['FFA'].numColumns,
          numRows: games['FFA'].numRows,
          status: "SUCCESS",
        });
        return;
      }

      if(gameMode[0]=="SINGLE"){
        socket.join(socket.id);
        if(gameMode[1]=='0'){
          games[socket.id]=new Game(io,socket.id,gameMode,162,30);
        }
        else if(gameMode[1]=='1'){
          games[socket.id]=new Game(io,socket.id,gameMode,57,57);
        }
        else if(gameMode[1]=='2'){
          games[socket.id]=new Game(io,socket.id,gameMode,50,50);
        }
        else{
          games[socket.id]=new Game(io,socket.id,gameMode,100,100);
        }
        //callback must be called before addPlayer because client will be ready to hear only after success callback
        callback({
          id: newuser[usercon.pk],
          numColumns: games[socket.id].numColumns,
          numRows: games[socket.id].numRows,
          status: "SUCCESS"
        });
        games[socket.id].addPlayer(newuser['socketid'],newuser['name']);
        newuser["chatroom"]=socket.id;
        return;
      }
    }
  });

socket.on('disconnect',(reason)=>{
    console.log(reason);
    if(socket.id in games['FFA'].players) delete games['FFA'].players[socket.id];
    if(socket.id in games){
      clearInterval(games[socket.id].interval)
      delete games[socket.id]
    };
    usercon.delUser('socketid',socket.id);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

// setInterval(()=>{
//   console.log(Object.keys(games['FFA'].players));
//   Object.keys(usercon.users).forEach((userid)=>{
//     const socketid=usercon.users[userid].socketid;
//     if(socketid in games['FFA'].players || socketid in games){
//       usercon.users[userid]['timeOut']=false;
//     }
//     else{
//       if(usercon.users[userid]['timeOut']){
//         delete usercon.users[userid];
//         io.to(socketid).emit('timeOut');
//       }
//       else{
//         usercon.users[userid]['timeOut']=true;
//       }
//     }
//   })
// }, 1000 * 60 * 10 );