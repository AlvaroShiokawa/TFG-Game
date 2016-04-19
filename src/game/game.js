/***********************************************/
/***** Música maestro ***************/
/************************************/
document.getElementById('level_music').play();  // Começa a tocara música da fase!
document.getElementById('sfx').play();  // Começa a tocar o ronco do motor!


/*******************************************************/
/* Constantes */
// Obstáculos
var TYPES = {
  ROCK: 0,
  OIL : 1,
  CAR : 2
}

// Dimensões player
var PLAYER = {
  WIDTH: 50,
  HEIGHT: 120,
  SPAWN_X:400,
  SPAWN_Y:480
}

var SPAWN = {
  COOLDOWN: 100
}


var CANVAS = {
  WIDTH: document.getElementById('canvas').width,
  HEIGHT: document.getElementById('canvas').height
}

// Variáveis do player
  var player_x = PLAYER.SPAWN_X;
  var player_y = PLAYER.SPAWN_Y;

/* Velocidade atual do seu carro (é somada na vel de todo mundo
e incrementada ao longo do tempo)*/
var car_current_speed = 0;

/* Enemy Spawn cooldown*/
var spawn_cooldown = SPAWN.COOLDOWN; // A idéia desta variável é impor um "tipo" de timer entre cada spawn de elemento na tela. Pra evitar sobrecarregar. Depois de um tempo reseta.
var spawn_overheat = false; // Se isto estiver true, espera esfriar um pouco, o timer, dai volta a summonar inimigos na tela.
var dificulty_increaser=0;
/* Perdeu o jogo?*/
var gameover = false;

/* Objeto que armazena os "inimigos" */
var Element = function (x,y,type,dy,width,height) {
  this.x = x;
  this.y = y;
  this.dy = typeof dy !=='undefined' && dy!==null ? dy : 0;
  this.type=type;
  this.width = width;
  this.height = height;
  this.collided = false;
};

/* Atualiza a posição dos elementos na tela, dando a idéia de vc estão descendo na tela, e q seu carro está se movendo */
Element.prototype.refreshPosition = function (){
  this.y += this.dy + car_current_speed;
};


/**********************************************************/

/* Teclas */
var Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

/********************************************************/
/***********************   GAME   ***********************/

var Game = {};

Game.fps = 30;

Game.score = 0;
  var keyUp = function(event) { Key.onKeyup(event); }
  var keyDown = function(event) { Key.onKeydown(event); }
Game.initialize = function() {

  window.addEventListener('keyup', keyUp, false);
  window.addEventListener('keydown', keyDown, false);

  this.context = document.getElementById('canvas').getContext('2d');

  // Gráfico do player
  player = new Image();
  player.src = "res/img/lamborghini.png";

  // Gráficos dos inimigos
  // ROchedo na pista
  rock = new Image;
  rock.src = "res/img/rock.png";

  // Óleo na pista
  oil = new Image;
  oil.src = "res/img/oil.png";

  // Carro inimigo
  enemy_car = new Image;
  enemy_car.src = "res/img/audi.png";

    // Game over carrro
  gameover_car = new Image;
  gameover_car.src = "res/img/gameover.png";

    // Game over inimigo
  gameover_enemy = new Image;
  gameover_enemy.src = "res/img/gameover-enemy.png";

  /* Spawn Point inicial do player no centro e parte baixa do canvas */
  this.elements = [];
};

Game.addElement = function (x,y,type,dy,width,height) {
  this.elements.push(new Element(x,y,type,dy,width,height));
};

Game.removeElement = function (object) {
  this.elements.splice(this.elements.indexOf(object), 1);
}

Game.removeInvisible = function () {
  for (var i = this.elements.length - 1; i >= 0; i--) {
    if(this.elements[i].y >= CANVAS.HEIGHT)
      this.removeElement(this.elements[i]); 
  }
}

Game.isBetweenHorizontalRange = function (x,left,right) {
  return x > left && x < right;
};

Game.isInsideVerticalRange= function (y,up) {
  return y > up;
};


