let myCanvas = document.getElementById('myCanvas');
let myContext = myCanvas.getContext("2d");

const GUI_MODE="PLAIN";
//const GUI_MODE="PLAIN-NUT";
//const GUI_MODE="NONE";

const Cellwidth = 10;
const Cellheight = 10;
const Playerwidth = 10;
const Playerheight = 10;
const numColumns = 150;
const numRows = 75;

function mod(n, m) {
    return ((n % m) + m) % m;
}

function drawPixel(tag,x,y){

  newx=mod(x+Math.floor(numColumns / 2),numColumns) * Cellwidth;
  newy=mod(y+Math.floor(numRows / 2),numRows) * Cellheight;
  
  switch (GUI_MODE){

    case "PLAIN":
      switch (tag) {
      case "cellAlive":
        myContext.drawImage(imgs["cellon.png"],newx -1,newy -1);
        break;
      case "cellDead":
        break;
      case "player":
        myContext.drawImage(imgs["player.png"],newx -1,newy -1);
        break;
      }
      break;

    case "PLAIN-NUT":
      switch (tag) {
      case "cellAlive":
      case "cellDead":
        myContext.fillStyle = (tag=="cellAlive")
         ? "#595959"
          : "#f2f2f2";
        myContext.fillRect(
          newx,newy,
          Cellwidth,Cellheight
        );
        break;
      case "player":
        myContext.fillStyle = "#33cc33";
        myContext.fillRect(
          newx,newy,
          Playerwidth,Playerheight
        );
      }
      break;
  }
}

function draw (gameCells, gamePlayer) {

  if(GUI_MODE=="PLAIN"){
    myContext.fillStyle="#595959";
    myContext.fillRect(0, 0, myCanvas.width, myCanvas.height);
  }
  else{
    myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
  }

  gameCells.forEach(element => {
    drawPixel(element.alive ? "cellAlive" : "cellDead" ,
      element.gridX-gamePlayer.gridX,
      element.gridY-gamePlayer.gridY
    );
  });

  if (gamePlayer.alive) drawPixel("player",0,0) ;
}