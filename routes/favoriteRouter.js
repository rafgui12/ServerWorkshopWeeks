const express = require('express');
const Favorite = require('../models/favorite');
const cors = require('./cors');
const authenticate = require('../authenticate');


const favoriteRouter = express.Router();

favoriteRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          req.body.forEach(campsite => {
            if (!favorite.campsites.includes(campsite._id)) {
              favorite.campsites.push(campsite._id);
            }
          });
          favorite.save()
            .then(updatedFavorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(updatedFavorite);
            })
            .catch(err => next(err));
        } else {
          const newFavorite = new Favorite({
            user: req.user._id,
            campsites: req.body.map(campsite => campsite._id)
          });
          newFavorite.save()
            .then(savedFavorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(savedFavorite);
            })
            .catch(err => next(err));
        }
      })
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favorites');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
    .then(deletedFavorite => {
        if (deletedFavorite) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(deletedFavorite);
        } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You do not have any favorites to delete.');
        }
    })
    .catch(err => next(err));

  });

favoriteRouter.route('/:campsiteId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('GET operation not supported on /favorites/:campsiteId');
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
        if (favorite.campsites.includes(req.params.campsiteId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('That campsite is already in the list of favorites!');
        } else {
            favorite.campsites.push(req.params.campsiteId);
            favorite.save()
            .then(updatedFavorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(updatedFavorite);
            })
            .catch(err => next(err));
        }
        } else {
        const newFavorite = new Favorite({
            user: req.user._id,
            campsites: [req.params.campsiteId]
        });
        newFavorite.save()
            .then(savedFavorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(savedFavorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favorites/:campsiteId');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
        const campsiteIndex = favorite.campsites.indexOf(req.params.campsiteId);
        if (campsiteIndex !== -1) {
            favorite.campsites.splice(campsiteIndex, 1);
            favorite.save()
            .then(updatedFavorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(updatedFavorite);
            })
            .catch(err => next(err));
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('That campsite is not in the list of favorites!');
        }
        } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You do not have any favorites to delete.');
        }
    })
    .catch(err => next(err));

  });

module.exports = favoriteRouter;