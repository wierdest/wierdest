const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
});

router.get('/play', function(req, res, next) {
  res.render('game', { title: 'wierdest' });
});

router.get('/lobby', function(req, res, next) {
  res.render('lobby', { title: 'Game Lobby' });
});

module.exports = router;
