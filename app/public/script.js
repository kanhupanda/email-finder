let csvUrls = [];
let jsonOutput = [];
let totaltimerequired = 0;
let fileIsUploaded = "";
let searchType = "webSearch"
function readSingleFile(e) {
    $("#downloadCsv").hide();
    $("#progresspercentage").text(`0%`);
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    csvUrls = [];
    var fileName = file.name;
    $(".custom-file-label").html(fileName);

    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        fileIsUploaded = true;
        let eachRows = contents.split("\n");
        eachRows.forEach((em, ind) => {
            if (em != "") {
                let eachColumns = em.split(",");
                if (ind > 0) {
                    let rowItem = eachColumns[0].trim().replace(/\r/g, "");
                    if (rowItem.startsWith("http")) {
                        csvUrls.push(rowItem);
                    } else {
                        csvUrls.push("http://" + rowItem);
                    }

                }
            }
        });
        checkFileHsaValue();
    };
    reader.readAsText(file);
}

function onRadionChange() {
    let val = $('input[name="inlineRadioOptions"]:checked').val();
    $("#downloadCsv").hide();
    $("#progresspercentage").text(`0%`);
    if (val == "singleUrl") {
        $("#inputSingleUrl").show();
        $("#fileInput").hide();
        checkInputHasValue()
    } else {
        $("#fileInput").show();
        $("#inputSingleUrl").hide();
        checkFileHsaValue();
    }
}

function onSubmit() {

    $("#downloadCsv").hide();
    $("#progresspercentage").text(`0%`);
    let val = $('input[name="inlineRadioOptions"]:checked').val();
    
    let urlList = [];

    if (val == "singleUrl") {
        let urlInput = $("#inputSingleUrl").val();
        if (urlInput == "") {
            alert("Please enter valid URL");
            return;
        }
        if (urlInput.startsWith("http")) {
            urlList.push(urlInput);
        } else {
            urlList.push("http://" + urlInput);
        }
    } else if (val == "uploadFile") {
        urlList = csvUrls;
    }
    totaltimerequired = 90 * urlList.length; 
    $("#overlayLocal").show();
    emailScrapingApi(urlList,val == "uploadFile");
}
function checkInputHasValue() {
    let urlInput = $("#inputSingleUrl").val();
    let regxTest = /^(http(s?):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(urlInput)
    if (urlInput == "" || !regxTest) {
        $("#inputGroupFileAddon04").prop("disabled", true);
    } else {
        $("#downloadCsv").hide();
        $("#progresspercentage").text(`0%`);
        $("#inputGroupFileAddon04").prop("disabled", false);
    }
}
function checkFileHsaValue() {
    if (!fileIsUploaded) {
        $("#inputGroupFileAddon04").prop("disabled", true);
    } else {
        $("#inputGroupFileAddon04").prop("disabled", false);
    }
}
function inputHandler(e) {
    checkInputHasValue()
}
$(document).ready(function () {
    $("#overlayLocal").hide();
    $("#myform")[0].reset();
    loadLoggedUserName();
    const inputSingleUrl = document.getElementById('inputSingleUrl');
    inputSingleUrl.addEventListener('inputSingleUrl', inputHandler);
    document
        .getElementById("inputGroupFile04")
        .addEventListener("change", readSingleFile, false);
});
function downloadCSV(csvStr) {
    var hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csvStr);
    hiddenElement.target = "_blank";
    hiddenElement.download = "EmailsFound.csv";
    hiddenElement.click();
}

function jsonToCSV() {
    var csvStr = "Url, Email \n";
    jsonOutput.forEach((element) => {
        let urlData = element.url.replace(/#/g, "@");
        csvStr += urlData + "," + element.email + "\n";
    });
    return csvStr;
}
let percentage = 0;
function emailScrapingApi(csvUrlList, isFromCsv) {
    percentage = 0;
    jsonOutput = [];
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        urls: csvUrlList,
        isSingle: searchType == "pageSearch",
        isFromCsv:isFromCsv
    });
    let timepassed = 0;
    let timer = setInterval(() => {
        timepassed++;
        percentage = Math.floor((timepassed / totaltimerequired) * 100);
        if (percentage > 98) {
            percentage = 99;
        }
        $("#progresspercentage").text(`${percentage}%`);
    }, 1000);

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
    };

    fetch("/api/scrap/email-scrap", requestOptions)
        .then((response) => response.json())
        .then((result) => {
            if (result["emails"]) {
                jsonOutput = result["emails"];
            }
            $("#overlayLocal").hide();
            $("#downloadCsv").show();
            clearInterval(timer);
        })
        .catch((error) => {
            clearInterval(timer);
            $("#overlayLocal").hide();
            alert("Internal error occurred");
            
        });
}

function searchTypeFnOne(params) {
    $("#downloadCsv").hide(); 
    $("#progresspercentage").text(`0%`);
    searchType = "webSearch"
    $("#nav-home-tab").addClass("active")
}
function searchTypeFnTwo(params) {
    $("#downloadCsv").hide(); 
    $("#progresspercentage").text(`0%`);
    searchType = "pageSearch"
    $("#nav-profile-tab").addClass("active")
}
function searchTypeFn(params) {
    $("#downloadCsv").hide();
    $("#formSection").fadeOut();
    $("#progresspercentage").text(`0%`);
    if (params == "webSearch") {
        searchType = "webSearch"
        $("#nav-home-tab").addClass("active")
        $("#nav-profile-tab").removeClass("active")
    } else {
        searchType = "pageSearch"

        $("#nav-profile-tab").addClass("active")
        $("#nav-home-tab").removeClass("active")
    }
    setTimeout(() => {
        $("#formSection").fadeIn();
    }, 400);
}
function downloadButton() {
    downloadCSV(jsonToCSV());
}

function loadLoggedUserName() {
    try {
      let userdaata = localStorage.getItem("userData") || "{}";
      let jsonData = JSON.parse(userdaata);
      $("#loggedUserName").html(jsonData["name"])
    } catch (error) {
  
    }
  }