function sanitize(text){
  var i;
  var clean_text = '';
  var escape = '<>';
  for(i = 0; i < text.length; i++){
    var c = text.charAt(i);
    if(escape.indexOf(c) == -1) clean_text += c;
    if(escape.indexOf(c) == 0) clean_text += '&lt;';
    if(escape.indexOf(c) == 1) clean_text += '&gt;';
  }
  return clean_text;
}

function create_avatar(id,x,y){
    $('#flyzone').append('<img class=\'avatar\' id=\''+ id +'\'src=\'derpy_hover_right.gif\'/>');
    $('#'+id+'.avatar').css({'left': x - 55 ,'top': y - 55});
  }

function animate(id,x,y){  //animate avatar function
    var x = x - 50
    var y = y - 50
    var avatar_select = '#'+id+'.avatar';
    
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

  function display_msg(id,name,msg,num) { //function to display new messages
    $('#flyzone').append('<div id='+num+'chat'+id+' class=chat_display>'+name+':'+msg+'</div>'); 
    var chat_bubble = '#'+num+'chat'+id+'.chat_display';
    var avatar_select = '#'+id+'.avatar';
    av_position = $(avatar_select).position()
    $(chat_bubble).css({'left':av_position.left, 'top':av_position.top});
    $(chat_bubble).animate({'top':'15px'},5000, function(){
      $(chat_bubble).fadeOut(10000);
     });
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
  });

  socket.on('join', function(data) {
    var pony_id = data.id;
    var rand = Math.round(Math.random()*444)+50;
    create_avatar(pony_id,rand,rand);
  });

  socket.on('leave', function(data){
    $('#'+data.id).remove();
    $('#bubble'+data.id).remove();
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
    chat_num = 0;
    $('#text_entry').keydown(function(event){  //on 'enter' do stuff
    if(event.keyCode == '13'){
        chat_num++;
        var chat_name = $('#name').attr('value');
        var chat_send = $('#text_entry').attr('value');
        socket.emit('message',{ 'id': my_pony_id, 
                                'name': chat_name,
                                'text': chat_send, 
                                'num':chat_num });
        display_msg(my_pony_id, sanitize(chat_name), sanitize(chat_send), chat_num); //display your chat msgs
        $('#text_entry').attr('value',''); //clear texty, and refocus
        $('#text_entry').focus();
      };
    });
});