/************************/
/* Detecção de colisões */
/************************/
Game.isCollision = function () {
  var collided = false;
  var playerLeft = player_x;//this.rect_x;
  var playerRight = player_x + PLAYER.WIDTH;//playerLeft + PLAYER.WIDTH;


  for (var i = this.elements.length - 1; i >= 0; i--) {
    var elementLeft = this.elements[i].x;
    var elementRight = elementLeft + this.elements[i].width;
    var elementUp = this.elements[i].y;
    var elementDown = elementUp + this.elements[i].height; 

    if (
     (
         this.isInsideVerticalRange(elementDown,PLAYER.SPAWN_Y)
      || this.isInsideVerticalRange(elementUp,PLAYER.SPAWN_Y)
      )
  && (
         this.isBetweenHorizontalRange(playerLeft,elementLeft, elementRight)
      || this.isBetweenHorizontalRange(playerRight,elementLeft, elementRight)
      || this.isBetweenHorizontalRange(elementLeft,playerLeft, playerRight)
      || this.isBetweenHorizontalRange(elementRight,playerLeft, playerRight)        
     )
    )
        {
          this.elements[i].collided = true;
          collided = true;           
        }

  }
  return collided;
};


Game.draw = function() {
  if (!gameover) {
    this.context.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT); // Desenha o canvas

  

    // Your code goes here
      this.context.moveTo(400,0);
      this.context.lineTo(400,CANVAS.HEIGHT);
      this.context.stroke();

    //===== 



    /* Desenha os inimigos na tela */
    for (var i = this.elements.length - 1; i >= 0; i--) {
      //this.context.fillStyle = "#00F"; // Cor dos inimigos
      //this.context.fillRect(this.elements[i].x, this.elements[i].y, this.elements[i].width, this.elements[i].height);
      switch (this.elements[i].type){
        case TYPES.ROCK:
          this.context.drawImage(rock,this.elements[i].x,this.elements[i].y,this.elements[i].width,this.elements[i].height);
          break;
        case TYPES.OIL:
          this.context.drawImage(oil,this.elements[i].x,this.elements[i].y,this.elements[i].width,this.elements[i].height);
          break;
        case TYPES.CAR:
          this.context.drawImage(enemy_car,this.elements[i].x,this.elements[i].y,this.elements[i].width,this.elements[i].height);
          break;
      }

    }

    /* Desenha a nova posição do player na tela */
    //this.context.fillRect(this.rect_x, this.rect_y, PLAYER.WIDTH, PLAYER.HEIGHT);
    this.context.drawImage(player,player_x,player_y,50,120);


    //Exibir o score?
      this.score++; // Incrementa o score do player ao longo do tempo
      this.context.font = 'italic 18px Arial';
      this.context.textAlign = 'center';
      this.context.textBaseline = 'middle';
      this.context.fillStyle = 'red';  // a color name or by using rgb/rgba/hex values
      this.context.fillText('Score: ', 65, 10); // text and position
      this.context.fillText(this.score, 140, 10); // text and position
      this.context.fillText('Highscore: ', 80, 30); // text and position

      if (window.localStorage.hasOwnProperty('highScore'))
        this.context.fillText(window.localStorage.highScore, 150, 30); // text and position
      else
        this.context.fillText(0, 150, 30); // text and position
  }
};


/* GAME OVER */
Game.over = function () {
    gameover = true; // PERDEU!!!!
    /*Player morreu ai tenta trocar o grafico?*/
    player.src = "res/img/gameover.png";
    this.context.drawImage(player,player_x,player_y-20,70,161);

    this.context.font = 'italic 123px Arial';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillStyle = 'red';  // a color name or by using rgb/rgba/hex values
    this.context.fillText('GAME OVER', CANVAS.WIDTH/2-10, CANVAS.HEIGHT/2); // text and position
  this.removeInvisible();
  


  document.getElementById('level_music').pause();
  document.getElementById('sfx').pause();
  document.getElementById('explosion').play();
  document.getElementById('gameover_music').play();  // Música de gameover!




  /*Atualiza o high score...*/
  if(window.localStorage.highScore){
    if(this.score > window.localStorage.highScore)
      window.localStorage.setItem("highScore",this.score);
  }
  else
    window.localStorage.setItem("highScore",this.score);

  window.removeEventListener('keyup', keyUp, false);
  window.removeEventListener('keydown', keyDown, false);
}

