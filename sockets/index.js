var socketIo = require('socket.io');

var currentPosition = 0;

function init(server) {
  var io = socketIo(server);

  io.on('connection', function(socket) {
    console.log('New connection received');

    socket.on('login', function(user) {
      console.log('User *' + user + '* connected');
      socket.emit('loginSuccess', { position: currentPosition });
    });

    socket.on('updatePosition', function(position) {
      console.log('Position updated to *' + position + '*');
      currentPosition = position;
      socket.broadcast.emit('positionUpdate', { position: position });
    });

    socket.on('disconnect', function() {
      console.log('User disconnected');
    });
  });
}

module.exports = init;
