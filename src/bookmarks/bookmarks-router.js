'use strict';
const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const { bookmarks } = require('../store');
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: bookmark.title,
  url: bookmark.url,
  description: bookmark.description,
  rating: Number(bookmark.rating),
})

bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark))
      })
      .catch(next)
  })
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body;

    if (!title) {
      logger.error('Title is required');
      return res
        .status(400)
        .send('Invalid data');
    }

    if (!url) {
      logger.error('URL is required');
      return res
        .status(400)
        .send('Invalid data');
    }
        
    if (!description) {
      logger.error('Description is required');
      return res
        .status(400)
        .send('Invalid data');
    }

    if (!rating) {
      logger.error('Rating is required');
      return res
        .status(400)
        .send('Invalid data');
    }

    if (isNaN(parseInt(rating))) {
      logger.error('Rating must be a number');
      return res
        .status(400)
        .send('Invalid data');
    }

    const id = uuid();

    const bookmark = {
      id,
      title,
      url,
      description,
      rating: parseInt(rating)
    };

    bookmarks.push(bookmark);

    logger.info(`Bookmark with id ${id} created`);

    res
      .status(201)
      .location(`http://localhost:8000/card/${id}`)
      .json(bookmarks);
  });

bookmarksRouter
  .route('/bookmarks/:id', (req, res) => {
    const { id } = req.params;

    const bookmark = bookmarks.findIndex(b => b.id == id);

    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found`);
      return res
        .status(404)
        .send('Bookmark not found');
    }
    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;

    const bookmarkIndex = bookmarks.findIndex(b => b.id == id);

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found`);
      res
        .status(404)
        .send('Bookmark not found');
    }

    bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${id} deleted`);
    res
      .status(204)
      .end();
  });

module.exports = bookmarksRouter;