var users = [];
var user_login = false;
var active_user = null;
var message = "";


$( "#alert_register" ).hide();
// noinspection JSUnresolvedFunction
$( "#alert_login" ).hide();

function afterRegister(){
  $('#register').hide();
  $('#login').show();
}

function afterLogin(){
  //  alert("Login successful!");
  // noinspection JSUnresolvedFunction
    $('#welcome').show();
  $('#game').hide();
  $('#login').hide();
  $('#game_user').show();
  // noinspection JSUnresolvedFunction
    $('#register').hide();
  $('#register_user').hide();
  $('#login_user').hide();
  $('#logout_user').show();
  $('#btn_login').hide();
  $('#btn_register').hide();
  $('#player_name').empty();
  var user_fullname = active_user.firstName + " " + active_user.lastName;
  $('#player_name').html(user_fullname);
  $('#welcome_text').text("You may play now!");
  $('#btn_play').show()
}

function afterLogout(){
  $('#welcome').show();
  $('#game').hide();
  $('#login').hide();
  $('#register').hide();
  $('#game_user').hide();
  // noinspection JSUnresolvedFunction
    $('#alredy_login').hide();
  $('#register_user').show();
  $('#login_user').show();
  // noinspection JSUnresolvedFunction
    $('#logout_user').hide();
  $('#btn_login').show();
  $('#btn_register').show();
  $('#btn_play').hide();
  $('#welcome_text').text("Please login if you already have an account. If you don't, what are you waiting for? Go register!")
}


function userExists(userName) {

    for (var i=0; i < users.length; i++) {
      if(users[i].username === userName)
        return true
    }
    return false;
}



$( document ).ready(function() {
  var first_person = {firstName: "Tony", lastName: "Soprano", username: "a", password: "a", email: "a@post.bgu.ac.il", birthday: "01/01/01"};
  users.push(first_person);

  $( "#sign_in" ).click(function(){
    var valid = true;
    var username = "";
    var password = "";
    $( "#alert_details_login" ).empty();
    // noinspection JSUnresolvedFunction
      $( "#alert_login" ).hide();

    // noinspection JSUnresolvedFunction
      if($('#login_username').val() == '')
    {
      valid = false;
      message += "Username not valid <br \>";
    }
    else
      username = $('#login_username').val();

    if($('#login_password').val() == '')
    {
      valid = false;
      message += "Password not valid <br \>";
    }
    else
      password = $('#login_password').val();

    var user = "";
    for (var i=0; i < users.length; i++) {
      if (users[i].username === username)
        if(users[i].password === password)
          {
              user=users[i];
              break;
          }
    }

    if (!valid || user === "") 
    {
      $( "#alert_details_login" ).empty();
      $( "#alert_details_login" ).html(message);
      $( "#alert_login" ).show();
    }
    else
    {
      user_login = true;
      active_user = user;
      afterLogin();
    }
  });

  // noinspection JSUnresolvedFunction
    $( "#logout_user" ).click(function(){
    user_login = false;
    active_user = "";
    afterLogout();
    stopMusic();
    cleanBeforeNewGame();
    hearts = 2; //actually 3
    bg_music.pause();
    bg_music.currentTime = 0;
    gameOver = false;
    clearInterval(countDownTimer);
    time_left = max_game_time;
    $('#container_pre_game').show;
    $('#container_game').hide;
  });

  // Handler for .ready() called.
  $( "#continue_register" ).click(function() {
    var valid = true;
    var firstName = "";
    var lastName = "";
    var username = "";
    var password = "";
    var email = "";
    var birthday = "";
    message = "<br/>";
    // noinspection JSUnresolvedFunction
      $( "#alert_details" ).empty();
    $( "#alert_register" ).hide();

    if( !validName($('#firstName').val(), "first")) //First name
    {
      valid = false;
    }
    else
      firstName = $('#firstName').val();

    if(!validName($('#lastName').val(), "last")) //Last name
    {
      valid = false;
    }
    else
      { // noinspection JSUnresolvedFunction
          lastName = $('#lastName').val();
      }

    if($('#username').val() === '') //User name
    {
      valid = false;
      message += "Username not valid - mandatory field <br \>";
    }
    else { // noinspection JSUnresolvedFunction
        if(userExists($('#username').val()) ){
              valid = false;
              message += "Username already taken. Please choose a new username. <br/>"
            }
            else
              username = $('#username').val();
    }

    if( !passValid($('#pass').val())){
        valid = false;
    }
    else
      password = $('#pass').val();

    if( !validEmail($('#email').val()) )
    {
      valid = false;
      message += "Email not valid <br \>";
    }
    else
      email = $('#email').val();

    if($('#datepicker').val() === '')
    {
      valid = false;
      message += "Date not valid <br \>";
    }
    else
      birthday = $('#datepicker').val();

    if (!valid) 
    {
      $( "#alert_details" ).empty();
      $( "#alert_details" ).html(message);
      $( "#alert_register" ).show();
    }
    else
    {
      var person = {firstName, lastName, username, password, email, birthday};
      users.push(person);
      afterRegister();
    }
  });

    function validName(name, position) {
        if(name === ''){
            message+="Please enter your name<br/>";
            return false;
        }
        else{
            for(var i=0; i<name.length; i++){
                if (!name.charAt(i).match(/[a-z]/i)){
                    message+= "Your "+ position + " name may only contain letters<br/>";
                    return false;
                }
            }
        }
        return true;
    }

    function passValid(pass) {
        var containsNumber = false;
        var containsAlpha = false;
        if (pass.length < 8){
            message += "Password not valid, must contain at least 8 characters <br \>";
          return false;
        }
        for(var i=0; i<pass.length; i++){
            if(pass.charAt(i) >= '0' && pass.charAt(i) <= '9')
                containsNumber = true;
            else if (pass.charAt(i).match(/[a-z]/i)){
                containsAlpha = true;
            }
            else{
                message+="Password may only contain alpha-numeric characters. <br\>"
                return false;
            }
        }
        if(!(containsAlpha && containsNumber))
            message += "Password not valid, must contain numbers AND characters <br \>";
        return (containsAlpha && containsNumber);
    }

    function validEmail(email) {

        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return email.match(re);
    }



});
