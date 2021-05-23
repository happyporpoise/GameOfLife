const Cellwidth = 10;
const Cellheight = 10;
const Playerwidth = 10;
const Playerheight = 10;
const numColumns = 150;
const numRows = 75;

let myCanvas = document.getElementById('myCanvas');
let myContext = myCanvas.getContext("2d");

function mod(n, m) {
    return ((n % m) + m) % m;
}

function draw (gameObjects, gamePlayer) {
    myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    for (let i = 0; i < gameObjects.length; i++) {
      myContext.fillStyle = gameObjects[i].alive
        ? "#595959"
        : "#f2f2f2";
      myContext.fillRect(
        mod(
          gameObjects[i].gridX -
          gamePlayer.gridX +
          Math.floor(numColumns / 2),
          numColumns
        ) * Cellwidth,
        mod(
          gameObjects[i].gridY - 
          gamePlayer.gridY +
          Math.floor(numRows / 2),
          numRows
        ) * Cellheight,
        Cellwidth,
        Cellheight
      );
    }
    if (gamePlayer.alive) {
    myContext.fillStyle = "#33cc33";
    myContext.fillRect(
      Math.floor(numColumns / 2) * Playerwidth,
      Math.floor(numRows / 2) * Playerheight,
      Playerwidth,
      Playerheight
    );
  }
}