// validators/profileValidator.js
const { body } = require('express-validator');

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/; // letters, numbers, underscore; 3–30 chars

// helpers
const isStringArray = (arr) => Array.isArray(arr) && arr.every((x) => typeof x === 'string');
const isTeamsObject = (obj) =>
  obj &&
  typeof obj === 'object' &&
  !Array.isArray(obj) &&
  Object.values(obj).every((v) => isStringArray(v));

exports.create = [
  body('name')
    .trim()
    .notEmpty().withMessage('name is required')
    .isLength({ min: 2, max: 50 }).withMessage('name must be 2–50 characters'),
  body('username')
    .trim()
    .notEmpty().withMessage('username is required')
    .matches(USERNAME_REGEX).withMessage('username may contain letters, numbers, underscores (3–30 chars)'),
  body('profilePicture')
    .optional({ checkFalsy: true })
    .isURL().withMessage('profilePicture must be a valid URL'),
  body('favoriteSports')
    .optional({ nullable: true })
    .custom(isStringArray).withMessage('favoriteSports must be an array of strings'),
  body('favoriteTeams')
    .optional({ nullable: true })
    .custom(isTeamsObject).withMessage('favoriteTeams must be an object of string arrays (e.g. { "NBA": ["Lakers"] })'),
];

exports.update = [
  // at least one updatable field must be present
  body().custom((val, { req }) => {
    const allowed = ['name', 'username', 'profilePicture', 'favoriteSports', 'favoriteTeams'];
    const keys = Object.keys(req.body || {});
    if (!keys.some((k) => allowed.includes(k))) {
      throw new Error('Provide at least one field to update');
    }
    return true;
  }),
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('name must be 2–50 characters'),
  body('username')
    .optional({ checkFalsy: true })
    .trim()
    .matches(USERNAME_REGEX).withMessage('username may contain letters, numbers, underscores (3–30 chars)'),
  body('profilePicture')
    .optional({ checkFalsy: true })
    .isURL().withMessage('profilePicture must be a valid URL'),
  body('favoriteSports')
    .optional({ nullable: true })
    .custom(isStringArray).withMessage('favoriteSports must be an array of strings'),
  body('favoriteTeams')
    .optional({ nullable: true })
    .custom(isTeamsObject).withMessage('favoriteTeams must be an object of string arrays (e.g. { "NBA": ["Lakers"] })'),
];

// No body needed for get/delete; no validators required.
// You can still attach authentication middleware in routes.
