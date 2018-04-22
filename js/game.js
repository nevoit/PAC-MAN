/*
                     ymmmo              `.-::::::-.`
                     dmmmy`           .:////////////--.`
:hdddddddddddyo-     dmmmmddddds     -//////////////////:
smmmmmmmmmmmmmmmy`   dmmmmmmmmmd`   .//////::::::-. :////.
ymmmd::::::/smmmmo   dmmmh::::-`    -///.            .///.
ymmmd       `hmmmy   dmmmy          .//.              .//.
ymmmd       `hmmmy   dmmmy          `//.              .//`
ymmmd       `hmmmy   dmmmy          .-``              ``-.
ymmmd       `hmmmy   dmmmy          `.-`              `-.
ymmmd       `hmmmy   ymmmm+-...       `:`            .:`
ymmmd       `hmmmy   -dmmmmmmmmh`      `-.          --
/dmms        ommd+    `+ydmmmmmh`        `--``  `.--`
                                         `--.`...../ss`
 */

var context = canvas.getContext("2d");
var pac_man_shape = {}, moving_food_shape = {}, red_ghost_shape = {}, blue_ghost_shape = null, pink_ghost_shape = null;
var board, dark_side_board;
var score = 0, goal_score = 150;
var pac_color = "yellow", last_move = 1;
var time_left, interval;
var board_size = 20, sprite_size = 60, canvasWidth, canvasHeight;
var max_game_time = 800, number_of_balls = 50, total_ball_score, bonus_score = 50;
var p5_balls, p15_balls, p25_balls;
var max_level = 10, level = 6, counter = 0, food_counter = 0, hearts = 2, number_of_ghost = 3;
var get_bonus = false, poison_mode = false, poison_timeout, gift_mode = false,
    gift_timeout, countDownTimer, cold_start = true;
var bg_music_path = "audio/theme.mp3", hit_sound_path = "audio/hit_sound.mp3",
    cherry_sound_path = "audio/cherry_sound.mp3", win_sound_path = "audio/win_sound.mp3";
var bg_music_duration, bg_music = null, hit_sound = null, cherry_sound = null, win_sound=null;
var gameOver = false;
var actors = {nothing:0, food: 1, pacMan: 2, obstacles: 4, red:5, blue: 6, pink:7, moving_food:8,
    poison:9, gift:10, p5_ball:11, p15_ball:12, p25_ball:13};
var direction = {up:1, down:2, left:3, right:4};

$("#container_game").hide();

