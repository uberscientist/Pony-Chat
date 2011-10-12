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

function create_avatar(id,x,y,sprite,name){
    $('#flyzone').append('<img class=\'avatar\' id=\''+ id +
                         '\'src=\'./sprites/'+ sprite +'_hover_right.gif\'/>');
    $('#flyzone').append('<span class=\'name\' id=\'name' + id +
                         '\'>'+ name + '</span>');
    $('#'+id+'.avatar').css({'left': x - 55 ,'top': y - 55});
}

function animate(id,x,y,sprite){  //animate avatar function
    var x = x - 50
    var y = y - 50
    var avatar_select = '#'+id+'.avatar';
    var name_select = '#name'+id+'.name';
    
    //change direction of pony if needed
    av_position = $(avatar_select).position()
    if (av_position.left < x){
      $(avatar_select).attr('src','./sprites/'+ sprite +'_fly_right.gif');
      var right = 1;
    } else {
      $(avatar_select).attr('src','./sprites/'+ sprite +'_fly_left.gif');
      var right = 0;
    }

    $(name_select).animate({'left': x,
                            'top': y-20 },'slow');
    $(avatar_select).animate({'left': x, //animate w/func to hover right or left
                              'top': y },'slow', function() {
      if (right == 1){
        $(avatar_select).attr('src','./sprites/'+ sprite +'_hover_right.gif');
      } else {
        $(avatar_select).attr('src','./sprites/'+ sprite +'_hover_left.gif');
      }
    });
}

function display_msg(id,name,msg) { //function to display new messages
  $('#chatbox').append(name +': '+msg+'<br/>');
  $('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);
  $('#'+id+'.name').html(name);
}
  
function display_connected(pony_array){
  for(i in pony_array){
    var rand = Math.round(Math.random()*444)+50;
    create_avatar(pony_array[i],rand,rand,'derpy','Anonymous');
    }
}

function change_sprite(data){
  var rand = Math.round(Math.random()*444)+50;
  $('#'+data.id).remove();
  $('#name'+data.id).remove();
  create_avatar(data.id,rand,rand,data.sprite,data.name);
}

var socket = io.connect('http://fgsfds.com:4444'); //socket.io recieve setup

socket.on('my_join', function(data){
  display_connected(data.list);
  my_pony_id = data.id;
});

socket.on('join', function(data) {
  var rand = Math.round(Math.random()*444)+50;
  create_avatar(data.id,rand,rand,'derpy',data.name);
  $('#chatdisplay').append('<i>'+data.name+' joined</i><br/>');
});

socket.on('leave', function(data){
  $('#'+data.id).remove();
});

socket.on('click', function(data) {
  animate(data.id, data.mouseX, data.mouseY, data.sprite); //animate others avatars
});

socket.on('message', function(data) {
  display_msg(data.id, data.name, data.text); //display your chat msgs
});

socket.on('change_sprite', function(data) {
  change_sprite(data);
});

$(document).ready(function(){ 
//setup some globals on document.ready
  $('#text_entry').focus
  chat_name = $('#name').attr('value');
  sprite = $('#select_list').val();

//change sprite on selecting new sprite from dropdown list
  $('#select_list').change(function(){
    sprite = $('#select_list').val();
    data = { 'id': my_pony_id,
             'sprite': sprite,
             'name': chat_name };
    change_sprite(data);
    socket.emit('change_sprite',data);
  });

  $('#flyzone').click(function(e){  //mouse clicks socket.io and animate
    if(e.pageX < 990 && e.pageY < 550){
      socket.emit('click', { 'id': my_pony_id,
                             'mouseX': e.pageX,
                             'mouseY': e.pageY,
                             'sprite': sprite });
     animate(my_pony_id, e.pageX, e.pageY, sprite); //animate my avatar
    }
    $('#text_entry').focus();
  });

  $('#text_entry').keydown(function(event){  //on 'enter' do stuff
  if(event.keyCode == '13'){
      var chat_name = $('#name').attr('value');
      var chat_send = $('#text_entry').attr('value');
      if(chat_send != '' && chat_send.length < 140){
        socket.emit('message',{ 'id': my_pony_id, 
                                'name': chat_name,
                                'text': chat_send });
        display_msg(my_pony_id,
                    sanitize(chat_name),
                    sanitize(chat_send));
      }
      $('#text_entry').attr('value',''); //clear text, and refocus
      $('#text_entry').focus();
    };
  });
});
