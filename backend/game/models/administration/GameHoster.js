var winston = require('winston');
var user = require('./Server_User');
var game = require('../../game');
var handler = require('../../../communication/socket_request_handler');

exports.GameHoster = function GameHost(gameId, serverSocket, isPrivate) {
    winston.log('info', 'GameHoster mit gameId ' + gameId + ' erstellt');
    this.gameId = gameId;
    this.serverSocket = serverSocket;
    this.playerList = [];
    this.isPrivate = isPrivate;
};

/**
 * setzt neuen user im GameHoster und gibt die Spielernummer zurueck um auf client seite zuordnungen zu machen
 * */
exports.GameHoster.prototype.setUser = function (playerSocketId) {
    var playListLength = this.playerList.length;
    if (playListLength <= 1) {
        var u = new user.Server_User(playerSocketId);
        this.playerList.push(u);
        return playListLength;
    }
    winston.log('error', 'FEHLER BEIM USER ERSTELLEN');
    return null;
};

/**
 * setzt weitere Daten eines Users
 * */
exports.GameHoster.prototype.setUserDataInUser = function (username, playerNumber) {
    winston.log('info', ['Setze username = ', username, ' bei Player mit playerNumber: ', playerNumber].join(' '));
    this.playerList[playerNumber].setUsername(username);
};

/**
 * setzt mobileSocketId Daten eines Users
 * */
exports.GameHoster.prototype.setMobileSocketInUser = function (mobileSocketId) {
    if (this.playerList[0].getMobileSocketId() == null) {
        winston.log('info', ['Setze mobileSocket bei Player 1 mit mobileSocketId: ', mobileSocketId].join(' '));
        this.playerList[0].setMobilerSocketId(mobileSocketId);
        return {
            playerNumber: 0,
            username: this.playerList[0].getUsername()
        };
    } else if (this.playerList[1].getMobileSocketId() == null) {
        winston.log('info', ['Setze mobileSocket bei Player 2 mit mobileSocketId: ', mobileSocketId].join(' '));
        this.playerList[1].setMobilerSocketId(mobileSocketId);
        return {
            playerNumber: 1,
            username: this.playerList[1].getUsername()
        };
    } else {
        winston.log('error', 'FEHLER BEIM SETZEN DER MOBILESOCKETID');
        return null;
    }
};

/**
 *gib user socket id zurueck
 * */
exports.GameHoster.prototype.getUserSocketId = function (playerNumber) {
    if (this.playerList[playerNumber] != null) {
        return this.playerList[playerNumber].getPlayerSocketId();
    }
    winston.log('error', ['FEHLER BEIM HOLEN DER SOCKET ID VOM USER ', playerNumber].join(' '));
    return null;
};

/**
 * gib zurueck obs ein private oder random game ist
 * */
exports.GameHoster.prototype.getIsPrivate = function () {
    return this.isPrivate;
};

/**
 * gib zurueck obs ein private oder random game ist
 * */
exports.GameHoster.prototype.arePlayersReady = function (playerNumber) {
    this.playerList[playerNumber].setIsReady(true);
    if (this.playerList.length == 2) {
        if (this.playerList[0].getIsReady() && this.playerList[1].getIsReady()) {
            return true;
        }
    }
    return false;
};

/**
 * gib game id zurueck
 * */
exports.GameHoster.prototype.getGameId = function () {
    return this.gameId;
};

/**
 * gib userList zurueck
 * */
exports.GameHoster.prototype.getPlayerList = function () {
    return this.playerList;
};

/**
 * gib Anzahl der angemeldeten user als dictionary zurueck
 * */
exports.GameHoster.prototype.getUserAmount = function () {
    return this.playerList.length;
};

/** ********************************
 *           GAME ACTIONS          *
 * ****************************** **/

exports.GameHoster.prototype.playGame = function () {
    game.Dmmw.getInstance(this.gameId).playingField.simulateGame(this.serverSocket, this.gameId, this.playerList);
    game.Dmmw.getInstance(this.gameId).redraw(); //SHIFT ARRAY
};

exports.GameHoster.prototype.motion = function (data) {
    if (game.Dmmw.getInstance(this.gameId).playingField !== null) {
        game.Dmmw.getInstance(this.gameId).playingField.getPaddle(data.playerNumber).currentMotion = data.text;
    }
};

exports.GameHoster.prototype.gameData = function () {
    if (!game.Dmmw.getInstance(this.gameId).running) {
        handler.sendComplete(this.serverSocket, this.gameId);
        game.Dmmw.getInstance(this.gameId).running = true;
        game.Dmmw.getInstance(this.gameId).intervallId = setInterval(this.playGame.bind(this), 25);
    }
};
exports.GameHoster.prototype.gamePause = function () {
    game.Dmmw.getInstance(this.gameId).pause = !game.Dmmw.getInstance(this.gameId).pause;
    if (game.Dmmw.getInstance(this.gameId).pause) {
        clearInterval(game.Dmmw.getInstance(this.gameId).intervallId);
    } else {
        game.Dmmw.getInstance(this.gameId).intervallId = setInterval(this.playGame.bind(this), 25);
    }
};

exports.GameHoster.prototype.brickColor = function (data) {
    var row = data.row;
    var col = data.col;
    var brickColor = data.brickColor;
    game.Dmmw.getInstance(this.gameId).playingField.bricks[row][col].currentColor = brickColor;
};

exports.GameHoster.prototype.changeBallState = function (playerNumber) {
    game.Dmmw.getInstance(this.gameId).playingField.ballStates[playerNumber] = !game.Dmmw.getInstance(this.gameId).playingField.ballStates[playerNumber];
};