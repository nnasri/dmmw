var Brick = require("./brick");
var Ball = require("./ball");
var Paddle = require("./paddle");
var handler = require('../../../communication/socket_request_handler');
var game = require('../../game');

/*
 "Spielfeld-Klasse" - Hier werden die einzelnen Elemente(Ball, Paddle, Bricks) initialisiert.
 */
exports.PlayingField = function PlayingField(rows, cols) {
    this.FieldWidth = 500;
    this.FieldHeight = 500;
    this.nRows = rows;
    this.nCols = cols;
    this.color = "#2f241e";
    this.rowHeight = 0; //Wird in setBricks überschrieben
    this.colWidth = 0; //Wird in setBricks überschrieben
    this.bricks = this.setBricks();
    this.masterBrick = null;
    this.paddles = this.initPaddles();
    this.balls = this.initBalls();
    this.countDestroyedBricks = 0;
    this.ballStates = [false, false];
};


/*
 Bricks werden initialisiert.
 */

exports.PlayingField.prototype.setBricks = function () {
    var i, j;
    var b;
    var brickWidthNoPadding = this.getFieldWidth() / this.getCols();
    var brickPadding = brickWidthNoPadding / 6;
    var brickWidth = brickWidthNoPadding - brickPadding;
    //NACHTRÄGLICH: Um den rechten Abstand beim letzten Brick entgegen zu kommen
    brickPadding = brickPadding + (brickPadding / this.getCols());
    var brickHeight = brickWidth / 3;
    b = new Array(this.getRows());
    for (i = 0; i < this.getRows(); i++) {
        b[i] = new Array(this.getCols());
        var randomNumber = Math.floor(Math.random() * this.getCols());
        for (j = 0; j < this.getCols(); j++) {
            var new_brick = new Brick.Brick(brickWidth, brickHeight, brickPadding);
            var xCoor = j * (new_brick.getWidth() + new_brick.getPadding());
            var offset = (this.getFieldHeight() - (this.getRows() * (new_brick.getHeight() + new_brick.getPadding()))) / 2;
            var yCoor = offset + i * (new_brick.getHeight() + new_brick.getPadding());
            if (i === 0) {
                yCoor = offset;
            }
            if (j === 0) {
                xCoor = j * new_brick.getWidth();
            }
            new_brick.xCoor = xCoor;
            new_brick.yCoor = yCoor;

            new_brick.hasPowerUp = j == randomNumber;
            b[i][j] = new_brick;
        }
    }
    //RowHeight und ColWidth kann man erst nachträglich bestimmen, da die Bricks dynamisch sind.
    this.rowHeight = brickHeight + brickPadding;
    this.colWidth = brickWidth + brickPadding;

    return b;
};

exports.PlayingField.prototype.setMasterBrick = function () {
    var brickWidthNoPadding = this.getFieldWidth() / this.getCols();
    var brickPadding = brickWidthNoPadding / 6;
    var brickWidth = brickWidthNoPadding - brickPadding;
    var brickHeight = brickWidth / 3;
    var masterBrick = new Brick.Brick(brickWidth,brickHeight,brickPadding);
    masterBrick.yCoor = this.getFieldHeight() / 2;
    return masterBrick
};


exports.PlayingField.prototype.moveMasterBrick = function () {
    var time = (new Date()).getTime();
    var amplitude = 150;

    var period = 2000;  //Millisekunden
    var centerX = this.getFieldWidth() / 2 - this.masterBrick.getWidth() / 2;
    //Einfache Sinus-Funktion
    var nextX = amplitude * Math.sin(time * 2 * Math.PI / period) + centerX;
    this.masterBrick.xCoor = nextX;
};

/*
 Funktion prüft ob Bricks verfügbar sind, wenn nicht, dann
 wird der MasterBrick (s.o) initialisiert.
 */
exports.PlayingField.prototype.bricksAvailable = function () {
    var totalBricks = this.getRows() * this.getCols();

    if (this.countDestroyedBricks == totalBricks) {
        if (this.masterBrick == null) {
            this.masterBrick = this.setMasterBrick();
        }
        return false;
    }
    return true;

};

/*
 Paddles für die zwei Spieler werden initialisiert.
 */
exports.PlayingField.prototype.initPaddles = function () {
    var p = {};
    var r, g, b;
    var randomColor1, randomColor2;
    var colorsOne = [], colorsTwo = [];
    for(var i = 1; i <= 6; i++){
        r = Math.round(192 * Math.random());
        g = Math.round(100 + 255 * Math.random());
        b = Math.round(170 * Math.random());
        randomColor1 = "rgba(" + r + ", " + g + ", " + b + ", 1)";
        colorsOne.push(randomColor1);
        // rot
        r = Math.round(139 + 255 * Math.random());
        g = Math.round(125 * Math.random()); //davor 228 gewesen
        b = Math.round(200 * Math.random()); //davor 225 gewesen
        randomColor2 = "rgba(" + r + ", " + g + ", " + b + ", 1)";
        colorsTwo.push(randomColor2);
    }
    p[0] = new Paddle.Paddle(this.FieldWidth / 2, colorsOne);
    p[1] = new Paddle.Paddle(this.FieldWidth / 2, colorsTwo);
    return p;
};


