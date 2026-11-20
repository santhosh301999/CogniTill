// Catalyst Advanced I/O entry point. Serves the compiled Express app from
// backend/ (built into ./dist by `npm run build:catalyst` in backend/).
// Requests arrive at https://<project-domain>/server/cognitill_api/<path>.
module.exports = require('./dist/index.js').default;
