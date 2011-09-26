var io = require('socket.io').listen(4444);

//Initial variables for start of node
last_coords = {'mouseX': 133, 'mouseY': 133}
last_msg = { 'name':'derpy', 'text': 'I love muffins~'}
ip_list = []

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
   last_msg = data;
   console.log(data);
   socket.broadcast.emit('message',data);
 });
});