/*
 Bälle für die Spieler werden initialisiert.
 */
exports.PlayingField.prototype.initBalls = function () {
    var b = {};
    b[0] = new Ball.Ball("#009a80", this.getPaddle(0).xCoor + 50, 480, "one");
    b[1] = new Ball.Ball("#fe5332", this.getPaddle(1).xCoor + 50, 20, "two");
    b[0].createParticles();
    b[1].createParticles();
    return b;
};

exports.PlayingField.prototype.simulateGame = function (sio, gameId, playerList) {
    var player_one_ball = this.getBall(0);
    var player_one_paddle = this.getPaddle(0);

    if (playerList[0].getCurrentPowerUp().indexOf("ResizePaddle") > -1){
        player_one_paddle.PaddleWidth = 150;
    }else{
        player_one_paddle.PaddleWidth = 100;
    }
    var player_two_ball = this.getBall(1);
    var player_two_paddle = this.getPaddle(1);

    if (playerList[1].getCurrentPowerUp().indexOf("ResizePaddle") > -1){
        player_two_paddle.PaddleWidth = 150;
    }else{
        player_two_paddle.PaddleWidth = 100;
    }

    var mobilesocket_one = playerList[0].getMobileSocketId();
    var mobilesocket_two = playerList[1].getMobileSocketId();

    var ballArray = [];
    ballArray[0] = player_one_ball;
    ballArray[1] = player_two_ball;


    if (playerList[0].getCurrentPowerUp().indexOf("Freeze") == -1) {
        player_one_paddle.motionMove(sio, gameId);
    }
    if (playerList[1].getCurrentPowerUp().indexOf("Freeze") == -1) {
        player_two_paddle.motionMove(sio, gameId);
    }

    if (this.ballStates[0]) {
        player_one_ball.checkHitBrick(this, sio, gameId, mobilesocket_one, playerList);
        player_one_ball.checkHitRightBorder(this);
        player_one_ball.checkHitLeftBorder(this);
        //Ab hier ist die Reihenfolge wichtig. Ansonsten funktioniert das nicht
        player_one_ball.checkHitTopBorder();
        player_one_ball.checkOutside(this, 1, sio, mobilesocket_one, this.ballStates[0]);
        player_one_ball.checkHitPaddle(this, player_one_paddle, 1);
    }
    ////////////////////////////////////////////////////////////////////////
    if (this.ballStates[1]) {
        player_two_ball.checkHitBrick(this, sio, gameId, mobilesocket_two, playerList);
        player_two_ball.checkHitRightBorder(this);
        player_two_ball.checkHitLeftBorder(this);
        //Ab hier ist die Reihenfolge wichtig. Ansonsten funktioniert das nicht.
        player_two_ball.checkHitBottomBorder(this);
        player_two_ball.checkOutside(this, 2, sio, mobilesocket_two, this.ballStates[1]);
        player_two_ball.checkHitPaddle(this, player_two_paddle, 2);
    }

    if (!this.bricksAvailable()) {
        if(this.masterBrick){
            this.moveMasterBrick();
            handler.sendMasterBrick(sio, this.masterBrick, gameId);
        }
    }

    if (this.ballStates[0]) {
        player_one_ball.xCoor += player_one_ball.dx;
        player_one_ball.yCoor += player_one_ball.dy;
    }

    if (this.ballStates[1]) {
        player_two_ball.xCoor += player_two_ball.dx;
        player_two_ball.yCoor += player_two_ball.dy;
    }

    for (var i = 0;i < ballArray.length;i++) {
        for (var ball = ballArray[i], j = 0;j < ball.particles.length;j++) {
            var p = ball.particles[j];
            p.remainingLife--;
            p.radius--;
            if (0 > p.remainingLife || 0 > p.radius) {
                ball.particles[j] = new Ball.Particle(ball);
            }
        }
    }

    handler.sendBalls(sio, gameId);
    handler.sendColorpicker(sio, gameId);
};

exports.PlayingField.prototype.getRows = function () {

    return this.nRows;
};

exports.PlayingField.prototype.getCols = function () {
    return this.nCols;
};

exports.PlayingField.prototype.getBricks = function () {
    return this.bricks;
};

exports.PlayingField.prototype.getPaddle = function (paddle_id) {
    return this.paddles[paddle_id];
};

exports.PlayingField.prototype.getBall = function (ball_id) {
    return this.balls[ball_id];
};

exports.PlayingField.prototype.getFieldHeight = function () {
    return this.FieldHeight;
};

exports.PlayingField.prototype.getFieldWidth = function () {
    return this.FieldWidth;
};

exports.PlayingField.prototype.getRowHeight = function () {
    return this.rowHeight;
};

exports.PlayingField.prototype.getColWidth = function () {
    return this.colWidth;
};