var cookie = require('cookie');
var cookieConfig = require('../../common/cookieConfig');
var errorCodes = require('../../common/errorCodes');

function setupMiddlewares(io) {
  // Cookies parsing middleware that stores the cookies found
  // in the request as a property of the socket object.
  io.use(function(socket, next) {
    var cookieHeader = socket.request.headers.cookie;

    // If header is not empty, parse it using the cookie library
    if (cookieHeader) {
      socket.cookies = cookie.parse(cookieHeader);
    }

    next();
  });

  // Authentication middleware that checks for the presence of
  // the `user` cookie in the request. If it's not found, an error is raised.
  // If found, the user is assigned as a property of the socket object.
  io.use(function(socket, next) {
    if (!socket.cookies[cookieConfig.name]) {
      return next(new Error(errorCodes.AUTHENTICATION_ERROR));
    }

    socket._user = socket.cookies[cookieConfig.name];
    next();
  });
}

module.exports = setupMiddlewares;
