# DocSync

Tech challenge for [Mural](https://mural.co)


## Description

DocSync is a very simple real-time web app that allows users to read a document in a synchronized way. This means that any time an user scrolls up or down the document, the rest of the users will have their documents scrolled to that same position as well. The app includes a simple username authentication step, and shows a lists of the current users reading the document.

## Basic structure

The application has been separated in backend, frontend and common folders. Backend is built with Express.js and Socket.IO. Frontend is built with React and Webpack. Then common dir includes data that is reused by both sides (e.g. events constants).

## Installation and development

### For development (gulp + webpack)

```bash
# Clone project
git clone https://github.com/ajfranzoia/docsync

# Run backend server in dev mode
cd backend && gulp develop

# Run frontend app in dev mode
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


## Architecture decisions

I decided to use Express.js for the backend. I initialized the app by using a Yeoman generator that gave me the starting boilerplate in almost no time. The generator is available at https://github.com/petecoop/generator-express and provides a ready-to-use app. Altough I prefer node scripts for tasks-related stuff, the generator came with gulp. Since there were few tasks, I was ok with it. Cleaned up some boilerplate that comes with generator, like routes and templating system.

For the realtime functionality, I installed the socket.io dependency, and made a basic list of the events I was going to support:
- a user logs in
- users are notified when a user logs in
- a user scrolls in a document
- users are notified when a user scrolls in a document
- a user logs out
- users are notified when a user logs out

For the frontend part, I picked up a boostrap starter template from [Bootstrap](https://getbootstrap.com)'s site, and applied styles from the [Readable](https://bootswatch.com/readable/) Bootswatch template.

I chose React as the frontend framework, and picked up https://github.com/vasanthk/react-es6-webpack-boilerplate as the starting boilerplate. It came with Webpack (both for dev and production usage) and hot reloading. There was another nice boilerplate available at https://github.com/srn/react-webpack-boilerplate, but it includes SASS and its dependencies. Since I was going to use a few CSS styles, I decided to go for the lighter option.

I refactored the basic HTML I had created at first into the initial React components. The initial structure I designed was:

```
App
--- Login view
--- Document view
--- --- Navbar
--- --- DocReader
--- --- --- DocContent
```

With this structure, I created a basic authentication flow (without server integration): when a user logged in, the document view had to be shown; when a user clicked on logout, the login view had to be shown again.

When a user logs in, a cookie is stored in the browser, so the state is kept when user refresh.
the cookie is removed and user is logged out. At first, I controlled authentication on the backend by checking the id property of a socket, but later changed it to cookie authentication, that is a more flexible approach (e.g. in the future it could allow for a same user to have more than one tab open at a time, if server restarted session was lost, etc.). The cookie name, along with its path, can be configured in ```common/cookieConfig```, which prevents hardcoding and duplication on both sides of the app.

I added the event handling in the server. For the sake of simplicity and the purpose of this app, the current position is stored on memory.

To prevent a constant updating of the scroll position, while a user is still scrolling, added a debounce to the update function, extracted from from https://remysharp.com/2010/07/21/throttling-function-calls. After trying different delays, decided that 300ms would be an acceptable value for the user experience. Nevertheless, this value can be configured under the property ```readingDebounceDelay``` in ```frontend/app_config```.

Something tricky I found while working with the position update flow, is that when  a new position was received from the server (caused by the scroll of another user), updating the ```body.scrollTop``` property triggered another scroll event, potentially causing an endless loop. In order to prevent this I had to:
- Ignore position changed on the server if the position didn't changed.
- Add an ```isUpdating``` flag.
- Modify the debounce function to allow conditional triggering the passed function.

As a nice-to-have feature, I decided to show a list of the current logged in users. Added support for the required events in the frontend and backend.

I separated backend folders from frontend.
I also realized that the event names where duplicated in both sides, so I moved them to constants file inside a common folder, where I could reference to from backed or frontend.

Allow configuration of document by changing config.

