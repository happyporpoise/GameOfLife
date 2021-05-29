let myCanvas = document.getElementById('myCanvas');
let myContext = myCanvas.getContext("2d");
myCanvas.width = window.innerWidth;
myCanvas.height = window.innerHeight;

console.log("qve4");
//let GUI_MODE="PLAIN";
//let GUI_MODE="PLAIN-NUT";
let GUI_MODE="SPACEDECAY";
//let GUI_MODE="NONE";

//const CanvasColumns = -Math.floor(-myCanvas.width);
//const CanvasRows = -Math.floor(-myCanvas.rows);
const Cellwidth = 10;
const Cellheight = 10;
const Playerwidth = 10;
const Playerheight = 10;

function mod(n, m) {
  return ((n % m) + m) % m;
}

class colorBoard{

  constructor(){
    console.log(this);
    this.decay_counts=new Array(numRows*numColumns);
    for (let i = 0; i < this.decay_counts.length; i++){
      this.decay_counts[i]=0;
    }
    this.maxDecay=0;
    this.color_list = [];
  }

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

  static colorBlend(c1,c2,r){
    let [r1,g1,b1]=colorBoard.hexToRgb(c1);
    let [r2,g2,b2]=colorBoard.hexToRgb(c2);
    return colorBoard.rgbToHex(
      Math.floor(r1*(1-r)+r2*r),
      Math.floor(g1*(1-r)+g2*r),
      Math.floor(b1*(1-r)+b2*r));
  } 

  static colorScheme={
    'TACHYON':[
      ['#000000',NaN],
      ['#baeaf5',3],
      ['#5fc6ff',5],
      ['#E76583',20],
      ['#44008b',40],
      ['#123067',40], 
      ['#13076f',50],
      ['#13174f',100],
      ['#281232', 190],
      ['#20080e',90],
    ],
    
    'TERRAIN':[
      ['#034077',NaN],
      ['#7e2812',3] ,
      ['#eeb46f',10],
      ['#f3dcb5',16*5],
      ['#2da9cd',16*8],
      ['#269dc7',16*4*8*2],
    ],
  }
  
  setDecayVars(themeType="TACHYON"){
    //Read colorScheme
    let  decayColors = [];
    let decayTimes = [];
    colorBoard.colorScheme[themeType].forEach( el =>{
      decayColors.push(el[0]);
      decayTimes.push(el[1]);
    });
    let liveColor=decayColors[0];
    decayColors.push(liveColor);

    //Init canvas background
    myContext.fillStyle=colorBoard.colorBlend(liveColor,'#ffffff',0.1);
    myContext.fillRect(0, 0, myCanvas.width, myCanvas.height);

    //Generate color_list
    this.color_list = [liveColor];    
    for (let i = 1; i < decayTimes.length; i++) {
      for (let j = 0; j < decayTimes[i]; j++) {
        this.color_list.push(
          colorBoard.colorBlend(
            decayColors[i],
            decayColors[i+1],
            j/decayTimes[i]
        ));
      }
    }
    this.color_list.push(liveColor);
    //Set maxDecay
    let newmax=this.color_list.length-1;
    for(let i=0;i<this.decay_counts.length;i++){
      if (this.decay_counts[i]==this.maxDecay) this.decay_counts[i]=newmax;
    }
    this.maxDecay=newmax;
  }

  displayColorBar(){
    //Display decayColors and color_list
    let yoffset=numRows+2;
    for(let i =0;i<decayColors.length;i++){
      myContext.fillStyle = decayColors[i];
      myContext.fillRect(
        2*i*Cellwidth,yoffset*Cellheight,
        2*Cellwidth,2*Cellheight
      );
    }
    yoffset+=3;
    for(let i =0;i<this.color_list.length;i++){
      myContext.fillStyle = this.color_list[i];
      let [x,y]=[i%numColumns,Math.floor(i/numColumns)];
      myContext.fillRect(
        x*Cellwidth,(yoffset+y)*Cellheight,
        Cellwidth,Cellheight
      );
    }
  }
  
  drawPixel(tag,x,y){

    let newx=mod(x+Math.floor(numColumns / 2),numColumns) * Cellwidth;
    let newy=mod(y+Math.floor(numRows / 2),numRows) * Cellheight;
    
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
}

function setupVar(cb){
  return (_GUI_MODE)=>{
    let codeparse=_GUI_MODE.split(":");
    GUI_MODE=codeparse.shift();
    if(GUI_MODE=="SPACEDECAY"){
      codeparse.length>0 ? cb.setDecayVars(codeparse[0]) : cb.setDecayVars();
    }
  };
}


let gamePlayer={};
    
function draw(id,cb){
  return (gameCells, players) => {
    if(id in players){
      gamePlayer=players[id];
    }
    if(GUI_MODE=="PLAIN"){
      myContext.fillStyle="#595959";
      myContext.fillRect(0, 0, myCanvas.width, myCanvas.height);
    }
    else if(GUI_MODE=="SPACEDECAY"){
      update(gameCells,cb);
    }
    else{
      myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    }

    gameCells.forEach(element => {
      cb.drawPixel((element.alive ? "cellAlive" : "cellDead")
        + ((GUI_MODE=="SPACEDECAY") ? cb.color_list[cb.decay_counts[element.gridX + element.gridY * numColumns]] : ""),
        element.gridX-gamePlayer.gridX,
        element.gridY-gamePlayer.gridY
      );
    });
    
    Object.keys(players).forEach((_id) => {
      cb.drawPixel("player",
        players[_id].gridX-gamePlayer.gridX,
        players[_id].gridY-gamePlayer.gridY
      );
    });

    if (gamePlayer.alive) cb.drawPixel("myplayer",0,0) ;
  };
}

function update(gameCells,cb){
  for (let i = 0; i < cb.decay_counts.length; i++) {
    if(gameCells[i].alive){
      cb.decay_counts[i]=0;
    } 
    else{
      cb.decay_counts[i]=Math.min(cb.decay_counts[i]+1,cb.maxDecay);
    }
  }
}