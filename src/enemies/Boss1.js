let onPosition = false;
let eatMissile = false;
let missileEated = false;

export default class Boss1 extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.key);

    this.scene = scene;
    this.state = {
      life: 180,
      damage: 25,
      directionX: 160,
      directionY: 0,
      hited: false,
    };
    this.setDepth(104);
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.body.allowGravity = true;
    this.body.setGravityY(500);
    this.intro = false;
    this.getFired = false;
    this.lastAnim = null;
    this.attack = false;
    this.isRun = false;
    this.isJumping = false;
    this.lastSpeed = null;
    this.body.setSize(184, 70, true);
    this.body.setOffset(0, 50);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    let animationName;
    if (this.intro) {
      if (!onPosition) {
        const dx = this.scene.missile.x - this.x;
        const dy = this.scene.missile.y - this.y;
        const angle = Math.atan2(dy, dx);
        const speed = 500;
        this.body.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
        );
        this.flipX = false;
      }
      if (this.x < 1770 && !eatMissile) {
        this.body.setVelocity(0, 0);
        onPosition = true;
        animationName = 'boss1hit';
        this.scene.time.addEvent({
          delay: 2000,
          callback: () => {
            eatMissile = true;
          },
        });
      }
      if (eatMissile && !missileEated) {
        missileEated = true;
        animationName = 'boss1crouch';
        this.scene.missile.alpha = 0;
        this.scene.missile.body.reset(2050, 1408);
        this.intro = false;
        this.body.setEnable();
      }
    }
    if (this.active && !this.intro) {
      this.body.setVelocityX(this.state.directionX);
      // gauche ou droite et fait demi tour quand bloqué
      if (this.body.blocked.left && !this.attack && this.state.life >= 500) {
        this.state.directionX = 200;
        animationName = 'boss1walk';
      }
      if (this.body.blocked.right && !this.attack && this.state.life >= 500) {
        this.state.directionX = -200;
        animationName = 'boss1walk';
      }
      if (this.getFired && this.state.life >= 500) {
        animationName = 'boss1hit';
        this.wait();
      } else if (this.getFired) {
        animationName = 'boss1hit';
      }

      if (this.attack && this.state.life >= 500) {
        animationName = 'boss1run';
        this.run();
      }
      if (this.isRun) {
        animationName = 'boss1attack';
      }
      if (this.state.life < 500) {
        animationName = 'boss1attack';
        this.jump();
      }
      // flip et anim play
      if (this.body.velocity.x > 0) {
        this.flipX = true;
      } else {
        this.flipX = false;
      }
    }
    if (this.lastAnim !== animationName) {
      this.lastAnim = animationName;
      this.animate(animationName, true);
    }
  }

  wait() {
    if (this.state.directionX > 0) {
      this.state.directionX = 1;
    } else {
      this.state.directionX = -1;
    }
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.attack = true;
      },
    });
  }

  run() {
    this.isRun = true;
    const dx = this.scene.player.x - this.x;
    if (dx > 70) {
      this.state.directionX = 350;
    } else if (dx < -70) {
      this.state.directionX = -350;
    }
    this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.attack = false;
        this.isRun = false;
      },
    });
  }

  jump() {
    if (!this.isJumping && this.body.blocked.down && this.active) {
      this.attack = false;
      this.isRun = false;
      this.isJumping = true;
      if (this.body.blocked.left) {
        this.state.directionX = 300;
      }
      if (this.body.blocked.right) {
        this.state.directionX = -300;
      }
      this.body.setVelocityY(-500);
      this.scene.time.addEvent({
        delay: 1000,
        callback: () => {
          if (this.active) {
            this.body.setVelocityY(500);
            this.isJumping = false;
            this.run();
          }
        },
      });
    }
  }

  stopJump() {
    this.isJumping = false;
    this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        this.attack = false;
        this.isRun = false;
        this.state.directionY = 300;
      },
    });
  }

  animate(str) {
    this.anims.play(str, true);
  }

  looseLife(e) {
    this.state.life = this.state.life - e;
  }
}
