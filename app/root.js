const jsonServer = require("json-server"); // importing json-server library
const server = jsonServer.create();
const router = jsonServer.router("/app/json_server/db.json");
const middlewares = jsonServer.defaults();

// Load custom routes from routes.json
const customRoutes = require('./json_server/routes.json');

// Set up custom routes
router.db.setState(customRoutes);

const port = process.env.PORT || 8912; // you can use any port number here; i chose to use 3001

server.use(middlewares);
server.use(router);

server.listen(port);