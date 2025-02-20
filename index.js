const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const proxy = createProxyMiddleware({
  changeOrigin: true,
  secure: true,
  logLevel: 'silent',
  router: function(req) {
    const targetUrl = req.query.url;
    if (targetUrl) {
      const forwardedfor = req.headers['x-forwarded-for'];
      const ipregex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!forwardedfor || !ipregex.test(forwardedfor)) {
        res.end();
        return;
      }
    }
    return 'https://xivi.org';
  },
  onProxyReq: (proxyReq, req, res) => {
    const clientip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const proxyip = req.socket.localAddress;
    proxyReq.setHeader('X-Forwarded-For', clientip);
    proxyReq.setHeader('X-Proxy-Hostname', req.hostname);
    proxyReq.setHeader('X-Proxy-IP', proxyip);
    proxyReq.setHeader('X-Proxy-Contact', process.env.CONTACT || process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL || 'Contact information not available');
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end('Something went very wrong.');
  }
});

app.use('/', proxy);
const port = process.env.PORT || 8080;
app.listen(port, () => {
  if (!process.env.CONTACT) {
    console.warn('!!! Your Xivi reverse proxy is running without a contact method. Please set the CONTACT environment variable to your Discord username or email address. !!!');
    console.warn('!!! If you do not set a contact method, your proxy may be blocked without warning. !!!');
  } else {
    console.log(`Contact is set to: ${process.env.CONTACT}`);
  }
  console.log(`Xivi reverse proxy is running on port ${port} (started at ${new Date().toISOString()})`);
});