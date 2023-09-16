const canvas = document.getElementById("canvas");
canvas.width = 1000;
canvas.height = 600;
let ctx = canvas.getContext("2d");
const canvasMiddle = { x: canvas.width / 2, y: canvas.height / 2};
const red = "#FF0000";
const yellow = "#964B00"
const green = "#008000";
const backgroundColor = "black";
const changeModeButton = document.querySelector("button");

function makeCMBAppear(game) {
    //CMB stands for change mode button
    if (game.status == "match end"|| 
        game.status == "started") {
        changeModeButton.style.opacity = "100";
        changeModeButton.disabled = false;
        changeModeButton.style.border = "none";
    }
    else {
        changeModeButton.style.opacity = 0;
        changeModeButton.disabled = true;
    }
}


function clear() {
    ctx.fillStyle = backgroundColor;
    ctx.strokeStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function getRandomInt(min, max) {
    // Generate a random integer between min (inclusive) and max (inclusive)
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function convertToRadians(angle) {
    return angle * (Math.PI / 180);
};

function keepWithinScreen(object) {
    if (object.position.y + object.size.h >= canvas.height) {
        object.position.y = canvas.height - object.size.h;
    }
    if(object.position.y <= 0) {
        object.position.y = 0;
    }
}
function rotateObject(object) {
    object.rotatedAngle += object.rotationSpeed;
}

function restartGame() {
    game.status = "started";
    opponent.score = 0;
    player.score = 0;
    game.reset();
    game.counter = game.secondsAfterScoring;
};

function drawBall(object) {
    ctx.save();
    ctx.translate(object.position.x, object.position.y);
    ctx.rotate(object.rotatedAngle);
    ctx.fillStyle = object.color;
    ctx.fillRect(0 - object.size.w/2, 0 - object.size.h/2, object.size.w, object.size.h);
    ctx.restore();
}
function drawPlayers(object) {
    ctx.fillStyle = object.color;
    ctx.fillRect(object.position.x, object.position.y, object.size.w,object.size.h);
}

function Opponent(ball) {
    this.color = "white";
    this.size = {w: 10, h: 100};
    this.position = {x: canvas.width - 25, y: canvas.height/2 - this.size.h/2}
    this.speed = 2;
    this.ball = ball;
    this.score = 0;
}
Opponent.prototype.initialize = function(ball) {
    this.ball = ball;
}
Opponent.prototype.withinReach = function() {
    return this.ball.position.x > canvas.width / 2;
}
Opponent.prototype.moveToCenter = function() {
    const distance = canvas.height / 2 - this.position.y - this.size.h/2;
    const direction = Math.sign(distance);
    this.position.y += direction * this.speed;
}
Opponent.prototype.predictBallPosition = function() {
    let whereBallWillHit = {...ball.position};
    let ballVelocity = {...ball.velocity};
    const ballDirectionAngle = Math.atan2(ball.velocity.y, ball.velocity.x) * 180/Math.PI;
    let bounces = 0;
    while (whereBallWillHit.x < canvas.width) {
        if (whereBallWillHit.y + ball.size.h >= canvas.height || whereBallWillHit.y < 0) {
            //if ball hit top or bottom of the canvas, predict the y axis direction change
            ballVelocity.y *= -1;
            //keep track of bounces
            bounces += 1;
        }
        if (whereBallWillHit.x <= player.position.x + player.size.w) {
            //if ball hits the player, predict the x axis direction change
            ballVelocity.x *= -1;
        }
        if (whereBallWillHit.x < player.position.x + player.size.w && whereBallWillHit.x + ball.velocity.x * ball.speed < player.position.x + player.size.w) {
            //if ball is stuck behind the player it means you scored, so break the loop...
            break;
        }
        //update the whereBallWillHit according to the calculations
        whereBallWillHit.x += ballVelocity.x * ball.speed;
        whereBallWillHit.y += ballVelocity.y * ball.speed;
        
    }
    //if the ball direction angle is too steep, the opponent will just follow the ball in the y axis as a human would.
    if (Math.abs(ballDirectionAngle) > 55 && Math.abs(ballDirectionAngle) < 90) {
        //return the ball y axis 6 frames in the future, to try simulate human behavior
        return {y: ball.position.y + (ball.velocity.y * ball.speed) * 6};
    }
    return whereBallWillHit;
}
Opponent.prototype.move = function() {
        if (game.counter == 0 && ball.velocity.x != 0) {
            if (this.withinReach()) {
                if (game.difficulty == "Professional") {
                    const IdealSpot = this.predictBallPosition();
                    const distanceToIdealSpot = IdealSpot.y - this.position.y - this.size.h/2;
                    const direction = Math.sign(distanceToIdealSpot);
                    this.position.y += direction * this.speed;
                }
                else {
                    const distance = this.ball.position.y - this.position.y - this.size.h/2;
                    const direction = Math.sign(distance);
                    this.position.y += direction * this.speed;
                }
            }
            else {
                this.moveToCenter();
            }
        }
    }
Opponent.prototype.update = function() {
    this.move();
    drawPlayers(this);
}

function Player() {
    this.color = "white";
    this.size = {w: 10, h: 100};
    this.position = {x: 20, y: canvas.height/2 - this.size.h/2}
    this.speed = 2;
    this.score = 0;
}
Player.prototype.handleInput = function() {
    if (game.keysBeingPressed.includes("w")) {
        this.position.y -= this.speed; 
    }
    if (game.keysBeingPressed.includes("s")) {
        this.position.y += this.speed;
    }
}
Player.prototype.update = function() {
    drawPlayers(this);
    this.handleInput();
}


function Ball() {
    this.color = "white";
    this.rotatedAngle = 0;
    this.size = {w: 17, h: 17};
    this.position = {x: canvas.width/2, y: canvas.height/2}
    this.speed = 6;
    this.velocity = {x: -1, y: 0};
    this.directionAngle = 0
}
Ball.prototype.rotate = function() {
    this.rotatedAngle += 0.101;
}

Ball.prototype.initialize = function(player, opponent) {
    this.players = [player, opponent];
}
Ball.prototype.stayInsideScreen = function() {
    if (this.position.y <= 0 || this.position.y >= canvas.height - this.size.h) {
        this.velocity.y *= -1;
    }
}
Ball.prototype.handleAreaCollision = function(object) {
    const playerCenter = object.position.y + object.size.h/2;
    const offset = 10;
    //if ball hit the player's center, then...
    if (this.position.y >= playerCenter - offset && this.position.y <= playerCenter + offset) {
        this.velocity.x *= -1;
    }
    //else if ball hit a little bit higher than the center
    else if (this.position.y >= playerCenter - offset * 3 && this.position.y < playerCenter - offset) {
        const angle = 20;
        const angleInRadians = convertToRadians(angle);
        const unitVector = {x: Math.cos(angleInRadians), y: Math.sin(angleInRadians)};
        if (object.constructor == Player) {
            this.velocity.x = unitVector.x;
            this.velocity.y -= unitVector.y;
        }
        else {
            this.velocity.x = unitVector.x * -1;
            this.velocity.y -= unitVector.y
        }
    }
    //else if ball hit the highest point of the paddle 
    else if (this.position.y >= playerCenter - offset * 5 && this.position.y < playerCenter - offset * 3) {
        const angle = 45;
        const angleInRadians = convertToRadians(angle);
        const unitVector = {x: Math.cos(angleInRadians), y: Math.sin(angleInRadians)};
        //debug line console.log(unitVector)
        if (object.constructor == Player) {
            this.velocity.x = unitVector.x;
            this.velocity.y -= unitVector.y;
        }
        else {
            this.velocity.x = unitVector.x * -1;
            this.velocity.y -= unitVector.y
        }
    }
    //else if the ball hit a little bit lower than the center
    else if (this.position.y <= playerCenter + offset * 3 && this.position.y > playerCenter + offset) {
        const angle = 20;
        const angleInRadians = convertToRadians(angle);
        const unitVector = {x: Math.cos(angleInRadians), y: Math.sin(angleInRadians)};

        if (object.constructor == Player) {
            this.velocity.x = unitVector.x;
            this.velocity.y -= unitVector.y * -1;
        }
        else {
            this.velocity.x = unitVector.x * -1;
            this.velocity.y -= unitVector.y
        }
    }
     //else if ball hit the lowest point of the paddle 
     else if (this.position.y <= playerCenter + offset * 5 && this.position.y > playerCenter + offset * 3) {
        const angle = 45;
        const angleInRadians = convertToRadians(angle);
        const unitVector = {x: Math.cos(angleInRadians), y: Math.sin(angleInRadians)};
        if (object.constructor == Player) {
            this.velocity.x = unitVector.x;
            this.velocity.y -= unitVector.y * -1;
        }
        else {
            this.velocity.x = unitVector.x * -1;
            this.velocity.y -= unitVector.y
        }
    }

}
Ball.prototype.detectCollision = function() {
    this.players.forEach((object)=>{
        if (object.constructor == Player && this.position.y >= object.position.y && 
            this.position.y <= object.position.y + object.size.h && this.position.x <= object.position.x + object.size.w) {
                //there is a collision with a player
                this.handleAreaCollision(this.players[0]);
        }
        else if (object.constructor == Opponent && this.position.y >= object.position.y && 
            this.position.y <= object.position.y + object.size.h && this.position.x >= object.position.x) {
                //there is a collision with a player
                this.handleAreaCollision(this.players[1]);
        }
    });
}
Ball.prototype.controlVelocity = function() {
    const magnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (magnitude != 1 && magnitude != 0) {
        this.velocity.x /= magnitude;
        this.velocity.y /= magnitude;
    }
}
Ball.prototype.move = function() {
    this.position.x += this.velocity.x * this.speed;
    this.position.y += this.velocity.y * this.speed;
}
Ball.prototype.update = function() {
    this.stayInsideScreen();
    this.detectCollision();
    this.move();
    this.controlVelocity();
    this.rotate();
    drawBall(this);
}

const mouse = {x: 0, y: 0}

canvas.addEventListener('click', (event) => {
    // Get the mouse position relative to the canvas
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;

  });


//Initialize player and opponent objects
const player = new Player();
const ball = new Ball();
const opponent = new Opponent();
ball.initialize(player, opponent);
opponent.initialize(ball);
let game = {
    status: "menu",
    gameObjects: [player, opponent, ball],
    secondsAfterScoring: 3, //how many seconds the game counts for the match to restart
    scoreValue: 1, //how much each "goal" is worth
    maxScore: 5,
    counter: 0,
    timeCounter: 0,
    keysBeingPressed: [],
    drawMenu() {
        //draw "choose a mode"
        ctx.fillStyle = 'white';
        ctx.font = "35px Daydream";
        ctx.fillText("Choose a mode:", canvas.width/2 - 232, 100);
        //set colliders variables
        const size = {w: 500, h: 100};
        const Xpos = canvas.width/2 - size.w/2;
        const col1Y = 130;
        const col2Y = 236
        const col3Y = 342;
        const col4Y = 448;
        
        //draw colliders on screen to make it easier for the player
        ctx.strokeStyle = "white";
        ctx.strokeRect(Xpos, col1Y, size.w, size.h);
        ctx.strokeRect(Xpos, col2Y, size.w, size.h);
        ctx.strokeRect(Xpos, col3Y, size.w, size.h);
        ctx.strokeRect(Xpos, col4Y, size.w, size.h);

        //draw options
        ctx.fillStyle = "white";
        ctx.font = "35px Daydream";
        ctx.fillText("Easy", Xpos + size.w/3, col1Y + size.h/2);
        ctx.fillText("Normal", Xpos + size.w/4, col2Y + size.h/2);
        ctx.fillText("Hard", Xpos + size.w/3, col3Y + size.h/2);
        ctx.fillText("Professional", Xpos + size.w/11, col4Y + size.h/2);

        //detect the click
        if (mouse.x >= Xpos && mouse.x <= canvas.width/2 + size.w/2 ) {
            //when a player chooses an option, reset the game objects and start the
            //countdown for the game to start
            if (mouse.y >= col1Y && mouse.y <= col1Y + size.h) {
                this.status = "started";
                this.difficulty = "Easy";
                this.reset();
                this.setTimerCountDown(this.secondsAfterScoring);
            }
            else if (mouse.y >= col2Y && mouse.y <= col2Y + size.h) {
                opponent.speed = 3;
                ball.speed += 1;
                this.status = "started";
                this.difficulty = "Normal";
                this.reset();
                this.setTimerCountDown(this.secondsAfterScoring);
            }
            else if (mouse.y >= col3Y && mouse.y <= col3Y + size.h) {
                opponent.speed = 4;
                ball.speed += 2;
                this.status = "started";
                this.difficulty = "Hard";
                this.reset();
                this.setTimerCountDown(this.secondsAfterScoring);
            }
            else if (mouse.y >= col4Y && mouse.y <= col4Y + size.h) {
                opponent.speed = 4;
                ball.speed += 2;
                this.status = "started";
                this.difficulty = "Professional";
                this.reset();
                this.setTimerCountDown(this.secondsAfterScoring);
            }
        }
    },
    drawCenterLine() {
        rect = {w: 15, h: 15};
        ctx.fillStyle = "gray";
        ctx.fillRect(canvas.width/2 - rect.w/2, 0, rect.w, canvas.height);
    },
    drawEndMatchUI(object) {
        //draw if player won or lost
        ctx.fillStyle = "white";
        ctx.font = "35px Daydream";
        ctx.fillText(object.constructor == Player ? "You won!": "You lost!", canvas.width/2 - 125, 200);

        //drawEndScore
        ctx.fillStyle = "white";
        ctx.font = "25px Daydream";
        ctx.fillText(`${player.score} X ${opponent.score}`, canvas.width/2 - 37, 275);

        //tell player to press space to play again
        ctx.fillStyle = "white";
        ctx.font = "25px Daydream";
        ctx.fillText("Press space to play again...", canvas.width/2 - 270, 350);
    },
    drawCounter() {
        if (this.counter > 0) {
            ctx.fillStyle = "white";
            ctx.font = "40px Daydream";
            ctx.fillText(this.counter, canvas.width/2 - 25, canvas.height/2);
        }
    },
    displayDifficulty() {
        ctx.fillStyle = "white";
        ctx.font = "15px Daydream";
        if (this.difficulty == "Normal") {
            ctx.fillText(this.difficulty, canvas.width/2 - 47, 28);
        }
        else if (this.difficulty == "Professional") {
            ctx.fillText(this.difficulty, canvas.width/2 - 80, 28);
        }
        else {
            ctx.fillText(this.difficulty, canvas.width/2 - 30, 28);
        }
    },
    drawScore() {
        ctx.fillStyle = "white";
        ctx.font = "23px Daydream"
        ctx.fillText(player.score, 75, 50);
        ctx.fillText(opponent.score, canvas.width - 100, 50);
    },
    drawUI() {
        this.drawCenterLine();
        this.drawCounter();
        this.drawScore();
        this.displayDifficulty();
    },
    increaseScore(object) {
        object.score += this.scoreValue;

    },
    setTimerCountDown(seconds) {
        this.counter = seconds;
    },
    reset() {
        //reset player position, opponent position, ball position and ball velocity.
        player.position = {x: 20, y: canvas.height/2 - player.size.h/2};
        opponent.position = {x: canvas.width - 25, y: canvas.height/2 - opponent.size.h/2}
        ball.position = {x: canvas.width/2, y: canvas.height/2};
        ball.velocity = {x: 0, y: 0};
        this.setTimerCountDown(this.secondsAfterScoring);
    },
    restart() {
        //give the ball a random direction (right or left)
        ball.velocity.x = Math.random() < 0.5 ? 1 : -1;
       
    },
    decreaseCounter() {
        //this decrease the counter which will restart the match when it reaches 0
        if (this.counter > 0) {
            this.timeCounter += 1;
            //when the timecounter is a multiple of 60, the counter decreases by one
            //this makes sense because the game is based of a 60 frame per second gameplay
            if (this.timeCounter % 60 == 0) {
                this.counter -= 1;
            }
        }
        else {
            this.timeCounter = 0;
        }
    },
    controlMatchStatus() {
        if (opponent.score >= 5 || player.score >=5) {
            this.status = "match end";
        }
        else if (opponent.score < 5 && player.score < 5 && this.status != "menu") {
            this.status = "started";
        }
    },
    takeCareOfMatches() {
        if (ball.position.x + ball.size.w >= canvas.width) {
            this.increaseScore(player);
            this.reset();
        }
        else if (ball.position.x <= 0) {
            this.increaseScore(opponent);
            this.reset();
        }
        if (this.timeCounter >= this.secondsAfterScoring * 60) {
            this.restart();
        }
        //decrease counter will take care of decreasing the counter variables as
        //soon as they are set
        this.decreaseCounter();
    },
    updateGameObjects() {
        makeCMBAppear(this);
        this.controlMatchStatus();
        if (this.status == "started") {
            this.takeCareOfMatches();
            this.drawUI();
            keepWithinScreen(game.gameObjects[0]);
            keepWithinScreen(game.gameObjects[1]);
            this.gameObjects.forEach((object)=>{
                object.update();
            })
        }
        else if (this.status == "match end") {
            opponent.score == 5 ? this.drawEndMatchUI(opponent) : this.drawEndMatchUI(player);
        }
        else if (this.status == "menu") {
            this.drawMenu();
        }
    }
}


window.addEventListener("keydown", function (event) {
    let keyBeingPressed = event.key;
    if (keyBeingPressed == "w" || keyBeingPressed == "s") {
        if (!game.keysBeingPressed.includes(keyBeingPressed)) {
            game.keysBeingPressed.push(keyBeingPressed);
        }
        
    }
    else if (keyBeingPressed == " ") {
        if (game.status == "match end") {
            restartGame();
            
        }
    }
});
window.addEventListener("keyup", function(event) {
    let keyBeingReleased = event.key;
    if (keyBeingReleased == "w" || keyBeingReleased == "s") {
        if (game.keysBeingPressed.includes(keyBeingReleased)) {
            game.keysBeingPressed = game.keysBeingPressed.filter((item)=>item != keyBeingReleased);
        }
        
    }
})

changeModeButton.onclick = (e=>{
    mouse.x = 0;
    mouse.y = 0;
    ball.speed = 6;
    opponent.speed = 2;
    game.timeCounter = 0;
    game.counter = 0;
    game.status = "menu";
})

function gameLoop() {
    requestAnimationFrame(gameLoop);
    clear();
    game.updateGameObjects();
}

gameLoop();





