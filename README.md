# DocSync

Tech challenge for [Mural](https://mural.co)


## Description

DocSync is a very simple real-time web app that allows users to read a document in a synchronized way. This means that any time an user scrolls up or down the document, the rest of the users will have their documents scrolled to that same position as well. The app includes a basic username authentication step and shows a lists of the current users reading the document.

## Basic structure and frameworks used

The application has been separated in  ```backend```, ```frontend``` and ```common``` folders. The backend is built with Express.js and Socket.IO. The frontend is built with React and Webpack. The ```common``` dir includes data that is reused by both sides (e.g. events constants, user cookie config, etc.).

## Installation and setup

### For development (gulp + webpack)

```bash
# Clone project
git clone https://github.com/ajfranzoia/docsync

# Run backend server in dev mode
cd backend && gulp develop

# Run frontend app in dev mode (usually in another terminal)
cd frontend && npm start
```

### For production (provided as a Docker image)

```bash
# Clone project
git clone https://github.com/ajfranzoia/docsync

# Build docker image
docker build . -t docsync

# Run container with built image
docker run -p 3000:3000 docsync
```


## Architecture and development decisions

I decided to use Express.js for the backend. I initialized the app by using a Yeoman generator that gave me the starting boilerplate in almost no time. The generator is available at https://github.com/petecoop/generator-express and provides a ready-to-use app. Altough I prefer node scripts for tasks-related stuff, the generator came with gulp, but since there were few tasks, it was ok. I cleaned up some additional boilerplate that comes with generator, like routes and views, which I wasn't going to use.

For the realtime functionality, I installed the socket.io dependency, and made a basic list of the events I was going to support:
- a user logs in, and other users are notified
- a user scrolls in a document, and other users are notified
- a user logs out, and other users are notified

For the frontend part, I picked up a bBostrap starter template from [Bootstrap](https://getbootstrap.com)'s site, and applied styles from the [Readable](https://bootswatch.com/readable/) Bootswatch template.

I chose React as the frontend framework, and picked up https://github.com/vasanthk/react-es6-webpack-boilerplate as the starting boilerplate. It came with Webpack (both for dev and production usage) and hot reloading. There was another decent boilerplate available at https://github.com/srn/react-webpack-boilerplate, but it includes SASS and its dependencies. Since I was going to use a few CSS styles, I decided to go for the lighter option.

I refactored the basic HTML I had created at first into the initial React components. The main structure I came up with was:

```
App
--- Login view
--- Document view
--- --- Navbar
--- --- DocReader
--- --- --- DocContent
```

With this structure, I created a basic authentication flow (without server integration): when a user logged in, the document view had to be shown; when a user clicked on logout, the login view had to be shown again. If the uses refreshed the page, its state should be kept. This was achieved by the use of a cookie that is stored in the browser when the user logs in, and removed when the user decides to log out.

On the other side, for the backend authentication, I controlled it at first by inspecting the ```id``` property of a socket, but later changed it to a cookie authentication scheme, which results in a more flexible approach (e.g. in the future it could allow a same user to have more than one tab open at a time, if the server restarted the user session would not be lost, etc.). Cookie data may be accesed in the backend by inspecting the ```socket.request.headers``` property. The cookie name, along with its path, can be configured in ```common/cookieConfig```, which prevents hardcoding and duplication on both sides of the app.
In the backend, I refactored the user identification via cookie as socket.io middlewares that:
- Inspect the ```socket.request.headers.cookie``` property, and if a cookie header is found, parse it using the ```cookie``` library
- Throw an authentication error when a the user cookie is not found
- Assign the current user as a property of the socket object when identified

```javascript
// backend/sockets/middleware.js

// Cookies parsing
io.use(function(socket, next) {
  var cookieHeader = socket.request.headers.cookie;

  if (cookieHeader) {
    socket.cookies = cookie.parse(cookieHeader);
  }

  next();
});

// User identification
io.use(function(socket, next) {
  if (!socket.cookies[cookieConfig.name]) {
    return next(new Error(errorCodes.AUTHENTICATION_ERROR));
  }

  socket._user = socket.cookies[cookieConfig.name];
  next();
});
```

<br/>

For the scroll position update flow I decided to store the current position in memory for the sake of simplicity and since there would be a single instance of the app. For a more complex solution, it could be stored in a mongodb or redis database. When a user logs in, the current position is received as well.

To prevent a constant updating of the scroll position while a user is still scrolling (since the ```scroll``` event is triggered more than once), I added a debounce on top of to the listener function. This meant: if a user stops scrolling, it will wait a certain amount of time to trigger the update function; if during that time the user scrolls again, that timer is reset. I extracted the debounce code from https://remysharp.com/2010/07/21/throttling-function-calls and later modified it. After trying different delays, decided that 300ms would be an acceptable value for a good user experience. Nevertheless, this value can be configured by editing the property ```readingDebounceDelay``` in ```frontend/app_config```.

Example of usage of the debounce function:
```javascript
window.addEventListener('scroll', debounce(this.handleScroll, appConfig.readingDebounceDelay));
```

Something tricky I found while working with the position update flow, is that when  a new position was received from the server (previously caused by the scroll action of another user), updating the ```body.scrollTop``` property triggered another scroll event, potentially causing an endless loop. In order to prevent this I had to:
- Ignore the received position on the server if its value doesn't change.
- Add an ```isUpdatingPosition``` flag on the frontend ```App``` component in order to prevent triggering and update to the server:
```javascript
this.setState({
  isUpdatingPosition: true
}, () => {
  document.body.scrollTop = position;

  // Setup timeout to wait for browser to update scroll position
  // without triggering a new position update event
  setTimeout(() => {
    this.setState({
      isUpdatingPosition: false
    });
  }, 100);
});
```
- Modify the debounce function in the ```DocReader``` component to allow conditionally triggering the given function if a position update is not ongoing:
```javascript
window.addEventListener('scroll', debounce(this.handleScroll, appConfig.readingDebounceDelay, () => {
  return !this.props.isUpdatingPosition;
}));
```

<br/>

As a nice-to-have feature, I decided to add a list of the current logged in users in the app navbar. I added support for handling the current list of logged in users, both in the backend and frontend, which needs to be updated when either a user logs in or out.

Regarding the app structure, at first I had the ```frontend``` dir included in the ```backend``` dir. I decided to pull the ```frontend``` out in order to have a better separation of concerns (which also permits organize them in independent repositories). I also realized that I was duplicating data on both sides (like event names or the user cookie name), so I moved this kind of data to a root ```common``` folder, from where I could reference and make use in the backend or frontend indistinctly.

The app supports only a single document at a time. Though, a different document can be configured by saving an HTML file in ```frontend/docs``` and referencing it by editing the ```documentName``` config in ```frontend/app_config.json```.

Example:
```html
<!-- frontend/docs/new_document.html -->
<p>I am a new document for DocSync</p>
```

```javascript
// frontend/app_config.json
var config = {
  // ...
  documentName: 'new_document'
};
// ...
```

<br/>
***
<br/>


### Bonus point #1

> How would you keep versioning on the database, if we wanted to store the last read position on each document (i.e. pick we're you've left)?

In order to store the last read position on each document I would make use of any persistent storage system in the backend like MySql or MongoDB (taking into account the nature of the application -either relational or more unstructured- when deciding which one to pick).
If performance matters, I would setup an in-memory database like Redis or Memcached between the server and the persistent storage, which is faster that a only-persistent solution. The server would then look up the last position first in the in-memory storage, and if not found, consult the persistent storage for it (and consequently updating the in-memory storage with the just read value).


### Bonus point #2

> How would you run this same app on multiple servers behind a Load Balancer?

In order to run the app using multiple servers behind a Load Balancer, the requests associated with a particular session id must connect to the process that originated them, due to the nature of the handshake and upgrade protocol of WebSockets. Furthermore, some clients might be using long-polling, instead of and active bi-directional communication channel where it can be written to immediately.
To solve this problem we can resort to the use of "Sticky Sessions", where the Load Balancer is responsible for ensuring that requests that come from a certain client are always routed to the same server.

An example of enabling Sticky Sessions in Nginx lies below, which routes clients based on their originating address:

```nginx
upstream io_servers {
  ip_hash; // This instruction indicates the connections will be sticky
  server 127.0.0.1:10001;
  server 127.0.0.1:10002;
  ...
}
```

Additionaly, the server must point to this upstream and the required ```Upgrade``` headers must be passed along.

Once the routing issue is resolved, sending events to clients that may be talking to different servers requires an approach that allows broadcasting events to everyone, even if the original message came from a different node.
This can be achieved by including a messaging layer with publish/subscribe capabilities like RabbitMQ, ZeroMQ or Redis.

The following example uses Redis and the ```socket.io-redis``` adapter in order to publish and subscribe events through Redis:

```javascript
//...

const redis = require('socket.io-redis');
const io = require('socket.io')(server);

// Setup redis adapter for socket.io
io.adapter(redis({
  host: redisHost,
  port: redisPort
}));

io.on('connection', (socket) => {

  // Message will be published to all the nodes through the Redis adapter
  socket.on('message-to-all', (data) => {
    io.emit('message-to-all', data);
  });

  //...
});

```











