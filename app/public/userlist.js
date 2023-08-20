let userid = "";
$(document).ready(function () {
  loadLoggedUserName();
  setTimeout(() => {
    loadUserData();
  }, 1000);
});
let uerrList = [];

function loadUserData() {
  var myHeaders = new Headers();
  let token = localStorage.getItem("token") || "";
  myHeaders.append("authorization", token);

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  let htmlTable = "";
  $("#tableBody").html("");

  fetch("/api/users", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      let data = result["data"] || [];
      data.forEach((element, i) => {
        uerrList.push(element);
        htmlTable =
          htmlTable +
          `<tr>
                <td>${element["name"]}</td>
                <td>${element["email"]}</td>
                <td>${element["role"]}</td>
                <td>${
                  element["ipList"]
                    ? element["ipList"].length == 0
                      ? ""
                      : element["ipList"][0] +
                        ` <i onclick="showIpListModal(${i})" style="cursor: pointer;" class="fa-solid fa-circle-info"></i>`
                    : ""
                }</td>
                <td>
                  <a class="link-offset-2 link-underline link-underline-opacity-0 " href="/edituser?userid=${
                    element["id"]
                  }">
                    <button type="button" class="btn btn-primary btn-sm">Edit</button>
                  </a>
                 ${
                   element["superAdmin"] || element["id"] == userid
                     ? ""
                     : ` <button type="button" class="btn btn-danger btn-sm  " onclick="deleteUser('${element["id"]}')">Delete</button>`
                 }
                </td>
              </tr>`;
      });
      if (data.length == 0) {
        $("#tableBody").html(` <tr>
                <th style="text-align: center;" colspan="6">Loading...</th>
              </tr>`);
      } else {
        $("#tableBody").html(htmlTable);
      }
    })
    .catch((error) => console.log("error", error));
}

function deleteUser(userid) {
  let stat = confirm("Are you sure? Confirm first.");
  if (!stat) {
    return;
  }
  var myHeaders = new Headers();
  let token = localStorage.getItem("token") || "";
  myHeaders.append("authorization", token);
  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch("/api/user/delete/" + userid, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      loadUserData();
    })
    .catch((error) => console.log("error", error));
}
function loadLoggedUserName() {
  try {
    let userdaata = localStorage.getItem("userData") || "{}";
    let jsonData = JSON.parse(userdaata);
    userid = jsonData["id"];
    $("#loggedUserName").html(jsonData["name"]);
  } catch (error) {}
}

function showIpListModal(index) {
  let list = uerrList[index]["ipList"];
  $("#modalBody").html("");
  list.forEach((element, i) => {
    $("#modalBody").append(`<p>${i + 1}. ${element}</p>`);
  });
  $("#ipModalList").modal("show");
}
function hideModal() {
  $("#ipModalList").modal("hide");
}
