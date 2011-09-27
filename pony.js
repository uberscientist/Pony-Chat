function create_avatar(x,y){
    $('#flyzone').append('<img id=\'avatar\'src=\'derpy_hover_right.gif\'/>');
    $('#flyzone').append('<span id=\'chat_display\'></span>');
    $('#avatar').css({'left': x - 50 ,'top': y - 50});
    $('#chat_display').css({'left': x + 50 ,'top': y - 100});
  }

  function animate(x,y){  //animate avatar function
    var x = x - 50
    var y = y - 50
    $('#chat_display').animate({'left': x + 100,  //animate chat text
                                'top': y - 50 },'slow');
    av_position = $('#avatar').position()
    if (av_position.left < x){  //change direction of pony if needed
      $('#avatar').attr('src','derpy_fly_right.gif');
      var right = 1;
    } else {
      $('#avatar').attr('src','derpy_fly_left.gif');
      var right = 0;
    }

    $('#avatar').animate({'left': x, //animate w/func to hover right or left
                          'top': y },'slow', function() {
      if (right == 1){
        $('#avatar').attr('src','derpy_hover_right.gif');
      } else {
        $('#avatar').attr('src','derpy_hover_left.gif');
      }
    });
  }

  function display_msg(name,msg) { //function to display new messages
    $('#chat_display').append(name + ':'+ msg + '<br/>');
  }

  var socket = io.connect('http://fgsfds.com:4444'); //socket.io recieve setup

  socket.on('join', function(data) {
    create_avatar(data.mouseX, data.mouseY);
  });
  socket.on('click', function (data) {
    animate(data.mouseX,data.mouseY); //animate avatar
  });
  socket.on('message',function(data) {
    display_msg(data.name, data.text); //display your chat msgs
  });

  $(document).ready(function(){ 
    chat_name = $('#name').attr('value');

    $(document).click(function(){ //focus to chatbox always
      //$('#text_entry').focus();
    });

    $('#flyzone').click(function(e){  //mouse clicks socket.io and animate
      socket.emit('click', { 'mouseX': e.pageX, 'mouseY': e.pageY });
      animate(e.pageX,e.pageY);
      $('#text_entry').focus();
    });
    $('#text_entry').focus();
    $('#text_entry').keydown(function(event){  //on 'enter' do stuff
    if(event.keyCode == '13'){
        var chat_name = $('#name').attr('value');
        var chat_send = $('#text_entry').attr('value');
        socket.emit('message', {'name': chat_name, 'text': chat_send});
        display_msg(chat_name, chat_send); //display your chat msgs
        $('#text_entry').attr('value',''); //clear texty, and refocus
        $('#text_entry').focus();
      };
    });
});
