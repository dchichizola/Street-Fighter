var game = new Phaser.Game(600, 224, Phaser.AUTO, 'gameDiv', { preload: preload, create: create, update: update });

function preload(){
  game.load.image('hadouken', 'assets/hadouken.png');
  game.load.image('enemy', 'assets/enemy.png');  
  game.load.spritesheet('ryu', 'assets/RyuSpriteMap125x135.png',125,135);
  game.load.image('background', 'assets/levels/sf2hf-ryu.gif');
    
  hadoukenKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);
  shoryukenKey = game.input.keyboard.addKey(Phaser.Keyboard.C);
}

var ryu, 
    isRyuAlive=true, 
    enemy, 
    hadouken, 
    cursor, 
    moveTimer=0,
    moveDelay=0,
    jumpTimer=0, 
    shoryukenActiveTime=0, 
    enemyTime=0, 
    ememiesDefeated=0,
    emeniesInLevel=10,
    numberHadoukens=0, 
    numberEnemies=0;

var MAX_HADOUKENS = 1, 
    HADOUKEN_TIME_LIMIT = 500, 
    MOVE_RECOVERY = 800,
    SHORYUKEN_ATTACK_TIME=700, 
    JUMP_TIME_LIMIT = 2000, 
    GRAVITY_CONST = 300, 
    MAX_ENEMIES=1, 
    TIME_BETWEEN_ENEMIES=3000;

function create(){ 
    
  background = game.add.tileSprite(0, 0, 657, 224, "background");
    
  game.physics.startSystem(Phaser.Physics.ARCADE);
  ryu = game.add.sprite(10,200, 'ryu', 1);
  game.physics.arcade.enable(ryu);
  ryu.body.collideWorldBounds = true;
  ryu.body.gravity.y = GRAVITY_CONST;
  ryu.body.width=70;
  ryu.body.height=150;
    
  enemy = game.add.sprite(500, 200, 'enemy');    
  game.physics.arcade.enable(enemy);
  enemy.body.collideWorldBounds = true;
  enemy.body.gravity.y = GRAVITY_CONST;
  enemy.body.height=122;
  numberEnemies++;
  enemyTime = game.time.now;
    
  ryu.animations.add('stand', [0,1,2,3,4,5], 8, true, true);
  ryu.animations.add('backwards', [6,7,8,9,10,11], 8, true, true);
  ryu.animations.add('forwards', [12,13,14,15,16,17], 8, true, true);
  ryu.animations.add('jump', [18,19,20,21,22,23], 8, true, true);
  ryu.animations.add('shoryuken', [24,25,26,27,28,29], 8, true, true);
  ryu.animations.add('hadouken', [30,31,32,33,34,35], 8, true, true);    
  ryu.animations.add('dead', [36,37,38,39,40,41], 8, true, true);
  ryu.animations.add('crouch', [42], 8, true, true);
  ryu.animations.play('stand', 8, true);
  cursor = game.input.keyboard.createCursorKeys();

}
    
function update(){
    if(isRyuAlive){
        enemy.body.velocity.x = -50;

        checkRyuMotion();
        checkSpecialMoves();
        drawLifeBar();

        addEnemy();

        game.physics.arcade.collide(enemy, ryu, ryuEnemyCollision, null, null);
        game.physics.arcade.collide(hadouken, enemy, hadoukenEnemy, null, null);
        game.physics.arcade.collide(hadouken, game.world.bounds, hadoukenEnemy, null, null);
    }
    else{
        //Game Over
        var style = { font: "65px Arial", fill: "#ffff00", align: "center" };

        var text = game.add.text(game.world.centerX, game.world.centerY, "Game Over", style);

        text.anchor.set(0.5);
        text.setShadow(1, 1, 'rgba(0,0,0,0.2)', 1);
    }
}

function addEnemy(){
    if(enemyTime + TIME_BETWEEN_ENEMIES < game.time.now
       && numberEnemies < MAX_ENEMIES){
        enemy = game.add.sprite(500, 200, 'enemy');
        game.physics.arcade.enable(enemy);
        enemy.body.collideWorldBounds = true;
        enemy.body.gravity.y = GRAVITY_CONST;
        enemy.body.height=122;
        numberEnemies++;
        enemyTime = game.time.now;
    }
}

function drawLifeBar(){
    
}

function checkRyuMotion(){
    
    if(game.time.now > moveTimer)//you can't move when doing a special move.
    {
        //velocity: x
        if (cursor.right.isDown){
            ryu.body.velocity.x = 80;
            if(ryu.body.onFloor()){
                ryu.animations.play('forwards', 8, true);
            }
        }
        else if(cursor.left.isDown){
            ryu.body.velocity.x = -60;
            if(ryu.body.onFloor()){
                ryu.animations.play('backwards', 8, true);
            }
        }
        else{
            ryu.body.velocity.x = 0;

            if(ryu.body.onFloor()){
                ryu.animations.play('stand', 8, true);
            }
        }

        if(game.time.now > moveDelay){
            //velocity: y
            if(cursor.down.isDown && game.time.now > jumpTimer){
                ryu.animations.play('crouch', 8, true);
            }
            else if(cursor.up.isDown && game.time.now > jumpTimer && game.time.now > moveDelay){
                //jump
                ryu.body.velocity.y = -240;
                ryu.animations.play('jump', 6, true);
                jumpTimer = game.time.now + JUMP_TIME_LIMIT;
            }
        }
    }
    
}

function checkSpecialMoves(){
    
    if( ryu.body.onFloor() && game.time.now > moveTimer){
        //hadouken check
        if(hadoukenKey.isDown && numberHadoukens < MAX_HADOUKENS){
            
            ryu.animations.play('hadouken', 10, true);
            ryu.body.velocity.x=-50; //a little pushback
            hadouken = game.add.sprite((ryu.body.x + 60), ryu.body.y + 60, 'hadouken');  
            game.physics.arcade.enable(hadouken);
            hadouken.body.velocity.x = 100;
            hadouken.body.collideWorldBounds = true;
            numberHadoukens++;
            moveTimer = game.time.now + HADOUKEN_TIME_LIMIT;
            moveDelay = game.time.now + HADOUKEN_TIME_LIMIT + MOVE_RECOVERY;
        }
        
        //shoryuken check
        if(shoryukenKey.isDown){
            ryu.body.velocity.y = -180;
            ryu.body.velocity.x = 60;
            ryu.animations.play('shoryuken', 6, true);
            moveTimer = game.time.now + HADOUKEN_TIME_LIMIT;
            moveDelay = game.time.now + HADOUKEN_TIME_LIMIT + MOVE_RECOVERY;
            shoryukenActiveTime = game.time.now + SHORYUKEN_ATTACK_TIME;
        }
    }
}


function hadoukenEnemy(){
    enemy.kill(); ememiesDefeated++; numberEnemies--;
    hadouken.kill(); numberHadoukens--;
}

function hadoukenHitsWorldBound(){
    hadouken.kill(); numberHadoukens--;
}

function ryuEnemyCollision(){
    if(game.time.now < shoryukenActiveTime){ //ryu in shoryuken
        enemy.kill(); ememiesDefeated++; numberEnemies--;
    }
    else{
        gameOver();
    }
}

function gameOver(){
    isRyuAlive = false;
    enemy.kill();
    numberEnemies--;
    ryu.animations.play('dead', 6, false);
    ryu.body.velocity.x = 0;
    ryu.body.velocity.y = 0;
}