$(document).ready(function () {

    function resize(){
        var size = $(window).height() - $("#canvas").offset().top - Math.abs($("#canvas").outerHeight(true) - $("#canvas").outerHeight())
        size *= 7/10;
        document.getElementById('canvas').height = size;
        document.getElementById('canvas').width = size;
        canvasWidth = document.getElementById("canvas").width;
        canvasHeight =  document.getElementById("canvas").height;
        sprite_size = canvasWidth / board_size; //dynamically scale character size according to board size

        if(gameOver){
            draw();
            if(hearts > 0){
                if(score >= goal_score){
                    var massage_to_draw = "We have a Winner!!!";
                    updateStatus("GAME COMPLETED!");
                    drawMessageBox("yellow", massage_to_draw , getPixelSize(massage_to_draw));
                }
                else
                {
                    var massage_to_draw = "You can do better.. " + score;
                    drawMessageBox("yellow", massage_to_draw , getPixelSize(massage_to_draw));
                }

            }
            else
            {
                var massage_to_draw = "You Lost!";
                drawMessageBox("yellow", massage_to_draw, getPixelSize(massage_to_draw))
            }

        }
    }

    resize();
    $(window).on("resize", function(){
        resize();
    });

    window.addEventListener("keydown", function(e) {
        // space and arrow keys
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    $("#re_game").click(function () {
        cleanBeforeNewGame();
        hearts = 2; //actually 3
        lblHeart.value = printHearts(hearts + 1);
        bg_music.pause();
        bg_music.currentTime = 0;
        gameOver = false;
        clearInterval(countDownTimer);
        time_left = max_game_time;
        Start();
    });


    $("#finish_pref").click(function () {

        var temp_ball_num = $('#ball_numm').val();
        if (temp_ball_num >= 50 && temp_ball_num <= 90)
            number_of_balls = temp_ball_num;
        else
            number_of_balls = 50;

        var temp_game_time = $('#game_time').val();
        if (temp_game_time >= 60 && temp_game_time <= 800)
            max_game_time = temp_game_time;
        else
            max_game_time = 60;

        var temp_ghost_num = $('#ghost_num').val();
        if (temp_ghost_num >= 1 && temp_ghost_num <= 3)
            number_of_ghost = temp_ghost_num;
        else
            number_of_ghost = 3;

        var temp_level = $('#level_check').val();
        if (temp_level >= 1 && temp_level <= 10)
            level = temp_level;
        else
            level = 6;

        $("#container_pre_game").hide();
        $("#container_game").show();
        blue_ghost_shape = null;
        pink_ghost_shape = null;
        Start();
    });

    //Clicking the game button now will also clear the intervals
    $( "#nav_game" ).click(function() {
        hideAll();
        $('#game').show();
        $("#container_pre_game").show();
        $("#container_game").hide();
        $("#ball_numm").val("50");
        $("#ghost_num").val("3");
        $("#game_time").val("60");
        $("#level_check").val("6");

        window.clearInterval(interval);
        window.clearInterval(countDownTimer);
    });

});

function getPixelSize(message) {
    var pixelWithCanvas = document.getElementById("canvas").width / 60;
    var pixelSize = "";

    if(message.length <= 10)
        pixelSize = pixelWithCanvas*3
    else if (message.length <= 20)
        pixelSize = pixelWithCanvas*2
    else if (message.length > 15)
        pixelSize = pixelWithCanvas*1

    pixelSize += "px"

    return pixelSize;
}

function printTime(time_left_seconds)
{
    var minutes = Math.floor(time_left_seconds / 60);
    var seconds = Math.floor(time_left_seconds % 60);

    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    return minutes + ":" + seconds;
}

function printHearts(number_of_hearts)
{
    if(number_of_hearts === 0) return "☠";
    var ascii_heart = "❤";
    var toPrint = "";

    for(var i=0; i<number_of_hearts; i+=1)
    {
        toPrint += ascii_heart;
    }

    return toPrint;
}

function Start() {
    time_left = max_game_time;
    score = 0;
    counter = 0;
    hearts = 2;
    lblHeart.value = printHearts(hearts + 1);
    setBallNumbers();
    canvasWidth = document.getElementById("canvas").width;
    canvasHeight =  document.getElementById("canvas").height;
    sprite_size = canvasWidth / board_size; //dynamically scale character size according to board size
    initializeBoards();
    setUpWalls();
    putGhosts();
    setUpFood();
    insertPacMan();
    insertCandy();
    gameOver = false;
    cold_start = true;

    keysDown = {};
    addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true;
    }, false);
    addEventListener("keyup", function (e) {
        keysDown[e.keyCode] = false;
    }, false);
    draw();
    interval = setInterval(updatePosition, 100); //The main loop that plays the game

    setMusic();
    bg_music.play(); //begin playing theme song
    lblTime.value = printTime(time_left);
    lblScore.value = score;
    updateStatus(" Press a directional arrow to begin playing");
    countDownTimer = setInterval(countDown, 1000);
    clearInterval(countDownTimer);
}

function winGame() {
    gameOver = true;
    lblScore.value = score;
    window.clearInterval(interval);
    window.clearInterval(countDownTimer);
    draw();
    stopMusic()
    win_sound.play();
    win_sound.currentTime = 0;
    drawFinish();

}

