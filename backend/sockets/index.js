var socketIo = require('socket.io');
var events = require('../../common/events');
var setupMiddlewares = require('./middleware');

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

  setupMiddlewares(io);

  io.on('connection', function(socket) {
    console.log('New connection received');


    // Login event from a new user session
    socket.on(events.USER_LOGIN, function(user) {
      // Inform connected client of succesful login, and give current reading position
      // and a list of the names of the connected users
      socket.emit(events.USER_LOGIN_SUCCESS, {
        position: currentPosition,
        users: getUsers(user)
      });

      if (users[user]) {
        users[user] += 1;
        return;
      }

      // Inform other clients of the user connection
      socket.broadcast.emit(events.USER_CONNECTED, user);

      // Add user to the lists of connected users
      users[user] = 1;

      console.log('User *' + user + '* connected');
    });


    // Update scroll position event from a client
    socket.on(events.POSITION_UPDATE, function(position) {
      if (position === currentPosition) {
        return;
      }

      // Store updated position
      currentPosition = position;

      // Inform other clients of position update
      socket.broadcast.emit(events.POSITION_UPDATED, position);

      console.log('Position updated to *' + position + '* by user *' + socket._user + '*');
    });


    // Logout event from an user. Treat as a user disconnection.
    socket.on(events.USER_LOGOUT, disconnectUser.bind(null, socket));


    // Disconnect event from a client
    socket.on('disconnect', function() {
      if (socket._user && users[socket._user]) {
        disconnectUser(socket);
      }
    });
  });
}


function disconnectUser(socket) {
  var user = socket._user;

  // Inform other clients of disconnection
  socket.broadcast.emit(events.USER_DISCONNECTED, user);

  // Remove user from the lists of connected users if no connections exist
  users[user] -= 1;
  if (!users[user]) {
    delete users[user];
  }

  console.log('User *' + user + '* disconnected');
}

/**
 * Returns an array with the current logged in users
 * @return {array}
 */
function getUsers(filter) {
  return Object.keys(users).filter(user => user !== filter);
}

module.exports = init;

