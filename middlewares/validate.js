// middlewares/validate.js
const { validationResult } = require('express-validator');

module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = {};
  for (const e of errors.array({ onlyFirstError: true })) {
    details[e.path] = e.msg;
  }

  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    details,
  });
};