//The main looped function that plays the game
function updatePosition() {
    board[pac_man_shape.i][pac_man_shape.j] = actors.nothing;
    var x = getKeyPressed();
    updatePacman(x);

    if (cold_start && x !== 0) {
        cold_start = false;
        countDownTimer = setInterval(countDown, 1000);
    }
    else if (cold_start) {
        var message_to_draw = "Press a directional arrow to begin";
        drawMessageBox("yellow", message_to_draw , getPixelSize(message_to_draw));
    }
    else {
        updateFoodScore();
        if(!gift_mode && !poison_mode){
            updateStatus("Only " + (goal_score-score) +" points left to win!")
        }
        if (board[pac_man_shape.i][pac_man_shape.j] < 4 || board[pac_man_shape.i][pac_man_shape.j] > 10) { // less than '4' means its not an obstacle..
            board[pac_man_shape.i][pac_man_shape.j] = actors.pacMan;
        }
        else {
            if (poison_mode)
                updateStatus("You're poisoned!");
            if (gift_mode)
                updateStatus("Gift mode on! The ghosts are terrified of you!");
        }

        if (board[pac_man_shape.i][pac_man_shape.j] === actors.poison) {
            //  board[pac_man_shape.i][pac_man_shape.j] = actors.nothing;
            startPoison();
        }

        if (board[pac_man_shape.i][pac_man_shape.j] === actors.gift) {
            // dark_side_board[pac_man_shape.i][pac_man_shape.j] = actors.nothing;
            startGift();
        }

        if (!get_bonus && checkCollisionWithMovingFood())
            get_bonus = true;
        checkCollisions();

        if (!cold_start) {
            if (counter === (max_level - level)) {
                updateGhosts();
                counter = 0;
                if (!get_bonus && checkCollisionWithMovingFood())
                    get_bonus = true;

                if (!get_bonus)
                    if(food_counter === 1) {
                        updateMovingFood();
                        food_counter = 0;
                    }
                    else
                        food_counter = 1;


                checkCollisions();
            }
            else
                counter += 1;
        }
        if(!gameOver) //if there was a collision and game ended, don't draw
            if (score >= goal_score /*total_ball_score + bonus_score*/) {
                winGame();
            } else {
                draw();
            }
    }
}

function drawFinish() {
    updateStatus("GAME COMPLETED!");
    var message_to_draw = "We have a Winner!!!";
    drawMessageBox("yellow", message_to_draw , getPixelSize(message_to_draw));
}

function drawMessageBox(color, message, font_size) {
    context.beginPath();
    board_width = document.getElementById("canvas").width;
    board_height = document.getElementById("canvas").height;
    context.rect(0, board_height/4, board_width, board_height*0.5);
    context.fillStyle = color; //color
    context.fill();


    context.font = font_size + " 'Press Start 2P'";
    context.fillStyle = "black"; //color
    context.fillText(message, board_width/5, board_height/2);
}

function draw() {
    canvas.width = canvas.width; //clean board
    lblScore.value = score; //here we update the label score

    for (var i = 0; i < board_size; i++) {
        for (var j = 0; j < board_size; j++) {
            var center = new Object();
            center.x = i * sprite_size;
            center.y = j * sprite_size;

            /* regular board characters */

            if (board[i][j] === actors.p5_ball && dark_side_board[i][j] === actors.nothing)
                insertFood(center.x + sprite_size / 2, center.y + sprite_size / 2, actors.p5_ball);
            else if (board[i][j] === actors.p15_ball && dark_side_board[i][j] === actors.nothing)
                insertFood(center.x + sprite_size / 2, center.y + sprite_size / 2, actors.p15_ball);
            else if (board[i][j] === actors.p25_ball && dark_side_board[i][j] === actors.nothing)
                insertFood(center.x + sprite_size / 2, center.y + sprite_size / 2, actors.p25_ball);
            else if (board[i][j] === actors.poison)
                insertPill(center.x, center.y, "green");
            else if (board[i][j] === actors.gift)
                insertPill(center.x, center.y, "orange");
            /* dark side board characters */
            if (dark_side_board[i][j] === actors.red)
                insertGhost(center.x, center.y, "red");
            else if (dark_side_board[i][j] === actors.blue)
                insertGhost(center.x, center.y, "blue");
            else if (dark_side_board[i][j] === actors.pink)
                insertGhost(center.x, center.y, "pink");
            else if (dark_side_board[i][j] === actors.moving_food && !get_bonus)
                insertCherry(center.x, center.y);
            else if (dark_side_board[i][j] === actors.obstacles)
                drawWall(center.x, center.y);

            if (board[i][j] === actors.pacMan) { //draw the pac-man
                if (last_move === direction.up)
                    drawPacMan(center.x, center.y, 1.65 * Math.PI, 3.35 * Math.PI, "black", -sprite_size / 4, sprite_size / 12);
                else if (last_move === direction.down)
                    drawPacMan(center.x, center.y, 0.65 * Math.PI, 2.35 * Math.PI, "black", -sprite_size / 4, sprite_size / 12);
                else if (last_move === direction.left)
                    drawPacMan(center.x, center.y, 1.15 * Math.PI, 2.85 * Math.PI, "black", sprite_size / 12, -sprite_size / 4);
                else //right
                    drawPacMan(center.x, center.y, 0.15 * Math.PI, 1.85 * Math.PI, "black", sprite_size / 12, -sprite_size / 4);
            }
        }
    }
}

