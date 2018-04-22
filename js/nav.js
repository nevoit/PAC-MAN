// noinspection JSUnresolvedFunction
$('#logout_user').hide();
$('#game_user').hide();
$('#btn_play').hide();

$( "#btn_login, #nav_login" ).click(function() {
  hideAll();
  $('#login').show();
});

$( "#btn_register, #nav_register" ).click(function() {
  hideAll();
  // noinspection JSUnresolvedFunction
    $('#register').show();
});

$( "#home_mode" ).click(function() {
  hideAll();
  $('#welcome').show();
  stopMusic();
});

$( "#nav_game" ).click(function() {
    hideAll();
    $('#game').show();
    $("#container_pre_game").show();
    $("#container_game").hide();
    $("#ball_numm").val("50");
    $("#ghost_num").val("3");
    $("#game_time").val("60");
    $("#level_check").val("6");
});

$( "#btn_play" ).click(function() {
    hideAll();
    $('#game').show();
    $("#container_pre_game").show();
    $("#container_game").hide();
    $("#ball_numm").val("50");
    $("#ghost_num").val("3");
    $("#game_time").val("60");
    $("#level_check").val("6");
});

hideAll();
$('#welcome').show();

function hideAll(){
  $('#welcome').hide();
  $('#game').hide();
  $('#login').hide();
  $('#register').hide();
  $('#alredy_login').hide();

}
