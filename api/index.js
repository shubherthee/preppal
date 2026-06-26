// Serverless entrypoint for Vercel deployment with diagnostic error catching
let app;
let loadError = null;

try {
  app = require('../backend/server.js');
} catch (err) {
  loadError = err;
}

module.exports = (req, res) => {
  if (loadError) {
    return res.status(500).json({
      error: 'Failed to load backend during startup',
      message: loadError.message,
      stack: loadError.stack
    });
  }
  return app(req, res);
};