function Finish() {
    hit_sound.play();
    if (hearts !== 0 && time_left > 0) { //Can continue
        cleanBeforeNewTry();
        hearts -= 1;
        lblHeart.value = printHearts(hearts+1); //here we update the label score
        updateStatus("You were eaten! Press an arrow to continue");
    }
    else { //Game over
        stopMusic();
        gameOver = true;
        window.clearInterval(countDownTimer);
        window.clearInterval(interval);
        window.clearInterval(poison_timeout);
        window.clearInterval(gift_timeout);
        lblHeart.value = printHearts(0);

        if (hearts === 0){
            var message_to_draw = "You Lost!";
            drawMessageBox("yellow", message_to_draw, getPixelSize(message_to_draw));
        }

        else if(score <= goal_score) {
            var message_to_draw = "You can do better.." + score;
            drawMessageBox("yellow", message_to_draw, getPixelSize(message_to_draw));
        }
    }
    hit_sound.currentTime = 0;
}

function updateFoodScore() {
    if (board[pac_man_shape.i][pac_man_shape.j] === actors.p5_ball)
        score += 5;
    if (board[pac_man_shape.i][pac_man_shape.j] === actors.p15_ball)
        score += 15;
    if (board[pac_man_shape.i][pac_man_shape.j] === actors.p25_ball)
        score += 25;
}

//receives key press and updates pacman location accordingly
function updatePacman(x) {
    if (x === direction.up) {
        if (pac_man_shape.j > 0 && board[pac_man_shape.i][pac_man_shape.j - 1] !== actors.obstacles) {
            pac_man_shape.j--;
        }
        last_move = direction.up;
    }
    else if (x === direction.down) {
        if (pac_man_shape.j < board_size - 1 && board[pac_man_shape.i][pac_man_shape.j + 1] !== actors.obstacles) {
            pac_man_shape.j++;
        }
        last_move = direction.down;
    }
    else if (x === direction.left) {
        if (pac_man_shape.i > 0 && board[pac_man_shape.i - 1][pac_man_shape.j] !== actors.obstacles) {
            pac_man_shape.i--;
        }
        last_move = direction.left;
    }
    else if (x === direction.right) {
        if (pac_man_shape.i < board_size - 1 && board[pac_man_shape.i + 1][pac_man_shape.j] !== actors.obstacles) {
            pac_man_shape.i++;
        }
        last_move = direction.right;
    }
}

//inserts the walls of the game
function setUpWalls() {
    var x = Math.random();
    if(x <= 0.33)
        map1(board, dark_side_board);
    else if (x <= 0.66)
        map2(board, dark_side_board);
    else
        map3(board, dark_side_board);
}


//Initializes the board game and ghost board.
function initializeBoards() {
    board = []; // create dynamic array
    dark_side_board = [];
    for (var i = 0; i < board_size; i++) {
        board[i] = [];
        dark_side_board[i] = [];
        for(var j=0; j<board_size; j++)
        {
            board[i][j] = actors.nothing;
            dark_side_board[i][j] = actors.nothing;
        }
    }
}

function setBallNumbers() {
    p5_balls = Math.floor(number_of_balls * 0.6);
    p15_balls = Math.floor(number_of_balls * 0.3);
    p25_balls = number_of_balls - p5_balls - p15_balls;
    total_ball_score = p5_balls*5 + p15_balls*15 + p25_balls*25;
}

