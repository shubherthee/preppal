// Simplified auth: the frontend sends the logged-in user's id in the
// `x-user-id` header (stored client-side after login). This is NOT secure
// for production — swap this out for real session/JWT auth later.

module.exports = function attachUser(req, res, next) {
  const userId = parseInt(req.headers['x-user-id'], 10);
  req.userId = Number.isInteger(userId) ? userId : 1; // default to seed user 1
  next();
};
