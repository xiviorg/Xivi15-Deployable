const express = require('express');
const cors = require("cors");
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const proxy = createProxyMiddleware({
  changeOrigin: true,
  secure: true,
  logLevel: 'debug',
  router: function(req) {
    const targetUrl = req.query.url; 
    if (targetUrl) {
      return targetUrl; 
    }
    return 'https://xivi.org'; 
  },
  onProxyReq: (proxyReq, req, res) => {
    
    proxyReq.setHeader('X-Forwarded-For', ''); 
    proxyReq.setHeader('X-Real-IP', '');
    proxyReq.setHeader('Via', '');
  }
});

app.use('/', proxy);
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Xivi 15 is running on port ${port}`);
});
