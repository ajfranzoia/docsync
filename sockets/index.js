var socketIo = require('socket.io');

// Stores last updated scroll position from clients
var currentPosition = 0;

// Stores connected users
var users = {};

/**
 * Initialize sockets app
 * @param  {Server} server
 * @return undefined
 */
function init(server) {
  var io = socketIo(server);

  io.on('connection', function(socket) {
    console.log('New connection received');

    // Login event from a new user session
    socket.on('login', function(user) {
      // Inform connected client of succesful login, and give current reading position
      // and a list of the names of the connected users
      socket.emit('loginSuccess', {
        position: currentPosition,
        users: getUsers()
      });

      // Inform other clients of the user connection
      socket.broadcast.emit('userConnected', user);

      // Add user to the lists of connected users
      users[socket.id] = user;

      console.log('User *' + user + '* connected');
    });

    // Update scroll position event from a client
    socket.on('updatePosition', function(position) {
      if (position === currentPosition) {
        return;
      }

      // Store updated position
      currentPosition = position;

      // Inform other clients of position update
      socket.broadcast.emit('positionUpdated', position);

      console.log('Position updated to *' + position + '* by user *' + users[socket.id] + '*');
    });

    // Logout event from an user. Treat as a user disconnection.
    socket.on('logout', disconnectUser.bind(null, socket));

    // Disconnect event from a client
    socket.on('disconnect', function() {x
      if (users[socket.id]) {
        disconnectUser(socket);
        return;
      }

      console.log('Anonymous user disconnected');
    });
  });
}


function disconnectUser(socket) {
  var user = users[socket.id];

  // Inform other clients of disconnection
  socket.broadcast.emit('userDisconnected', user);

  // Remove user from the lists of connected users
  delete users[socket.id];

  console.log('User *' + user + '* disconnected');
}

/**
 * Returns an array with the current logged in users
 * @return {array}
 */
function getUsers() {
  return Object.keys(users).map(function(id) {
    return users[id];
  });
}

module.exports = init;

