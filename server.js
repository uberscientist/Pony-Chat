var request = require('request');
var io = require('socket.io').listen(4444);
pony_array = []

function sanitize(text){
  var i;
  var clean_text = '';
  var strip = '<>';
  for(i = 0; i < text.length; i++){
    var c = text.charAt(i);
    if(strip.indexOf(c) == -1) clean_text += c;
    if(strip.indexOf(c) == 0) clean_text += '&lt;';
    if(strip.indexOf(c) == 1) clean_text += '&gt;';
  }
  return clean_text;
}


io.sockets.on('connection', function(socket) {
 pony_array.push(socket.id);
 rand_start = Math.round(Math.random()*444)+50;

 socket.emit('my_join', { 'id': socket.id,
                          'list': pony_array, 
                          'mouseX': rand_start,
                          'mouseY': rand_start });

 socket.broadcast.emit('join', { 'id': socket.id, 
                                 'mouseX': rand_start,
                                 'mouseY': rand_start });

 socket.on('disconnect', function() {
   index = pony_array.indexOf(socket.id);
   if(index != -1) pony_array.splice(index, 1);
   socket.broadcast.emit('leave', {'id':socket.id})
 });

/* var address = socket.handshake.address;
 console.log("Client IP: " + address.address);
*/ 
 socket.on('click', function(data) {
   last_coords = data;
   socket.broadcast.emit('click',data);
 });

 socket.on('message', function(data) {
   var clean_data = { 'id': data.id, 'name': sanitize(data.name),
                      'text': sanitize(data.text)};
   var last_msg = clean_data;
   socket.broadcast.emit('message', clean_data);
 });
});
