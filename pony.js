function create_avatar(id,x,y){
    $('#flyzone').append('<img class=\'avatar\' id=\''+ id +'\'src=\'derpy_hover_right.gif\'/>');
    $('#flyzone').append('<span class=\'chat_display\' id=\'bubble'+ id +'\'></span>');
    $('#'+id+'.avatar').css({'left': x - 55 ,'top': y - 55});
    $('#bubble'+id+'.chat_display').css({'left': x + 25 ,'top': y - 50});
  }

function animate(id,x,y){  //animate avatar function
    var x = x - 50
    var y = y - 50
    var avatar_select = '#'+id+'.avatar';
    $('#bubble'+id+'.chat_display').animate({'left': x + 70,  //animate chat text
                                'top': y - 20 },'slow');
    
    //change direction of pony if needed
    av_position = $(avatar_select).position()
    if (av_position.left < x){
      $(avatar_select).attr('src','derpy_fly_right.gif');
      var right = 1;
    } else {
      $(avatar_select).attr('src','derpy_fly_left.gif');
      var right = 0;
    }

    $(avatar_select).animate({'left': x, //animate w/func to hover right or left
                              'top': y },'slow', function() {
      if (right == 1){
        $(avatar_select).attr('src','derpy_hover_right.gif');
      } else {
        $(avatar_select).attr('src','derpy_hover_left.gif');
      }
    });
  }

  function display_msg(id,name,msg) { //function to display new messages
    $('#bubble'+id+'.chat_display').append(name + ':'+ msg + '<br/>');
  }
  
  function display_connected(pony_array){
    for(i in pony_array){
      var rand = Math.round(Math.random()*444)+50;
      create_avatar(pony_array[i],rand,rand);
    }
  }

  var socket = io.connect('http://fgsfds.com:4444'); //socket.io recieve setup

  socket.on('my_join', function(data){
    display_connected(data.list);
    my_pony_id = data.id;
    $('#flyzone').append(my_pony_id + ' welcome!!<br/>')
  });

  socket.on('join', function(data) {
    var pony_id = data.id;
    var rand = Math.round(Math.random()*444)+50;
    $('#flyzone').append(pony_id + ' has joined us<br/>')
    create_avatar(pony_id,rand,rand);
  });

  socket.on('leave', function(data){
    $('#'+data.id).remove();
    $('#bubble'+data.id).remove();
    $('#flyzone').append(data.id + ' has left us<br/>')
  });
  socket.on('click', function(data) {
    animate(data.id, data.mouseX, data.mouseY); //animate others avatars
  });
  socket.on('message',function(data) {
    display_msg(data.id, data.name, data.text); //display your chat msgs
  });

  $(document).ready(function(){ 
    chat_name = $('#name').attr('value');

    $('#flyzone').click(function(e){  //mouse clicks socket.io and animate
      socket.emit('click', { 'id': my_pony_id,
                             'mouseX': e.pageX,
                             'mouseY': e.pageY });
      animate(my_pony_id, e.pageX, e.pageY); //animate my avatar
      $('#text_entry').focus();
    });

    $('#text_entry').focus();
    $('#text_entry').keydown(function(event){  //on 'enter' do stuff
    if(event.keyCode == '13'){
        var chat_name = $('#name').attr('value');
        var chat_send = $('#text_entry').attr('value');
        socket.emit('message', {'id': my_pony_id, 'name': chat_name, 'text': chat_send});
        display_msg(my_pony_id, chat_name, chat_send); //display your chat msgs
        $('#text_entry').attr('value',''); //clear texty, and refocus
        $('#text_entry').focus();
      };
    });
});
