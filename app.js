const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const { WebSocketServer } = require('ws');
const uuid = require('uuid');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', function(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function(ws) {
    const userId = uuid.v4();
    ws.userId = userId; // Attach userId to the WebSocket connection

    console.log('User connected with ID ', userId);

    wss.emit('connection', ws, request);
  });
});

wss.on('connection', function(ws) {

  ws.send(JSON.stringify({ type: 'init', userId: ws.userId }));
  ws.on('message', function(message) {
    console.log(`Received message ${message} from user ${ws.userId}`);
  });

  ws.on('close', function() {
    console.log(`User ${ws.userId} disconnected`);
  });
});

// Start the server
server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on http://localhost:${server.address().port}`);
});

module.exports = app;
