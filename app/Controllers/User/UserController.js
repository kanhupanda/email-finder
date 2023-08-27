const axios = require("axios");
const requestIp = require("request-ip");
const { JWT_SECRECT } = require("./constants");
const dbServerUrl = "https://email-finder-db.onrender.com";
// const dbServerUrl = "http://localhost:8912";
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { body } = req;
    let name = body.name || "";
    let email = body.email || "";
    let password = body.password || "";
    let role = body.role || "";
    let userAccess = body.userAccess || "";
    let ipList = body.ipList || [];
    let id = Math.floor(100000000 + Math.random() * 900000000).toString();

    let configOne = {
      method: "get",
      maxBodyLength: Infinity,
      url: dbServerUrl + "/jsonServer/users?email=" + email,
      headers: {},
    };
    let validateEmail = await axios.request(configOne);
    if (validateEmail.data.length > 0) {
      return res
        .status(200)
        .json({ message: "Email already exist", status: false });
    }   

    let data = JSON.stringify({
      id: id,
      name: name,
      email: email,
      password: password,
      role: role,
      userAccess:userAccess,
      ipList: ipList,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: dbServerUrl + "/jsonServer/users",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    let response = await axios.request(config);
    let user = req.session.user;
    req.session.user = user;
    req.session.save(function (err) {});
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Internal server error", status: false, error: error });
  }
  return res.status(200).json({ message: "User created", status: true });
};
exports.update = async (req, res) => {
  try {
    const { body } = req;
    let id = body.id || "";
    let name = body.name || "";
    let email = body.email || "";
    let password = body.password || "";
    let role = body.role || "";
    let userAccess = body.userAccess || "";
    let ipList = body.ipList || [];

    let configOne = {
      method: "get",
      maxBodyLength: Infinity,
      url: dbServerUrl + "/jsonServer/users?email=" + email,
      headers: {},
    };
    let validateEmail = await axios.request(configOne);
    if (validateEmail.data.length > 0) {
      if (validateEmail.data[0]["id"] != id)
        return res
          .status(200)
          .json({ message: "Email already exist", status: false });
    }

    let data = JSON.stringify({
      id: id,
      name: name,
      email: email,
      password: password,
      role: role,
      ipList: ipList,
      userAccess:userAccess,
      superAdmin: email == "admin@hcl.com",
    });

    let config = {
      method: "PUT",
      maxBodyLength: Infinity,
      url: dbServerUrl + "/jsonServer/users/" + id,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    let response = await axios.request(config);
    let user = req.session.user;
    req.session.user = user;
    req.session.save(function (err) {});
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Internal server error", status: false, error: error });
  }
  return res.status(200).json({ message: "User updated", status: true });
};
exports.delete = async (req, res) => {
  try {
    let id = req.params.id;
    if (id.toString() == "263576254") {
      return res
        .status(200)
        .json({ message: "Admin user can't be deleted", status: false });
    }
    let config = {
      method: "DELETE",
      maxBodyLength: Infinity,
      url: dbServerUrl + "/jsonServer/users/" + id,
      headers: {
        "Content-Type": "application/json",
      },
    };
    let response = await axios.request(config);
    let user = req.session.user;
    req.session.user = user;
    req.session.save(function (err) {});
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Internal server error", status: false, error: error });
  }
  return res.status(200).json({ message: "User deleted", status: true });
};
exports.login = async (req, res) => {
  const { body } = req;
  let email = body.email || "";
  let password = body.password || "";
  var clientIp = requestIp.getClientIp(req).replace("::ffff:", "");
  console.log(clientIp);

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: dbServerUrl + "/jsonServer/users?email=" + email,
    headers: {},
  };

  try {
    let response = await axios.request(config);
    let data = response.data;
    if (data && data.length > 0) {
      let user = data[0];
      if (user["password"] == password) {
        delete user["password"];
        if (user["role"] == "Admin") {
          const token = createToken(user);
          req.session.user = user;
          req.session.save(function (err) {});
          return res
            .status(200)
            .json({ data: user, token: token, message: "" });
        } else {
          let userIPList = user["ipList"] || [];
          if (userIPList.indexOf(clientIp) > -1) {
            req.session.user = user;
            req.session.save(function (err) {});
            return res.status(200).json({ data: user, token: "", message: "" });
          } else {
            return res.status(401).json({ message: "IP Blocked", data: null });
          }
        }
      } else {
        return res
          .status(401)
          .json({ message: "Incorrect password", data: null });
      }
    } else {
      return res.status(401).json({ message: "Email not found", data: null });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Internal server error", data: null, error: error });
  }
};

const createToken = (user) => {
  const token = jwt.sign(
    {
      ...user,
      createdOn: new Date().toISOString(),
    },
    JWT_SECRECT,
    {
      expiresIn: 60 * 60 * 24,
    }
  );
  return token;
};

exports.getUser = async (req, res) => {
  let id = req.params.id;
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: dbServerUrl + "/jsonServer/users?id=" + id,
    headers: {},
  };
  let response = await axios.request(config);
  return res
    .status(200)
    .json({
      data: response.data.length > 0 ? response.data[0] : null,
      message: "",
    });
};
exports.listAllUser = async (req, res) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: dbServerUrl + "/jsonServer/users",
    headers: {},
  };

  try {
    let response = await axios.request(config);
    let users = [];
    response.data.forEach((element) => {
      let user = element;
      delete user["password"];
      users.push(user);
    });
    return res.status(200).json({ data: users, message: "" });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Internal server error", data: null, error: error });
  }
};
