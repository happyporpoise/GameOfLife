const { randomChoice } = require("./Library.js");

const dirInfo={
  "NW":{vec:[-1,-1], mov:{movingUp:true,movingDown:false,movingLeft:true,movingRight:false}},
  "N":{ vec:[0,-1], mov:{movingUp:true,movingDown:false,movingLeft:false,movingRight:false}},
  "NE":{vec:[+1,-1], mov:{movingUp:true,movingDown:false,movingLeft:false,movingRight:true}},
  "W":{ vec:[-1,0], mov:{movingUp:false,movingDown:false,movingLeft:true,movingRight:false}},
  "E":{ vec:[+1,0], mov:{movingUp:false,movingDown:false,movingLeft:false,movingRight:true}},
  "SW":{vec:[-1,+1], mov:{movingUp:false,movingDown:true,movingLeft:true,movingRight:false}},
  "S":{ vec:[0,+1], mov:{movingUp:false,movingDown:true,movingLeft:false,movingRight:false}},
  "SE":{vec:[+1,+1], mov:{movingUp:false,movingDown:true,movingLeft:false,movingRight:true}},
}

function isSafe(gameObj,x,y,dir){
  const newx = x + dirInfo[dir].vec[0];
  const newy = y + dirInfo[dir].vec[1];
  return (!(gameObj.numNearbyAlive(newx, newy) in [, , 2, 3]) ||
      (gameObj.isAlive(newx, newy)  == false &&
      gameObj.numNearbyAlive(newx, newy) != 3));
}

function getSafeDir(gameObj,x,y){
  let safeDirections=[];
  Object.keys(dirInfo).forEach((dir)=>{
    if (isSafe(gameObj,x,y,dir)) {
      safeDirections.push(dir);
    }
  });
  return safeDirections;
}

function moveDir(player,dir){
  if(!(dir in dirInfo)){
    player.movingUp = false;
    player.movingDown = false;
    player.movingLeft = false;
    player.movingRight = false;
    return;
  }
  const mov=dirInfo[dir].mov;
  Object.keys(mov).forEach((dir)=>{
    player[dir] = mov[dir];
  })
}

function shootDir(player,dir){
  player.pressedNW = false;
  player.pressedNE = false;
  player.pressedSW = false;
  player.pressedSE = false;
  if(dir.length==2){
    player['pressed'+dir]=true;
  }
}

function moveToSafeDir(gameObj,id,x,y){
  const safeDirections = getSafeDir(gameObj,x,y);
  const player = gameObj.players[id];
  const dir = (safeDirections.length==0) ? "nomove" : randomChoice(safeDirections);
  moveDir(player,dir);
}

function getRelPos(gameObj,id2,x,y){
  let x2 = gameObj.players[id2].gridX;
  let y2 = gameObj.players[id2].gridY;
  if (Math.abs(x2 + gameObj.numColumns - x) < Math.abs(x2 - x)) {
    x2 = x2 + gameObj.numColumns;
  } else if (Math.abs(x2 - gameObj.numColumns - x) < Math.abs(x2 - x)) {
    x2 = x2 - gameObj.numColumns;
  }
  if (Math.abs(y2 + gameObj.numRows - y) < Math.abs(y2 - y)) {
    y2 = y2 + gameObj.numRows;
  } else if (Math.abs(y2 - gameObj.numRows - y) < Math.abs(y2 - y)) {
    y2 = y2 - gameObj.numRows;
  }
  return [x2,y2];
}

function dodger(id,x,y){
  if (this.numNearbyAlive(x, y) === 3) {
    moveToSafeDir(this,id,x,y);
  } else {
    moveDir(this.players[id],'nomove')
  }

  let someoneOn = "noOne";
  Object.keys(this.players).every((id2) => {
    if (id2 == "Dodger (Bot)") { return true; }

    let [x2,y2]=getRelPos(this,id2,x,y);
    let attackrange = 6;
    if (
      x2 < x &&
      x2 >= x - attackrange &&
      y2 < y &&
      y2 >= y - attackrange
    ) {
      someoneOn='NW';
      return false;
    } else if (
      x2 > x &&
      x2 <= x + attackrange &&
      y2 < y &&
      y2 >= y - attackrange
    ) {
      someoneOn = 'NE' ;
      return false;
    } else if (
      x2 < x &&
      x2 >= x - attackrange &&
      y2 > y &&
      y2 <= y + attackrange
    ) {
      someoneOn = 'SW';
      return false;
    } else if (
      x2 > x &&
      x2 <= x + attackrange &&
      y2 > y &&
      y2 <= y + attackrange
    ) {
      someoneOn = 'SE' ;
      return false;
    }

    return true;
  });

  shootDir(this.players[id],someoneOn);

}


const followerInfo={
  "NW":(x,y,x2,y2)=>(x2 < x && y2 < y),
  "N" :(x,y,x2,y2)=>(x2 === x && y2 < y),
  "NE":(x,y,x2,y2)=>(x2 > x && y2 < y),
  "W" :(x,y,x2,y2)=>(x2 < x && y2 === y),
  "E" :(x,y,x2,y2)=>(x2 > x && y2 === y),
  "SW":(x,y,x2,y2)=>(x2 < x && y2 > y),
  "S" :(x,y,x2,y2)=>(x2 === x && y2 > y),
  "SW":(x,y,x2,y2)=>(x2 > x && y2 > y),
};

