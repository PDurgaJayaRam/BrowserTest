/**
 * Alibaba Cloud Function Compute Entry Point
 * This is the main handler for serverless deployment
 */

const { handler } = require('./index');

// For FC local debugging
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-undef
  module.exports = { handler };
}

module.exports = { handler };