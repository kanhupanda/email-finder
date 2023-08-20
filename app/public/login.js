
async function login() {
    let email = $("#useremail").val();
    let password = $("#userpassword").val();
    if (email == "") {
        return alert("Email is required")
    }
    if (password == "") {
        return alert("Password is required")
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "email": email,
        "password": password
    });
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("/api/user/login", requestOptions)
        .then((response) => response.json())
        .then((result) => {
            if (result["data"]) {
                localStorage.setItem("token", result['token'] || "");
                localStorage.setItem("userData", JSON.stringify(result['data']));
                window.location.reload();
            } else {
                alert(result['message'])
            }
        })
        .catch((error) => {
            alert("Internal error occurred "+error.message);

        });


}