Game.update = function() {
  if (!gameover){
    /* Movimento do player (Esquerda e direita, não ultrapassa os limites horizontais do canvas) */
    if (Key.isDown(Key.RIGHT)){
        player_x += 10;
    }

    if (Key.isDown(Key.LEFT)){
        player_x -= 10;
    }
    if (player_x < 0)
      player_x = 0;
    if (player_x > CANVAS.WIDTH-PLAYER.WIDTH)
      player_x = CANVAS.WIDTH-PLAYER.WIDTH;

    /* RNGesus Shall Give Birth to them Road Evils... */
    if (!spawn_overheat) { // Se não tiver sobrecarregado, faça aparecer
      var spawnedElement = Math.floor(Math.random()*3); // Vai de 0 a 2, pra ver se gera, carro, óleo, ou obstaculo generico
      switch(spawnedElement){
        case TYPES.ROCK: // Se for pedra, vejo quão grnade é essa pedra
          var randomStartingX = Math.floor(Math.random()*751);
          var randomWidth= Math.floor(Math.random()*11);
          var randomHeight = Math.floor(Math.random()*11);
          this.addElement(randomStartingX,-1*(212+randomHeight),TYPES.ROCK,0,322+randomWidth,212+randomHeight);
          spawn_overheat = true;
          break;
        case TYPES.OIL: // Se for óleo, vejamos qual grande é a poça de óleo a ser gerada e ONDE será gerada...
          var randomStartingX = Math.floor(Math.random()*751);
          var randomWidth= Math.floor(Math.random()*71);
          var randomHeight = Math.floor(Math.random()*71);
          this.addElement(randomStartingX,-1*(randomHeight+71),TYPES.OIL,0,119+randomWidth,71+randomHeight);
          spawn_overheat = true;
          break;
        case TYPES.CAR: // Se for um carro, vejamos que carro vai gerar e ONDE vaigerar...
          var randomStartingX = Math.floor(Math.random()*751);
          var randomSpeed = Math.floor(Math.random()*-11);
          this.addElement(randomStartingX,-1*(120),TYPES.CAR,randomSpeed,50,120);
          spawn_overheat = true;
          break;
      }
    }

    /* Verifica se sobrecarregou o spawn_cooldown*/
    if (spawn_overheat) {
      if (spawn_cooldown > 0)
        spawn_cooldown--; // Vou zerando o cool down pra permitir gerar um novo elemento. assim que zerar eu posso gerar um novo!
      else {
        spawn_cooldown = SPAWN.COOLDOWN-dificulty_increaser; // Já esfriou (ou seja, cooldown = 0 ), reseta o limite do cooldown pra um novo valor
        dificulty_increaser+=Math.floor(Math.random()*2);;
        spawn_overheat = false; //  Não ta overloaded
      }
    }

    

    /* Atualiza a posição dos inimigos na tela */
    for (var i = this.elements.length - 1; i >= 0; i--) {
      this.elements[i].refreshPosition();
    }  

    if(this.isCollision()){
      for (var i = this.elements.length - 1; i >= 0; i--){
        if(this.elements[i].collided){
          switch (this.elements[i].type){
            case TYPES.ROCK:
              this.score-= 50;
              if (this.score < 0)
                this.score = 0;
              break;

            case TYPES.OIL: // Se pegar no óleo, quanto escorrega
              var sliding=Math.floor(Math.random()*10); // Vai de 0 a 9
              var slideDirection=Math.floor(Math.random()*2);
              if (slideDirection < 1)
                player_x += sliding;
              else
                player_x -= sliding;
              if (player_x < 0)
                player_x = 0;
              if (player_x > CANVAS.WIDTH-PLAYER.WIDTH)
                player_x = CANVAS.WIDTH-PLAYER.WIDTH;
              break;

            case TYPES.CAR:
              enemy_car.src = "res/img/gameover-enemy.png";
              this.context.drawImage(enemy_car,this.elements[i].x,this.elements[i].y-20,70,161);
              this.over();
              break;
          }
        }
      }
    }

    this.removeInvisible();

    // this.removeInvisible();
    // =====
    // Example
    //this.rect_x += 10;
    //if (this.rect_x >= 800) {
    //  this.rect_x = -100
    //}

    //this.rect_y += 1;
    //if (this.rect_y >= CANVAS.HEIGHT) {
    //  this.rect_y = -100
    // }
    // =====
    car_current_speed+=0.005; // Aumento gradual da velocidade do carro pra aos poucos aumentar a dificuldade. Pois eventualmente o player vai bater e morrer.
  }
};
