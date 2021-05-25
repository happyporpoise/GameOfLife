let myCanvas = document.getElementById('myCanvas');
let myContext = myCanvas.getContext("2d");

//let GUI_MODE="PLAIN";
//let GUI_MODE="PLAIN-NUT";
let GUI_MODE="SPACEDECAY"; //source from https://github.com/elliotwaite/rule-30-and-game-of-life
//let GUI_MODE="NONE";

const Cellwidth = 10;
const Cellheight = 10;
const Playerwidth = 10;
const Playerheight = 10;
const numColumns = 150;
const numRows = 75;


class color{
  constructor(){}

  static hexToRgb (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }

  static rgbToHex(r,g,b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static colorMix(c1,c2,r){
    let [r1,g1,b1]=color.hexToRgb(c1);
    let [r2,g2,b2]=color.hexToRgb(c2);
    return color.rgbToHex(
      Math.floor(r1*(1-r)+r2*r),
      Math.floor(g1*(1-r)+g2*r),
      Math.floor(b1*(1-r)+b2*r));
  }

  static decayColors = [
    '#711c91',
    '#ea00d9',
    '#0abdc6',
    '#133e7c',
    '#091833',
    '#000103'
  ];
  
  static color_decay_times = [2 ,16, 16*8, 16*8*8, 16*8*8*8];
  static color_list = [];
  static decay_counts=new Array(numRows*numColumns);
  static maxdecaycounts=0;

  static setDecayVars(){
    color.color_list = ['#ffffff'];
    let i=0;
    for (let i = 0; i < color.color_decay_times.length-1; i++) {
      for (let j = 0; j < color.color_decay_times[i]; j++) {
        color.color_list.push(color.colorMix(color.decayColors[i],color.decayColors[i+1],j/color.color_decay_times[i]));
      }
    }
        
    color.color_list.push("#000000");
    color.color_list.reverse();
    color.maxdecaycounts=color.color_list.length;
    for (let i = 0; i < color.decay_counts.length; i++){
      color.decay_counts[i]=0;
    }
    console.log(color.color_list);
    
    console.log(color.maxdecaycounts);

    console.log(color.decay_counts);
  }

}

const c=new color();

function setupVar(GUI_MODE){
  if(GUI_MODE=="SPACEDECAY"){
    console.log("DECAY");
    color.setDecayVars();
  }
}
setupVar(GUI_MODE);

const guiModeCode={1:"PLAIN",2:"PLAIN-NUT",3:"SPACEDECAY",4:"NONE"};
function changeMode(code){
  GUI_MODE=guiModeCode[code];
  setupVar(GUI_MODE);
}


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

      case "SPACEDECAY":
        switch (tag) {
          case "player":
            myContext.fillStyle = "#33cc33";
            myContext.fillRect(
              newx,newy,
              Playerwidth,Playerheight
            );
            break;
          default:
            myContext.fillStyle = "#"+tag.split('#')[1];
            myContext.fillRect(
              newx,newy,
              Cellwidth,Cellheight
            );
            break;
          
        }
        break;
  }
}

let cnts=0;

function draw(gameCells, gamePlayer) {

  if(GUI_MODE=="PLAIN"){
    myContext.fillStyle="#595959";
    myContext.fillRect(0, 0, myCanvas.width, myCanvas.height);
  }
  else if(GUI_MODE=="SPACEDECAY"){
    myContext.fillStyle="#000000";
    myContext.fillRect(0, 0, myCanvas.width, myCanvas.height);
    gameCells.forEach(element => {
      if(element.alive){
        color.decay_counts[element.gridX + element.gridY * numColumns]=color.maxdecaycounts;
      } 
      else{
        color.decay_counts[element.gridX + element.gridY * numColumns]-=1;
        if(color.decay_counts[element.gridX + element.gridY * numColumns]<0){
          color.decay_counts[element.gridX + element.gridY * numColumns]=0;
        }
      }
    })
  }
  else{
    myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
  }

  gameCells.forEach(element => {
    //console.log(color.decay_counts[element.gridX + element.gridX.y * numColumns]);
    //console.log(color.color_list[color.decay_counts[element.gridX + element.gridX.y * numColumns]]);
    drawPixel((element.alive ? "cellAlive" : "cellDead")
      + ((GUI_MODE=="SPACEDECAY") ? color.color_list[color.decay_counts[element.gridX + element.gridY * numColumns]] : ""),
      element.gridX-gamePlayer.gridX,
      element.gridY-gamePlayer.gridY
    );
  });

  if (gamePlayer.alive) drawPixel("player",0,0) ;


  if(cnts==0){
    console.log(color.decay_counts);
    cnts+=1;
  }
}
