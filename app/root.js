const express = require('express');
const jsonServer = require('json-server');
const app = express();
const port = 8912;

const router = jsonServer.router('./json_server/db.json');
const middlewares = jsonServer.defaults();

// Load custom routes
const customRoutes = require('./json_server/routes.json');

// Custom middleware to handle complex routes with query parameters
app.use((req, res, next) => {
  for (const route in customRoutes) {
    const target = customRoutes[route];
    if (req.path.startsWith(route)) {
      // Replace the route part
      const modifiedPath = req.path.replace(route, target);
      
      // If the route contains an email query parameter, add it back
      if (req.query.email) {
        modifiedPath += `?email=${req.query.email}`;
      }
      
      req.url = modifiedPath;
      break;
    }
  }
  next();
});

app.use(middlewares);
app.use(router);

app.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});