function setUpFood(){
    var i;
    var emptyCell;
    var x_cell;
    var y_cell;

    for(i=p5_balls; i>0 ; i--){
        emptyCell = findRandomEmptyCell(board);
        x_cell = emptyCell[0];
        y_cell = emptyCell[1];
        board[x_cell][y_cell] = actors.p5_ball;
    }
    for(i=p15_balls; i>0 ; i--){
        emptyCell = findRandomEmptyCell(board);
        x_cell = emptyCell[0];
        y_cell = emptyCell[1];
        board[x_cell][y_cell] = actors.p15_ball;
    }
    for(i=p25_balls; i>0 ; i--){
        emptyCell = findRandomEmptyCell(board);
        x_cell = emptyCell[0];
        y_cell = emptyCell[1];
        board[x_cell][y_cell] = actors.p25_ball;
    }
}

function insertPacMan() {

    var emptyCell;
    var redDist = 0 , blueDist = 0, pinkDist = 0;

    while(redDist < 3 || blueDist < 3 || pinkDist < 3){
        emptyCell = findRandomEmptyCell(board);
        redDist = manhattanDistance(red_ghost_shape.i, red_ghost_shape.j, emptyCell[0], emptyCell[1]);
        if(number_of_ghost > 1)
            blueDist = manhattanDistance(blue_ghost_shape.i, blue_ghost_shape.i, emptyCell[0], emptyCell[1]);
        else
            blueDist = 4;
        if(number_of_ghost > 2)
            pinkDist = manhattanDistance(pink_ghost_shape.i, pink_ghost_shape.j, emptyCell[0], emptyCell[1]);
        else
            pinkDist = 4;
    }

    var x_cell = emptyCell[0];
    var y_cell = emptyCell[1];
    board[x_cell][y_cell] = actors.pacMan;
    pac_man_shape.i = x_cell;
    pac_man_shape.j = y_cell;

}

function insertCandy() {
    var emptyCell = findRandomEmptyCell(board);
    var x_cell = emptyCell[0];
    var y_cell = emptyCell[1];
    board[x_cell][y_cell] = actors.poison;

    emptyCell = findRandomEmptyCell(board);
    x_cell = emptyCell[0];
    y_cell = emptyCell[1];
    board[x_cell][y_cell] = actors.gift;

    dark_side_board[board_size - 1][board_size - 1] = actors.moving_food;
    moving_food_shape.i = board_size - 1;
    moving_food_shape.j = board_size - 1;
}

function countDown() {
    time_left--;
    lblTime.value = printTime(time_left); //here we update the lable time
    if(time_left <= 0)
    {
        Finish()
    }
}

//defines the sounds effects of game including background music
function setMusic() {
    bg_music = document.createElement('audio');
    bg_music.setAttribute('src', bg_music_path);
    bg_music_duration = bg_music.duration;
    bg_music.volume = 0.2;

    hit_sound = document.createElement('audio');
    hit_sound.setAttribute('src', hit_sound_path);

    cherry_sound = document.createElement('audio');
    cherry_sound.setAttribute('src', cherry_sound_path);

    win_sound = document.createElement('audio');
    win_sound.setAttribute('src', win_sound_path);

    bg_music.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
}

function stopMusic() {
    bg_music.pause();
    bg_music.currentTime = 0;
}

function putGhosts() {
    dark_side_board[0][0] = actors.red;
    red_ghost_shape.i = 0;
    red_ghost_shape.j = 0;

    if (number_of_ghost >= 2) {
        blue_ghost_shape = {};
        dark_side_board[0][board_size - 1] = actors.blue;
        blue_ghost_shape.i = 0;
        blue_ghost_shape.j = board_size - 1;
    }
    if (number_of_ghost >= 3) {
        pink_ghost_shape = {};
        dark_side_board[board_size - 1][0] = actors.pink;
        pink_ghost_shape.i = board_size - 1;
        pink_ghost_shape.j = 0;
    }
}

function clearGhosts() {
    dark_side_board[red_ghost_shape.i][red_ghost_shape.j] = actors.nothing;
    dark_side_board[moving_food_shape.i][ moving_food_shape.j] = actors.nothing;

    if (number_of_ghost >= 2)
        dark_side_board[blue_ghost_shape.i][blue_ghost_shape.j] = actors.nothing;

    if (number_of_ghost >= 3)
        dark_side_board[pink_ghost_shape.i][pink_ghost_shape.j] = actors.nothing;
}

