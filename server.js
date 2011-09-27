var io = require('socket.io').listen(4444);

//Initial variables for start of node
last_coords = {'mouseX': 133, 'mouseY': 133};
last_msg = { 'name':'derpy', 'text': 'I love muffins~'};
ip_list = [];

function sanitize(text){
  var i;
  var clean_text = '';
  var strip = '<>';
  for(i = 0; i < text.length; i++){
    var c = text.charAt(i);
    if(strip.indexOf(c) == -1) clean_text += c;
  }
  return clean_text;
}

io.sockets.on('connection', function (socket) {
 socket.emit('join', last_coords); 
 socket.emit('message', last_msg); //last message on connect 

 var address = socket.handshake.address;
 ip_list.push(address.address);
 console.log("Client IPs: " + ip_list);
 console.log(socket.id);
 
 socket.on('click', function(data) {
   last_coords = data;
   console.log(data);
   socket.broadcast.emit('click',data);
 });

 socket.on('message', function(data) {
   var clean_data = {'name':sanitize(data.name), 'text': sanitize(data.text)};
   var last_msg = clean_data;
   socket.broadcast.emit('message', clean_data);
 });
});
