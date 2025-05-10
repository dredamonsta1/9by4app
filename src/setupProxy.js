const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://ninebyfourapi.herokuapp.com/api/users",
      changeOrigin: true,
    })
  );
};