function findRandomEmptyCell(board) {
    var i = Math.floor((Math.random() * (board_size)));
    var j = Math.floor((Math.random() * (board_size)));
    while (board[i][j] !== actors.nothing || dark_side_board[i][j]!== actors.nothing ) {
        i = Math.floor((Math.random() * (board_size)));
        j = Math.floor((Math.random() * (board_size)));
    }
    return [i, j];

}

function getKeyPressed() {
    if (keysDown[38])
        if(poison_mode)
            return 2;
        else {
            return 1;
        }
    if (keysDown[40])
        if(poison_mode)
            return 1;
        else {
            return 2;
        }
    if (keysDown[37])
        if(poison_mode)
            return 4;
        else {
            return 3;
        }
    if (keysDown[39])
        if(poison_mode)
            return 3;
        else {
            return 4;

        }
    return 0; // if the user didn't press any key

}

function drawPacMan(x_value, y_value, start_angle, end_angle, color, eye_x, eye_y) {
    x_value+=sprite_size/2;
    y_value+=sprite_size/2;
    context.beginPath();
    context.arc(x_value, y_value, sprite_size/2, start_angle, end_angle); // half circle
    context.lineTo(x_value, y_value);
    context.fillStyle = pac_color; //color
    context.fill();
    context.beginPath();
    context.arc(x_value + eye_x, y_value + eye_y, sprite_size/12, 0, 2 * Math.PI); // circle
    context.fillStyle = color; //color
    context.fill();

}

function insertGhost(x_center, y_center, color) {

    /*context.beginPath();
    context.rect(x_center, y_center, sprite_size, sprite_size);
    context.fillStyle = "yellow"; //color
    context.fill(); */
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var img = new Image();
    img.src = "images/" + color + "_ghost.gif";
    ctx.drawImage(img, x_center + 3, y_center, 0.9 * (canvasWidth/board_size), 0.9 * (canvasHeight/board_size));

}

function drawWall(x_center, y_center) {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var img = new Image();
    img.src = "images/wall.svg";
    ctx.drawImage(img, x_center + 3, y_center, 0.9 * (canvasWidth / board_size), 0.9 * (canvasHeight / board_size));
}

function insertCherry(x_center, y_center) {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var img = new Image();
    img.src = "images/cherry2.svg";
    ctx.drawImage(img, x_center, y_center, 1*(canvasWidth/board_size), 1*(canvasHeight/board_size));

}

function insertPill(x_center, y_center, color) {
    var c = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var img = new Image();
    img.src = "images/" + color + "_pill.svg";
    ctx.drawImage(img, x_center, y_center, 0.7*(canvasWidth/board_size), 0.7*(canvasHeight/board_size));

}

function insertFood(x_center, y_center, type) {
    context.beginPath();
    context.arc(x_center, y_center, sprite_size/5, 0, 2 * Math.PI); // circle
    if(type === actors.p5_ball) {
        context.fillStyle = "#ffffff"; //color
    }
    if(type === actors.p15_ball) {
        context.fillStyle = "#4858ff"; //color
    }
    if(type === actors.p25_ball) {
        context.fillStyle = "#ff9500"; //color
    }
    context.fill();
}

function findOptionalMoves(x, y) {
    var options = [];
    if (x - 1 >= 0 && isClear( x-1, y) /*&& (dark_side_board[x - 1][y] === actors.nothing ) */   )
        options.push({x: x - 1, y: y}); //left
    if (y - 1 >= 0 && isClear(x, y-1) /*&& dark_side_board[x][y - 1] === actors.nothing */   )
        options.push({x: x, y: y - 1}); //up
    if (x + 1 <= board_size - 1 && isClear( x+1, y) /* && dark_side_board[x + 1][y] === actors.nothing */  )
        options.push({x: x + 1, y: y}); //right
    if (y + 1 <= board_size - 1 && isClear( x, y+1) /*&& dark_side_board[x][y + 1] === actors.nothing */  )
        options.push({x: x, y: y + 1}); //down

    return options;
}