function follower(id,x,y){

  let movementDecided = false;
  Object.keys(this.players).every((id2) => {
    if (id2 != "Follower (Bot)") {
      let [x2,y2]=getRelPos(this,id2,x,y);
      let nearbyRange = 10;
      if (Math.max(Math.abs(x - x2), Math.abs(y - y2)) <= nearbyRange) {
        Object.keys(dirInfo).forEach((dir)=>{
          if(!movementDecided && followerInfo[dir](x,y,x2,y2) && isSafe(this,x,y,dir)){
            moveDir(this.players[id],dir);
            movementDecided = true;
          }
        })
        if(movementDecided){ return false; }
      }
      return true;
    } else {
      return true;
    }
  });
  if (!movementDecided) {
    moveToSafeDir(this,id,x,y);
  }
}


const hunterChar={
  nearbyRange:30,
  attackRange:6,
  approachRange:4,
}

const hunterInfo={
  "NW":(x,y,x2,y2)=>(
    x2 < x - hunterChar.approachRange &&
    y2 < y - hunterChar.approachRange ),
  "N" :(x,y,x2,y2)=>(
    x2 >= x - hunterChar.approachRange &&
    x2 <= x + hunterChar.approachRange &&
    y2 < y - hunterChar.approachRange),
  "NE":(x,y,x2,y2)=>(
    x2 > x + hunterChar.approachRange &&
    y2 < y - hunterChar.approachRange),
  "W" :(x,y,x2,y2)=>(
    x2 < x - hunterChar.approachRange &&
    y2 >= y - hunterChar.approachRange &&
    y2 <= y + hunterChar.approachRange),
  "E" :(x,y,x2,y2)=>(
    x2 > x + hunterChar.approachRange &&
    y2 >= y - hunterChar.approachRange &&
    y2 <= y + hunterChar.approachRange),
  "SW":(x,y,x2,y2)=>(
    x2 < x - hunterChar.approachRange &&
    y2 > y + hunterChar.approachRange),
  "S" :(x,y,x2,y2)=>(
    x2 >= x - hunterChar.approachRange &&
    x2 <= x + hunterChar.approachRange &&
    y2 > y + hunterChar.approachRange),
  "SE":(x,y,x2,y2)=>(
    x2 > x + hunterChar.approachRange &&
    y2 > y + hunterChar.approachRange
  ),
};

function hunter(id,x,y){

  let movementDecided = false;
  let noShooting = true;
  let approachRange=hunterChar.approachRange;

  Object.keys(this.players).every((id2) => {
    if (id2 != "Hunter (Bot)") {
      let [x2,y2]=getRelPos(this,id2,x,y);

      if (Math.max(Math.abs(x - x2), Math.abs(y - y2)) <= hunterChar.nearbyRange) {  
        Object.keys(dirInfo).forEach((dir)=>{
          if(!movementDecided && hunterInfo[dir](x,y,x2,y2) && isSafe(this,x,y,dir)){
            moveDir(this.players[id],dir);
            movementDecided = true;
            if (dir.length==2 &&
              Math.max(Math.abs(x - x2), Math.abs(y - y2)) <= hunterChar.attackRange) {
              shootDir(this.players[id],dir);
              noShooting = false;
            }
          }
        })
        if(movementDecided){ return false; }
        
        if(
          x2 > x - approachRange &&
          x2 < x + approachRange &&
          y2 > y - approachRange &&
          y2 < y + approachRange
        ) {
          [
            [x2 < x && y2 <= y,'NW','SE'],
            [x2 >= x && y2 < y,'NE','SW'],
            [x2 <= x && y2 > y,'SW','NE'],
            [x2 > x && y2 >= y,'SE','NW']
          ].forEach(el=>{
            if(noShooting && el[0]) {
              shootDir(this.players[id],el[1]);
              noShooting = false;
              if (isSafe(this,x,y,el[2])) {
                moveDir(this.players[id],el[2]);
                movementDecided = true;
              }
            }
          })
          return false;
        }
      }
      return true;
    } else {
      return true;
    }
  });
  if (!movementDecided) {moveToSafeDir(this,id,x,y);
    if (noShooting) {
      shootDir(this.players[id],'noshoot');
    }
  }
}

function smartBotUpdate(){
    this.smartBotIDs.forEach((id) => {
        if (!(id in this.players) ) {
          this.addPlayer(id, id);
        }
        let x = this.players[id].gridX;
        let y = this.players[id].gridY;
        if (id == "Dodger (Bot)") {
          dodger.bind(this)(id,x,y);
        } else if (id == "Follower (Bot)") {
          follower.bind(this)(id,x,y);
        } else if (id == "Hunter (Bot)") {
          hunter.bind(this)(id,x,y);
        }
      });
}

module.exports = {
  smartBotUpdate:smartBotUpdate,
};