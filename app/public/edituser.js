let userid = "";
$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  userid = urlParams.get('userid');
  loadUser(userid)
  loadLoggedUserName();
});
function loadUser(userid) {
  var myHeaders = new Headers();
  let token = localStorage.getItem("token") || "";
  myHeaders.append("authorization", token);
  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch("/api/users/" + userid, requestOptions)
    .then(response => response.json())
    .then(result => {
      if (result["data"]) {
        $("#name").val(result["data"]["name"]); 
        $("#useremail").val(result["data"]["email"]);
        $("#userpassword").val(result["data"]["password"]);
        $("#userRole").val(result["data"]["role"]); 
        $('input[name="userAccess"]').val([result["data"]["userAccess"]||""]);
        if (result["data"]["role"] == "User") {
          $("#ipAddressList").show();
          $("#userAccessSection").show();
        }
        
        let ipList = result["data"]["ipList"] || [];
        for (let i = 0; i < ipList.length; i++) {
          const element = ipList[i];
          let html = '<label for="userIP" class="form-label">IP Address</label>';
          if (i == ipList.length-1) {
            html = `<div class="input-group  mt-1" style="justify-content: center;align-items: center;">
            <input type="text" class="form-control" value="${element}" name="userIP[]" id="userIP"
                style="margin-right: 5px;" />
            <div class="input-group-append ml-2">
                <button type="button" onclick="addinput()" class="input-group-text"
                    style="padding: 0.6rem .75rem;"><i class="fa-solid fa-plus"></i></button>
            </div>
        </div>`
          } else {
            let id = "inputField" + Math.floor(1000 + Math.random() * 10000).toString();
            html = `<div class="input-group mt-1" id="${id}" style="justify-content: center;align-items: center;">
                <input type="text" class="form-control" value="${element}" name="userIP[]" id="userIP"
                    style="margin-right: 5px;" />
                <div class="input-group-append ml-2">
                    <button type="button" onclick="deleteInput('${id}')" class="input-group-text" 
                    style="padding: 0.6rem .75rem;"><i
                            class="fa-solid fa-trash"></i></button>
                </div>
              </div>`;
          }

          $("#ipAddressList").append(html);
        }


      }
    })
    .catch(error => console.log('error', error));
}
function onSelectChange() {
  let role = $("#userRole").val();
  if (role == "Admin") {
    $("#ipAddressList").hide();
    $("#userAccessSection").hide();
  } else {
    $("#ipAddressList").show();
    $("#userAccessSection").show();
  }
}

function update() {
  var ipList = $('input[name="userIP[]"]').map(function () {
    return this.value;
  }).get();
  let userAccess="";
  let name = $("#name").val(); 
  let useremail = $("#useremail").val();
  let userpassword = $("#userpassword").val();
  let userRole = $("#userRole").val();
  if (name == "") {
    return alert("Name is required");
  } 
  if (useremail == "") {
    return alert("Email is required");
  }
  if (!useremail.endsWith("@hcl.com")) {
    return alert("Invalid email");
  }
  if (userpassword == "") {
    return alert("Password is required");
  }

  if (userRole == "User") {
    if (ipList.length == 0) {
      return alert("IP is required")
    }
    for (let i = 0; i < ipList.length; i++) {
      const element = ipList[i];
      if (element == "") {
        return alert("IP is required");
      } else if (!isValidIpv4Addr(element)) {
        return alert("Invalid IP");
      }
    }
    userAccess = $('input[name="userAccess"]:checked').val();
    if(!userAccess){
      return alert("Select user access type");
    }
  } else {
    ipList = [];
  }

  var myHeaders = new Headers();
  let token = localStorage.getItem("token") || "";
  myHeaders.append("authorization", token);
  myHeaders.append("Content-Type", "application/json");
  var raw = JSON.stringify({
    "id": userid,
    "name": name, 
    "email": useremail,
    "password": userpassword,
    "role": userRole,
    "ipList": ipList,
    "userAccess":userAccess
  });
  console.log(raw);

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
    credentials: "include",
  };

  fetch("/api/user/update", requestOptions)
    .then(response => response.json())
    .then(result => {
      if (result["status"]) {
       $("#userform")[0].reset();
       location.replace(document.referrer);
      } else {
        alert(result["message"])
      }
    })
    .catch(error => console.log('error', error));
}
function isValidIpv4Addr(ip) {
  return /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/.test(ip);
}
function deleteInput(id) {
  $("#" + id).html('');
}
function addinput() {
  var ipList = $('input[name="userIP[]"]').map(function () {
    return this.value;
  }).get();
  if (ipList.length == 10) {
    return alert("Maximum 10 IP can be added");
  }
  let html = '<label for="userIP" class="form-label">IP Address</label>';
  ipList.forEach(element => {
    let id = "inputField" + Math.floor(1000 + Math.random() * 10000).toString();
    html = html + `<div class="input-group mt-1" id="${id}" style="justify-content: center;align-items: center;">
     <input type="text" class="form-control" value="${element}" name="userIP[]" id="userIP"
         style="margin-right: 5px;" />
     <div class="input-group-append ml-2">
         <button type="button" onclick="deleteInput('${id}')" class="input-group-text" style="padding: 0.6rem .75rem;"><i
                 class="fa-solid fa-trash"></i></button> 
                 </div>
           </div>`;
  });

  let id = "inputField" + Math.floor(1000 + Math.random() * 10000).toString();
  html = html + `<div class="input-group mt-1" id="${id}" style="justify-content: center;align-items: center;">
      <input type="text" class="form-control" name="userIP[]" id="userIP" style="margin-right: 5px;" />
      <div class="input-group-append ml-2">
       <button type="button" onclick="addinput()" class="input-group-text"
        style="padding: 0.6rem .75rem;"><i class="fa-solid fa-plus"></i></button>
      </div>
    </div>`;
  $("#ipAddressList").html(html);
}
function loadLoggedUserName() {
  try {
    let userdaata = localStorage.getItem("userData") || "{}";
    let jsonData = JSON.parse(userdaata);
    $("#loggedUserName").html(jsonData["name"])
  } catch (error) {

  }
}