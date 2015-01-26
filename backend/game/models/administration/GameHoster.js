var winston = require('winston');
var user = require('./Server_User');
var game = require('../../game');
var handler = require('../../../communication/socket_request_handler');

exports.GameHoster = function GameHost(gameId, serverSocket) {
    winston.log('info', 'GameHoster mit gameId ' + gameId + ' erstellt');
    this.gameId = gameId;
    this.serverSocket = serverSocket;
    this.userList = {};
    this.playerCounter = 0;
    this.hostCounter = 0;
};

/**
 * gibt game id zurueck
 * */
exports.GameHoster.prototype.getGameId = function () {
    return this.gameId;
};

/**
 * setzt neuen user im GameHoster und gibt die Spielernummern zurueck um auf der Client Seite
 * Punktezahl etc. richtig zu setzen
 * */
exports.GameHoster.prototype.setUser = function (role, playerSocketId) {
    winston.log('info', 'User mit role = ' + role + ' und socketId = ' + playerSocketId + ' wird hinzugefuegt zum host mit gameid ' + this.gameId);
    if (role === 'host' && this.hostCounter <= 2) {
        var u = new user.Server_User(role, playerSocketId);
        this.hostCounter += 1;
        this.userList[this.hostCounter] = u;
    } else if (role === 'player' && this.playerCounter <= 2) {
        var u = new user.Server_User(role, playerSocketId);
        this.playerCounter += 1;
        this.userList[this.playerCounter] = u;
    } else {
        winston.log('error', 'FEHLER BEIM USER SETZEN');
    }
};

/**
 * gibt Anzahl der angemeldeten user zurueck als dictionary zurueck
 * */
exports.GameHoster.prototype.userAmount = function () {
    return {
        playCounter: this.playCounter,
        hostCounter: this.hostCounter
    };
};

/**
 * startet neues Spiel
 * */
exports.GameHoster.prototype.startNewgame = function () {
    gameData();
};

function playGame() {
    game.Dmmw.getInstance(this.gameId).playingField.simulateGame(this.serverSocket, this.gameId);
    game.Dmmw.getInstance(this.gameId).redraw(); //SHIFT ARRAY
}


function motion(data) {
    if (game.Dmmw.getInstance(this.gameId).playingField != null) {
        game.Dmmw.getInstance(this.gameId).playingField.getPaddle(0).motionMove(data.text, this.serverSocket, this.gameId)
    }
}

//MUSS SPÄTER AN DEN RAUM GESCHICKT WERDEN - Einmalig
function gameData() {
    winston.log('info', 'starte das spiel!');
    if (!game.Dmmw.getInstance(this.gameId).running) {
        handler.sendComplete(this.serverSocket, this.gameId);
        game.Dmmw.getInstance(this.gameId).running = true;
        game.Dmmw.getInstance(this.gameId).intervallIdsetInterval = setInterval(playGame, 25);
    }
}
function gamePause() {
    game.Dmmw.getInstance(this.gameId).pause = !game.Dmmw.getInstance().pause;

    if (game.Dmmw.getInstance(this.gameId).pause) {
        clearInterval(game.Dmmw.getInstance().intervallIdsetInterval);
    } else {
        game.Dmmw.getInstance(this.gameId).intervallIdsetInterval = setInterval(playGame, 25);
    }
}

function keyMove(data) {
    if (data.direction == "right") {
        game.Dmmw.getInstance(this.gameId).playingField.getPaddle(1).rightDown = true;
    }
    if (data.direction == "left") {
        game.Dmmw.getInstance(this.gameId).playingField.getPaddle(1).leftDown = true;
    }

    handler.sendPaddles(this.serverSocket, this.gameId);
}


function keyRelease(data) {
    if (data.direction == "right") {
        game.Dmmw.getInstance(this.gameId).playingField.getPaddle(1).rightDown = false;
    }
    if (data.direction == "left") {
        game.Dmmw.getInstance(this.gameId).playingField.getPaddle(1).leftDown = false;
    }
    handler.sendPaddles(this.serverSocket, this.gameId);
}

function brickColor(data) {
    var row = data.row;
    var col = data.col;
    var brickColor = data.brickColor;
    game.Dmmw.getInstance(this.gameId).playingField.bricks[row][col].currentColor = brickColor;
}