var Dmmw = (function(){
    var game;

    function createInstance() {
        game = new Game();
        return game;
    }

    return {
        getInstance: function () {
            if (!game) {
                game = createInstance();
            }
            return game;
        }
    };

})();

function Game(){
    var playingField = null;
    var intervalId = 0;
    var canvasMinX = 0;
    var canvasMaxX = 0;
    var colorpicker = null;
    var colorcounter = 0;

    this.setProperties = function(){
        playingField = new PlayingField(8, 15);
        intervalId = 0;
        canvasMinX = 0;
        canvasMaxX = 0;
        colorpicker = calculateColColors(playingField);
        colorcounter = 0;
    };

    this.init = function() {
        this.setProperties();
        canvasMinX = $("#playground").offset().left;
        canvasMaxX = canvasMinX + playingField.FieldWidth;
        intervalId = window.setInterval(this.redraw, 20);
        return intervalId;
    };

    this.redraw = function () {
        colorcounter += 20;
        if(colorcounter % 60 == 0){
            colorpicker = shiftRight(colorpicker);
        }
        draw(playingField, intervalId, colorpicker);
    };

    this.mouseMove = function(evt) {
        if (evt.pageX > canvasMinX && evt.pageX < canvasMaxX) {
            playingField.getPaddle(0).xCoor = Math.max(evt.pageX - canvasMinX - (playingField.getPaddle(0).PaddleWidth / 2), 0);
            playingField.getPaddle(1).xCoor = Math.max(evt.pageX - canvasMinX - (playingField.getPaddle(1).PaddleWidth / 2), 0);
            playingField.getPaddle(0).xCoor = Math.min(playingField.FieldWidth - playingField.getPaddle(0).PaddleWidth, playingField.getPaddle(0).xCoor);
            playingField.getPaddle(1).xCoor = Math.min(playingField.FieldWidth - playingField.getPaddle(1).PaddleWidth, playingField.getPaddle(0).xCoor);
        }
    };

    this.motionMove = function(direction) {
        if (direction == "right") {
            playingField.getPaddle(0).xCoor += 10;
        } else if (direction == "left") {
            playingField.getPaddle(0).xCoor -= 10;
        }
    };

    $(document).mousemove(this.mouseMove);
}