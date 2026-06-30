const { createProxyMiddleware } = require('http-proxy-middleware');

const API_BASE_URL = (process.env.API_BASE_URL || 'https://my-vmsapi-9.onrender.com').replace(/\/$/, '');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: API_BASE_URL,
      changeOrigin: true,
    })
  );
};
