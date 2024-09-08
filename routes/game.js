const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
});

router.get('/play/1vs1', function(req, res, next) {
  res.render('one-vs-one', { title: 'wierdest' });
});

router.get('/lobby', function(req, res, next) {
  res.render('lobby', { title: 'Game Lobby' });
});

module.exports = router;
