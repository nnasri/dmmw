/*
"Paddle-Klasse" - Logik für die Bewegung der Paddles
 */
function Paddle(x, color) {
    this.PaddleWidth = 100;
    this.PaddleHeight = 10;
    this.xCoor = x;
    this.PaddleColor = color;

    this.rightDown = false;
    this.leftDown = false;
}

/*
Tastatur Pfeil Rechts
 */
Paddle.prototype.checkRightDown = function () {
    if (this.rightDown) {
        this.xCoor += 10;
    }
};
/*
 Tastatur Pfeil Links
 */
Paddle.prototype.checkLeftDown = function () {
    if (this.leftDown) {
        this.xCoor -= 10;
    }
};


/*
 Static Funktion (ohne prototype)
 */
Paddle.onKeyUp = function (evt) {
    if (evt.keyCode === 39) {
        this.rightDown = false;
    } else if (evt.keyCode === 37) {
        this.leftDown = false;
    }
};

/*
 Static Funktion (ohne prototype)
 */
Paddle.onKeyDown = function (evt) {
    if (evt.keyCode === 39) {
        this.rightDown = true;
    } else if (evt.keyCode === 37) {
        this.leftDown = true;
    }
};

