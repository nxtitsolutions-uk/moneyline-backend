// validators/authValidator.js
const { body } = require('express-validator');

const ALLOWED_ROLES = ['user', 'admin'];             // adjust to your schema
const ALLOWED_PLATFORMS = ['android', 'ios', 'web']; // adjust if needed
const PASSWORD_MIN = 8;

const emailRule = body('email')
  .trim()
  .notEmpty().withMessage('email is required')
  .isEmail().withMessage('email must be a valid email');

exports.signup = [
  emailRule,
  body('password')
    .optional({ nullable: true })
    .isLength({ min: PASSWORD_MIN })
    .withMessage(`password must be at least ${PASSWORD_MIN} characters`),
  body('confirmPassword')
    .custom((v, { req }) => {
      const hasPass = !!req.body.password;
      if (!hasPass && !v) return true; // OTP-only flow
      if (!hasPass && v) throw new Error('confirmPassword provided but password is missing');
      if (hasPass && !v) throw new Error('confirmPassword is required');
      if (req.body.password !== v) throw new Error('password and confirmPassword must match');
      return true;
    }),
  body('role')
    .optional({ checkFalsy: true })
    .isIn(ALLOWED_ROLES).withMessage(`role must be one of: ${ALLOWED_ROLES.join(', ')}`),
  body('referralToken')
    .optional({ checkFalsy: true })
    .isString().withMessage('referralToken must be a string'),
  body('deviceToken')
    .optional({ checkFalsy: true })
    .isString().withMessage('deviceToken must be a string'),
];

exports.verifyOtpForSignup = [
  emailRule,
  body('otp')
    .trim()
    .notEmpty().withMessage('otp is required')
    .isLength({ min: 4, max: 8 }).withMessage('otp must be 4–8 characters'),
  body('referralToken')
    .optional({ checkFalsy: true })
    .isString().withMessage('referralToken must be a string'),
];

exports.createPassword = [
  emailRule,
  body('newPassword')
    .notEmpty().withMessage('newPassword is required')
    .isLength({ min: PASSWORD_MIN })
    .withMessage(`newPassword must be at least ${PASSWORD_MIN} characters`),
];

exports.resendSignupOtp = [emailRule];

exports.signin = [
  emailRule,
  body('password')
    .notEmpty().withMessage('password is required')
    .isLength({ min: PASSWORD_MIN })
    .withMessage(`password must be at least ${PASSWORD_MIN} characters`),
  body('deviceToken')
    .optional({ checkFalsy: true })
    .isString().withMessage('deviceToken must be a string'),
];

exports.forgotPassword = [emailRule];

exports.verifyOtpForForgotPassword = [
  emailRule,
  body('otp')
    .trim()
    .notEmpty().withMessage('otp is required')
    .isLength({ min: 4, max: 8 }).withMessage('otp must be 4–8 characters'),
];

exports.resetPassword = [
  emailRule,
  body('newPassword')
    .notEmpty().withMessage('newPassword is required')
    .isLength({ min: PASSWORD_MIN })
    .withMessage(`newPassword must be at least ${PASSWORD_MIN} characters`),
];

exports.refreshToken = [
  body('refreshToken')
    .notEmpty().withMessage('refreshToken is required')
    .isString().withMessage('refreshToken must be a string'),
];

exports.logout = [
  body('refreshToken')
    .notEmpty().withMessage('refreshToken is required')
    .isString().withMessage('refreshToken must be a string'),
];

exports.socialLogin = [
  body('provider')
    .notEmpty().withMessage('provider is required')
    .isIn(['google', 'apple']).withMessage('provider must be one of: google, apple'),
  body('token')
    .notEmpty().withMessage('token is required')
    .isString().withMessage('token must be a string'),
  body('platform')
    .optional({ checkFalsy: true })
    .isIn(ALLOWED_PLATFORMS).withMessage(`platform must be one of: ${ALLOWED_PLATFORMS.join(', ')}`),
  body('role')
    .optional({ checkFalsy: true })
    .isIn(ALLOWED_ROLES).withMessage(`role must be one of: ${ALLOWED_ROLES.join(', ')}`),
  body('deviceToken')
    .optional({ checkFalsy: true })
    .isString().withMessage('deviceToken must be a string'),
];

exports.requestDeleteAccountOtp = [emailRule];

exports.verifyDeleteAccountOtp = [
  emailRule,
  body('otp')
    .trim()
    .notEmpty().withMessage('otp is required')
    .isLength({ min: 4, max: 8 }).withMessage('otp must be 4–8 characters'),
];