function isClear(x,y){

    var cellIsClear;
    cellIsClear = ((board[x][y] !== actors.obstacles) && (dark_side_board[x][y] !== actors.moving_food) && (dark_side_board[x][y] !== actors.red) && (dark_side_board[x][y] !== actors.blue) && (dark_side_board[x][y] !== actors.pink));

    return cellIsClear;
}

function findOptimalPathToPacMan(x, y) {
    var options = findOptionalMoves(x, y);

    /*
    var min = board_size * board_size;
    var min_index = 0;
    var temp_min = 0;
    for (var k = 0; k < options.length; k++) {
        temp_min = Math.sqrt(Math.pow((pac_man_shape.i - options[k].x), 2) + Math.pow((pac_man_shape.j - options[k].y), 2));
        if (temp_min < min) {
            min = temp_min;
            min_index = k;
        }
    }
    return options[min_index]; */

    var choice = options[0];
    var minManhattanDist = manhattanDistance(pac_man_shape.i, pac_man_shape.j, choice.x, choice.y);

    for (var k = 1; k < options.length; k++){
        if( manhattanDistance(pac_man_shape.i, pac_man_shape.j, options[k].x, options[k].y) < minManhattanDist){
            choice = options[k];
            minManhattanDist = manhattanDistance(pac_man_shape.i, pac_man_shape.j, options[k].x, options[k].y);
        }
    }

    return choice;
}

function manhattanDistance(x1, y1, x2, y2){
    return Math.abs(x1-x2) + Math.abs(y1-y2);
}

function findLongPathToPacMan(x, y) {
    var options = findOptionalMoves(x, y);
    var max = 0;
    var max_index = 0;
    var temp_max = 0;
    for (var k = 0; k < options.length; k++) {
        temp_max = Math.sqrt(Math.pow((pac_man_shape.i - options[k].x), 2) + Math.pow((pac_man_shape.j - options[k].y), 2));
        if (temp_max > max) {
            max = temp_max;
            max_index = k;
        }
    }
    return options[max_index];
}

function cleanBeforeNewGame() {
    window.clearInterval(interval);
    cold_start = true;
    get_bonus = false;
    poison_mode = false;
    clearTimeout(poison_timeout);
    gift_mode = false;
    clearTimeout(gift_timeout);
    pac_color = "yellow";
    gameOver = false;
    blue_ghost_shape = null;
    pink_ghost_shape = null;
}

function cleanBeforeNewTry() {
    cold_start = true;
    gameOver = false;
    poison_mode = false;
    clearTimeout(poison_timeout);
    gift_mode = false;
    clearTimeout(gift_timeout);
    pac_color = "yellow";
    clearGhosts();
    putGhosts();
    board[pac_man_shape.i][pac_man_shape.j] = actors.nothing;
    insertPacMan();
    window.clearInterval(countDownTimer);
}

