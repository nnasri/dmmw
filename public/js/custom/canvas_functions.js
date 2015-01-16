function fullscreen() {
    var canvas = document.getElementById('playground');
    if (canvas.webkitRequestFullScreen) {
        canvas.webkitRequestFullScreen();

    } else {
        canvas.mozRequestFullScreen();
    }
    canvas.height = window.screen.availHeight;
    canvas.width = window.screen.availWidth * (2 / 3);
}

document.getElementById('fullscreen').addEventListener("click", fullscreen);
initCanvasProperties();

window.onload = function () {
    setCanvasProperties();
    drawIntroImage();
    Dmmw.getInstance().init();
};
$(document).keyup(onKeyUp);


function initCanvasProperties(){
    $("#playground-container").height(600);
    setPlayerOneHeight();
}

function setPlayerOneHeight(){
    $("#player-one").css("margin-top", ($("#playground-container").height() - $("#player-one").height()));
}

function onKeyUp(evt) {
    if (evt.keyCode === 32) {
        Dmmw.getInstance().init();
    }
}


function drawIntroImage(){
    var img = document.getElementById("nyanImg");
    var pg = document.getElementById("playground");

    var ctx = pg.getContext("2d");
    ctx.drawImage(img, 0, 0, 555, 600);
}

function setCanvasProperties(){
    var pg = $("#playground");
    var pg_parent = pg.parent();
    var canvas = document.getElementsByTagName('canvas')[0];
    canvas.width  = pg_parent.width();
    canvas.height = pg_parent.height();
}