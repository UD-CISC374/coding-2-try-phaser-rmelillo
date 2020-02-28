import ExampleObject from '../objects/exampleObject';
import Beam from '../objects/beam';

export default class MainScene extends Phaser.Scene {
  //private exampleObject: ExampleObject;
  background: Phaser.GameObjects.TileSprite;
  ship1: Phaser.GameObjects.Sprite;
  ship2: Phaser.GameObjects.Sprite;
  ship3: Phaser.GameObjects.Sprite;
  player: Phaser.Physics.Arcade.Sprite;
  cursorKeys;
  projectiles;
  powerUps: Phaser.Physics.Arcade.Group;
  spacebar;
  beam;
  enemies: Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.background = this.add.tileSprite(0,0, this.scale.width, this.scale.height, "background");
    this.background.setOrigin(0, 0);

    this.player = this.physics.add.sprite(this.scale.width/2-8, this.scale.height-64, "player");
    this.player.setCollideWorldBounds(true);
    this.player.play("thrust");

    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.projectiles = this.physics.add.group();

    
   
    this.ship1= this.add.sprite(this.scale.width/2 -50, this.scale.height/2, "ship1");
    this.ship2 = this.add.sprite(this.scale.width/2, this.scale.height/2, "ship2");
    this.ship3 = this.add.sprite(this.scale.width/2 +50, this.scale.height/2, "ship1");

    this.enemies = this.physics.add.group();
    this.enemies.add(this.ship1);
    this.enemies.add(this.ship2);
    this.enemies.add(this.ship3);


    this.physics.world.setBoundsCollision();

    this.powerUps = this.physics.add.group();

    let maxObjects = 4;
    for(let i = 0; i<=maxObjects; i++){
      let powerUp = this.physics.add.sprite(16,16, "power-up");
      this.powerUps.add(powerUp);
      powerUp.setRandomPosition(0, 0, this.scale.width, this.scale.height);

      if(Math.random()>0.5){
        powerUp.play("red");
      }
      else {
        powerUp.play("gray");
      }

      powerUp.setVelocity(100,100);
      powerUp.setCollideWorldBounds(true);
      powerUp.setBounce(2);
    }


    this.ship1.play("ship1_anim");
    this.ship2.play("ship2_anim");
    this.ship3.play("ship3_anim");

    this.ship1.setInteractive();
    this.ship2.setInteractive();
    this.ship3.setInteractive();
    
    this.input.on('gameobjectdown', this.destroyShip, this);

    this.physics.add.collider(this.ship3, this.powerUps);
    this.physics.add.collider(this.ship1, this.powerUps);
    this.physics.add.collider(this.ship2, this.powerUps);

    this.physics.add.collider(this.projectiles, this.powerUps, function(projectile, powerUp){
      projectile.destroy();
    });

    this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp);
    
    this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer);

    this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy);


    
    }

    pickPowerUp(player, powerUp){
      powerUp.disableBody(true, true);
    }

    hurtPlayer(player, enemy){
      this.resetShipPos(enemy);
      player.x = this.scale.width/2 -8;
      player.y = this.scale.height -64;
    }

    hitEnemy(projectile, enemy){
      projectile.destory();
      this.resetShipPos(enemy);
    }


  update() {
    this.moveShip(this.ship1, 0.2);
    this.moveShip(this.ship2, 0.2);
    this.moveShip(this.ship3, 0.2);

    this.background.tilePositionY -= 0.5;

    this.movePlayerManager();

    if(Phaser.Input.Keyboard.JustDown(this.spacebar)){
      this.shootBeam();
    }
    for(var i =0; i< this.projectiles.getChildren().length; i++){
      var beam = this.projectiles.getChildren()[i];
      beam.update();
    }
  }


  shootBeam(){
    var beam = new Beam(this);
  }


  movePlayerManager(){
    if(this.cursorKeys.left?.isDown){
      this.player.setVelocityX(-200);
      this.player.flipX= false;
    }
    else if(this.cursorKeys.right?.isDown) {
      this.player.setVelocityX(200);
      this.player.flipX = true;
    }

    else {
      this.player.setVelocityX(0);
    }

    if(this.cursorKeys.up?.isDown) {
      this.player.setVelocityY(-300);
    }

    else {
      this.player.setVelocityY(250);
    }
  }

  moveShip(ship, speed){
    ship.y += speed;
    if(ship.y>this.scale.width){
      this.resetShipPos(ship);
    }
  }

  resetShipPos(ship){
    ship.y = 0;
    let randomX = Phaser.Math.Between(0, this.scale.width);
    ship.x=randomX;
  }

  destroyShip(pointer, gameObject){
    gameObject.setTexture("explosion");
    gameObject.play("explode");
  }
}
