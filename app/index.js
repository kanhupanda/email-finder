const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const requestIp = require("request-ip");

var app = express();
app.enable("trust proxy");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const oneDay = 1000 * 60 * 60 * 24;

app.use(
  sessions({
    secret: "ucFSWZzNYJWjmnriZw9lVJdkkjIJL7",
    saveUninitialized: true,
    cookie: { maxAge: oneDay, httpOnly: false, sameSite: "strict" },
    resave: false,
    proxy: true,
  })
);
app.use(cookieParser());
const EmailScrapRoutes = require("./Controllers/EmailScrap/routes");
const UserRoutes = require("./Controllers/User/routes");
app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);
app.use(express.static(__dirname + "/public"));

app.use("/api", EmailScrapRoutes);
app.use("/api", UserRoutes);

app.get("/", function (req, res) {
  var session = req.session;
  console.log(req.session);
  if (session.user) {
    return res.redirect("/dashboard");
  }
  return res.render("login.html");
});

app.get("/dashboard", function (req, res) {
  var session = req.session;
  let sessionData = session.user || {};
  if (sessionData.role == "Admin") {
    return res.render("dashboard.html");
  } else if (sessionData.role == "User") {
    var clientIp = requestIp.getClientIp(req).replace("::ffff:", "");
    let userIPList = sessionData.ipList || [];
    if (userIPList.indexOf(clientIp) > -1) {
      return res.redirect("/searchemail");
    }
  }
  req.session.destroy();
  return res.redirect("/");
});
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
app.get("/adduser", function (req, res) {
  var session = req.session;
  let sessionData = session.user || {};
  if (sessionData.role == "Admin") {
    return res.render("adduser.html");
  }
  req.session.destroy();
  return res.redirect("/");
});
app.get("/searchemail", function (req, res) {
  var session = req.session;
  let sessionData = session.user;
  if (sessionData) {
    if (sessionData.role == "Admin") {
      return res.render("searchemail.html");
    }
    if (sessionData.role == "User") {
      if (sessionData.userAccess == "Both") {
        return res.render("searchemail.html");
      }
      if (sessionData.userAccess == "PageSearch") {
        return res.render("pagesearch.html");
      }
      if (sessionData.userAccess == "WebSearch") {
        return res.render("websearch.html");
      }
    }
  }
  req.session.destroy();
  return res.redirect("/");
});
app.get("/edituser", function (req, res) {
  var session = req.session;
  let sessionData = session.user || {};
  if (sessionData.role == "Admin") {
    return res.render("edituser.html");
  }
  req.session.destroy();
  return res.redirect("/");
});
app.get("/users", function (req, res) {
  var session = req.session;
  let sessionData = session.user || {};
  if (sessionData.role == "Admin") {
    return res.render("userlist.html");
  }
  req.session.destroy();
  return res.redirect("/");
});
// start server
const port = process.env.PORT || 8090;
app.listen(port, () => console.log(`Server started at port : ${port}`));
