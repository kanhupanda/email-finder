
$(document).ready(function () {
    loadLoggedUserName();
});

function loadLoggedUserName() {
    try {
        let userdaata = localStorage.getItem("userData") || "{}";
        let jsonData = JSON.parse(userdaata);
        $("#loggedUserName").html(jsonData["name"])
    } catch (error) {

    }
}