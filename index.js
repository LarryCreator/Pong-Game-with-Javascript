const canvas = document.getElementById("canvas");
canvas.width = 1000;
canvas.height = 600;
let ctx = canvas.getContext("2d");
const canvasMiddle = { x: canvas.width / 2, y: canvas.height / 2};
const red = "#FF0000";
const yellow = "#964B00"
const green = "#008000";
const backgroundColor = "black";


function clear() {
    ctx.fillStyle = backgroundColor;
    ctx.strokeStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function keepWithinScreen(object) {
    if (object.position.y + object.size.h >= canvas.height) {
        object.position.y = canvas.height - object.size.h;
    }
    if(object.position.y <= 0) {
        object.position.y = 0;
    }
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

function moveObject(object) {
    object.position.x += object.velocity.x;
    object.position.y += object.velocity.y;
}
function rotateObject(object) {
    object.rotatedAngle += object.rotationSpeed;
}
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
Opponent.prototype.move = function() {
    if (this.withinReach()) {
        const distance = this.ball.position.y - this.position.y - this.size.h/2;
        const direction = Math.sign(distance);
        this.position.y += direction * this.speed;
    }
    else {
        this.moveToCenter();
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
Ball.prototype.limitVelocity = function() {
    const magnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    if (magnitude > 1) {
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
    this.limitVelocity();
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
        const col1Y = 150;
        const col2Y = 256
        const col3Y = 362;
        
        //draw colliders on screen to make it easier for the player
        ctx.strokeStyle = "white";
        ctx.strokeRect(Xpos, col1Y, size.w, size.h);
        ctx.strokeRect(Xpos, col2Y, size.w, size.h);
        ctx.strokeRect(Xpos, col3Y, size.w, size.h);

        //draw options
        ctx.fillStyle = "white";
        ctx.font = "35px Daydream";
        ctx.fillText("Easy", Xpos + size.w/3, col1Y + size.h/2);
        ctx.fillText("Normal", Xpos + size.w/4, col2Y + size.h/2);
        ctx.fillText("Hard", Xpos + size.w/3, col3Y + size.h/2);

        //detect the click
        if (mouse.x >= Xpos && mouse.x <= canvas.width/2 + size.w/2 ) {
            if (mouse.y >= col1Y && mouse.y <= col1Y + size.h) {
                this.status = "started";
            }
            else if (mouse.y >= col2Y && mouse.y <= col2Y + size.h) {
                opponent.speed = 3;
                ball.speed += 1;
                this.status = "started";
            }
            else if (mouse.y >= col3Y && mouse.y <= col3Y + size.h) {
                opponent.speed = 4;
                ball.speed += 2;
                this.status = "started";
            }
        }
    },
    drawCenterLine() {
        rect = {w: 15, h: 15};
        ctx.fillStyle = "gray";
        ctx.fillRect(canvas.width/2 - rect.w/2, 0, rect.w, canvas.height);
    },
    reset() {
        player.position = {x: 20, y: canvas.height/2 - player.size.h/2};
        opponent.position = {x: canvas.width - 25, y: canvas.height/2 - opponent.size.h/2}
        ball.position = {x: canvas.width/2, y: canvas.height/2};
        this.counter = 3;
    },
    restart() {
        if (this.timeCounter >= 180) {
            ball.velocity.x = Math.random() < 0.5 ? 1 : -1;
        }
        if (this.counter > 0) {
            ball.velocity = {x: 0, y: 0};
            this.timeCounter += 1;
            if (this.timeCounter % 60 == 0) {
                this.counter -= 1;
            }
        }
        else {
            this.timeCounter = 0;
        }
    },
    increaseScore() {
        if (ball.position.x + ball.size.w >= canvas.width) {
            player.score += 1;
            this.reset();
        }
        else if (ball.position.x <= 0) {
            opponent.score += 1
            this.reset();
        }
        this.restart();
    },
    drawCounter() {
        if (this.counter > 0) {
            ctx.fillStyle = "white";
            ctx.font = "40px Daydream";
            ctx.fillText(this.counter, canvas.width/2 - 25, canvas.height/2);
        }
    },
    drawScore() {
        ctx.fillStyle = "white";
        ctx.font = "23px Daydream"
        ctx.fillText(player.score, 75, 50);
        ctx.fillText(opponent.score, canvas.width - 100, 50);
    },
    updateGameObjects() {
        if (this.status == "started") {
            this.drawCenterLine();
            this.increaseScore();
            this.drawCounter();
            this.drawScore();
            this.gameObjects.forEach((object, index)=>{
                object.update();
            })
        }
        else {
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
});
window.addEventListener("keyup", function(event) {
    let keyBeingReleased = event.key;
    if (keyBeingReleased == "w" || keyBeingReleased == "s") {
        if (game.keysBeingPressed.includes(keyBeingReleased)) {
            game.keysBeingPressed = game.keysBeingPressed.filter((item)=>item != keyBeingReleased);
        }
        
    }
})

function gameLoop() {
    requestAnimationFrame(gameLoop);
    clear();
    game.updateGameObjects();
    keepWithinScreen(game.gameObjects[0]);
}

gameLoop();