//occasionally perform a random move so the ghosts are more erratic and don't get stuck
function randomMove(x, y){
    var options = findOptionalMoves(x,y);
    var choice = Math.floor( Math.random() * options.length)
    return options[choice];
}
function updateGhosts() {
    var pair_red;
    if(!gift_mode) {
        var randomPath = Math.random();
        if(randomPath <= 0.2)
            pair_red = randomMove(red_ghost_shape.i, red_ghost_shape.j);
        else
            pair_red = findOptimalPathToPacMan(red_ghost_shape.i, red_ghost_shape.j);
    }
    else
        pair_red = findLongPathToPacMan(red_ghost_shape.i, red_ghost_shape.j);
    dark_side_board[red_ghost_shape.i][red_ghost_shape.j] = 0;
    dark_side_board[pair_red.x][pair_red.y] = 5;
    red_ghost_shape.i = pair_red.x;
    red_ghost_shape.j = pair_red.y;

    if (blue_ghost_shape != null) {
        var pair_blue;
        if(!gift_mode){
            var randomPath = Math.random();
            if(randomPath <= 0.25)
                pair_blue = randomMove(blue_ghost_shape.i, blue_ghost_shape.j);
            else
                pair_blue = findOptimalPathToPacMan(blue_ghost_shape.i, blue_ghost_shape.j);
        }
        else
            pair_blue = findLongPathToPacMan(blue_ghost_shape.i, blue_ghost_shape.j);
        dark_side_board[blue_ghost_shape.i][blue_ghost_shape.j] = 0;
        dark_side_board[pair_blue.x][pair_blue.y] = 6;
        blue_ghost_shape.i = pair_blue.x;
        blue_ghost_shape.j = pair_blue.y;
    }

    if (pink_ghost_shape != null) {
        var pair_pink;
        if(!gift_mode){
            var randomPath = Math.random();
            if(randomPath <= 0.25)
                pair_pink = randomMove(pink_ghost_shape.i, pink_ghost_shape.j);
            else
                pair_pink = findOptimalPathToPacMan(pink_ghost_shape.i, pink_ghost_shape.j);
        }
        else
            pair_pink = findLongPathToPacMan(pink_ghost_shape.i, pink_ghost_shape.j);
        dark_side_board[pink_ghost_shape.i][pink_ghost_shape.j] = 0;
        dark_side_board[pair_pink.x][pair_pink.y] = 7;
        pink_ghost_shape.i = pair_pink.x;
        pink_ghost_shape.j = pair_pink.y;
    }
}

//Checks if pacman collided with the ghosts
function checkCollisions() {
    if (red_ghost_shape.i === pac_man_shape.i && red_ghost_shape.j === pac_man_shape.j) {
        Finish();
        return true;
    }

    if (blue_ghost_shape != null && blue_ghost_shape.i === pac_man_shape.i && blue_ghost_shape.j === pac_man_shape.j) {
        Finish();
        return true;
    }

    if (pink_ghost_shape != null && pink_ghost_shape.i === pac_man_shape.i && pink_ghost_shape.j === pac_man_shape.j) {
        Finish();
        return true;
    }
}

function checkCollisionWithMovingFood() {
    if (moving_food_shape.i === pac_man_shape.i && moving_food_shape.j === pac_man_shape.j) {
        cherry_sound.play();
        score += bonus_score;
        dark_side_board[moving_food_shape.i][moving_food_shape.j] = actors.nothing;
        cherry_sound.currentTime = 0;
        return true;
    }
}

function updateMovingFood() {
    var options = findOptionalMoves(moving_food_shape.i, moving_food_shape.j);
    var index = getRandomInt(0, options.length-1);

    var pair_food = options[index];
    dark_side_board[moving_food_shape.i][moving_food_shape.j] = actors.nothing;
    dark_side_board[pair_food.x][pair_food.y] = actors.moving_food;
    moving_food_shape.i = pair_food.x;
    moving_food_shape.j = pair_food.y;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function startPoison() {
    cherry_sound.play();
    cherry_sound.currentTime = 0;
    poison_mode = true;
    updateStatus("Poison mode ON!");
    pac_color = "purple";

    poison_timeout = setTimeout(function() {
        poison_mode = false;
        if(!gameOver)
            updateStatus("Poison mode OFF!");
        pac_color = "yellow";
    }, 5000);
}

function startGift() {
    cherry_sound.play();
    cherry_sound.currentTime = 0;
    gift_mode = true;
    updateStatus("Gift mode ON!");
    pac_color = "Orange";

    gift_timeout = setTimeout(function() {
        gift_mode = false;
        if(!gameOver)
            updateStatus("Gift mode OFF!");
        pac_color = "yellow";
    }, 5000);

}

function updateStatus(message){
    // noinspection JSUnresolvedFunction
    $('#game_status').empty();
    $('#game_status').html(message);
}

function drawGhost(x_center, y_center, color) {
    context.beginPath();
    context.rect(x_center, y_center, 60, 60);
    context.fillStyle = color; //color
    context.fill();

}

function calc_total(){
    var total = 0;
    for(var i=0; i<board_size; i++){
        for(var j=0; j<board_size; j++){
            if (board[i][j] === actors.p5_ball) {
                total+=5;
            }
            if (board[i][j] === actors.p15_ball) {
                total+=15;
            }
            if (board[i][j] === actors.p25_ball) {
                total+=25;
            }
        }
    }
}