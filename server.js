var io = require('socket.io').listen(4444);
ip_array = [];
pony_array = [];

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

function index_count(array, item){
  var count = 0;
  for(i=0; i < array.length; i++){
    if(array[i] == item) count++;
  }
  return count
}

io.sockets.on('connection', function(socket) {
 var address = socket.handshake.address.address;
 ip_array.push(address);
 ip_count = index_count(ip_array,address);

//no more than 3 ponies per IP address
 if(ip_count <= 3){
   console.log('  IP:' + address + ' connected '+ ip_count + ' times');
   pony_array.push(socket.id);
   rand_start = Math.round(Math.random()*444)+50;

   socket.emit('my_join', { 'id': socket.id,
                            'list': pony_array, 
                            'mouseX': rand_start,
                            'mouseY': rand_start });

   socket.broadcast.emit('join', { 'id': socket.id, 
                                   'mouseX': rand_start,
                                   'mouseY': rand_start,
                                   'name': 'Anonymous' });
 } else {
   console.log('  IP:' + address + ' connected '+ ip_count + ' times');
   socket.emit('my_join', { 'id': socket.id,
                            'list': pony_array, 
                            'mouseX': rand_start,
                            'mouseY': rand_start });
 }

 socket.on('disconnect', function() {
   var ip_index = ip_array.indexOf(address);
   if(ip_index != -1) ip_array.splice(ip_index, 1);

   var index = pony_array.indexOf(socket.id);
   if(index != -1) pony_array.splice(index, 1);

   socket.broadcast.emit('leave', {'id':socket.id})
 });
 
 socket.on('change_sprite', function(data) {
   socket.broadcast.emit('change_sprite', data)
 });

 socket.on('click', function(data) {
   if(data.mouseX < 990 && data.mouseY < 550){
     socket.broadcast.emit('click', data);
   }
 });

 socket.on('message', function(data) {
   if(data.text != '' && data.text.length < 140){
     var clean_data = { 'id': data.id,
                        'name': sanitize(data.name),
                        'text': sanitize(data.text)};
     socket.broadcast.emit('message', clean_data);
   }
 });
});
