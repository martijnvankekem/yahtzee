let colCount = 0;
let zoom = 1.0;
let soundsEnabled = true;

const sound = new Audio();
let firstPlay = false;

let specialValues = [
    {type: "number", min: 0, max: 30}, // three of a kind
    {type: "number", min: 0, max: 30}, // carre
    {type: "select", options: ["", 0, 25]}, // full house
    {type: "select", options: ["", 0, 30]}, // small street
    {type: "select", options: ["", 0, 40]}, // large street
    {type: "select", options: ["", 0, 50]}, // topscore
    {type: "number", min: 0, max: 30}, // change
];

let tableTopPart;
let tableBottomPart;

let deferredPrompt;
let addBtn;

window.onload = () => {
    // Init table
    getData();
    document.getElementById("sounds").addEventListener("change", e => {
        switchSound();
    });
    document.body.style.zoom = 0.9;
    
    addBtn = document.getElementById("installApp");
    
}

document.ontouchstart = function() {
    if (!firstPlay) {
        sound.play();
        firstPlay = true;
    }
}

function switchSound() {
    soundsEnabled = !soundsEnabled;
    setSound(soundsEnabled);
}

function setSound(enabled) {
    document.cookie = "sounds=" + (enabled ? "enabled" : "disabled") + ";expires=Fri, 31 Dec 9999 23:59:59 GMT";
}

function saveData() {
    let topJson = JSON.stringify(tableTopPart);
    let btmJson = JSON.stringify(tableBottomPart);
    document.cookie = "top=" + topJson + ";expires=Fri, 31 Dec 9999 23:59:59 GMT";
    document.cookie = "btm=" + btmJson + ";expires=Fri, 31 Dec 9999 23:59:59 GMT";
    document.cookie = "cols=" + colCount + ";expires=Fri, 31 Dec 9999 23:59:59 GMT";
}

function reset() {
    if (confirm('Are you sure you want to restart the game? All data will be permanently lost!')) {
        document.cookie = "top=;btm=;cols=";
        window.location.reload();
    }
}

function getData() {
    let topCookie = getCookie("top");
    let btmCookie = getCookie("btm");
    let colCookie = getCookie("cols");
    if (topCookie != "" && btmCookie != "" && colCookie != "") {
        tableTopPart = JSON.parse(topCookie);
        tableBottomPart = JSON.parse(btmCookie);
        for (let i = 0; i < Number(colCookie); i++) addColumn(i);
        updateTotal();
    } else {
        tableBottomPart = [];
        tableTopPart = [];
        addColumn();
        updateTotal();
    }
    soundsEnabled = getCookie("sounds") == "enabled";
    document.getElementById("sounds").checked = soundsEnabled;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function minZoom() {
    zoom -= 0.1;
    document.body.style.zoom = zoom;
}

function plusZoom() {
    zoom += 0.1;
    document.body.style.zoom = zoom;
}


// Add a column to the table
function addColumn(colIndex) {
    if (colCount == 6) return;
    colCount++;
    let newColumnIndex = (typeof colIndex != "undefined") ? colIndex : (document.querySelectorAll("#topTable tr:nth-child(1) td").length - 1);
    if (typeof colIndex == "undefined") {
        tableTopPart[tableTopPart.length] = Array(6);
        tableBottomPart[tableBottomPart.length] = Array(7);
    }
    
    // Top table
    let topTable = document.getElementById("topTable");
    let topRows = topTable.querySelectorAll("tr");
    for (let i = 0; i < topRows.length; i++) {
        if (i < 6) {
            // Create number picker
            let newCol = document.createElement("td");
            let newSelector = document.createElement("select");
            for (let j = -1; j <= 5; j++) {
                let newOption = document.createElement("option");
                newOption.value = (j == -1) ? "" : j * (i+1);
                if (tableTopPart[newColumnIndex][i] == newOption.value) newOption.selected = true;
                newOption.innerHTML = newOption.value + "";
                newSelector.appendChild(newOption);
            }
            newSelector.onchange = (ctx) => {
                newSelector.blur();
                let val = (ctx.target.value == "") ? null : Number(ctx.target.value);
                tableTopPart[newColumnIndex][i] = val;
                if (val == 0) sadnessScream();
                updateTotal();
            }
            // Add new column to table
            newCol.appendChild(newSelector);
            topRows[i].appendChild(newCol);
        } else {
            // Create label
            let newCol = document.createElement("td");
            let newLabel = document.createElement("div");
            newLabel.innerHTML = "<div id=\"top-" + newColumnIndex + "-" + i + "-label\">0</div>";
            if (i == 7) newLabel.innerHTML += "<div class=\"bonusCalc\" id=\"bonusCalc-" + newColumnIndex + "\">(0)</div>";
            // Add new column to table
            newCol.appendChild(newLabel);
            topRows[i].appendChild(newCol);
        }
    }
    
    // Bottom table
    let bottomTable = document.getElementById("bottomTable");
    let bottomRows = bottomTable.querySelectorAll("tr");
    for (let i = 0; i < bottomRows.length - 1; i++) {
        if (i < 7) {
            // Create special item
            let value = specialValues[i];
            let newCol = document.createElement("td");
            
            let newEl;
            
            if (value.type == "number") {
                newEl = document.createElement("input");
                newEl.type = value.type;
                newEl.pattern = "\\d*";
                newEl.inputMode = "decimal";
                newEl.min = value.min;
                newEl.max = value.max;
                newEl.value = tableBottomPart[newColumnIndex][i];
                newEl.onchange = (ctx) => {
                    newEl.blur();
                    let val = (ctx.target.value == "") ? null : Number(ctx.target.value);
                    if (val < value.min || val > value.max) {
                        let oldVal = tableBottomPart[newColumnIndex][i];
                        ctx.target.value = (oldVal == undefined) ? "" : oldVal;
                        return;
                    };
                    tableBottomPart[newColumnIndex][i] = val;
                    if (val == 0) sadnessScream();
                    updateTotal();
                }
                
            } else if (value.type == "select") {
                newEl = document.createElement("select");
                for (let j = 0; j < value.options.length; j++) {
                    let newOption = document.createElement("option");
                    newOption.value = value.options[j];
                    if (tableBottomPart[newColumnIndex][i] == value.options[j]) newOption.selected = true;
                    newOption.innerHTML = newOption.value + "";
                    newEl.appendChild(newOption);
                }
                newEl.onchange = (ctx) => {
                    newEl.blur();
                    let val = (ctx.target.value == "") ? null : Number(ctx.target.value);
                    tableBottomPart[newColumnIndex][i] = val;
                    if (val == 50) yathzeeCelebrate();
                    if (val == 0) sadnessScream();
                    updateTotal();
                }
                newEl.ontouchend = function() {
                    setTimeout(checkTouchEnd, 500);
                }
            }
            
            // Add new column to table
            newCol.appendChild(newEl);
            bottomRows[i].appendChild(newCol);
        } else {
            // Create label
            let newCol = document.createElement("td");
            let newLabel = document.createElement("div");
            newLabel.id="btm-" + newColumnIndex + "-" + i + "-label";
            newLabel.innerHTML = "0";
            // Add new column to table
            newCol.appendChild(newLabel);
            bottomRows[i].appendChild(newCol);
        }
    }
}

// Update the total for all rows
function updateTotal(cookie) {
    cookie = (typeof cookie == "undefined") ? true : false;
    let totalAllRows = 0;
    
    // Top part
    for (let i = 0; i < tableTopPart.length; i++) {
        let totalPointsLabel = document.getElementById("top-"+i+"-6-label");
        let bonusPointsLabel = document.getElementById("top-"+i+"-7-label");
        let grandTotalLabel = document.getElementById("top-"+i+"-8-label");
        let bonusDiffLabel = document.getElementById("bonusCalc-"+i);
        
        let totalPoints = 0;
        let bonusPoints = 0;
        
        let calcBonusDiff = 0;
        
        for (let j = 0; j < tableTopPart[i].length; j++) {
            let el = document.querySelector("#topTable tr:nth-child("+(j+1)+") td:nth-child("+(i+2)+")");
            if (tableTopPart[i][j] == null) {
                el.classList.remove("entered");
                el.classList.remove("entered-zero");
            } else if (tableTopPart[i][j] == 0) {
                el.classList.remove("entered");
                el.classList.add("entered-zero");
            } else {
                el.classList.add("entered");
                el.classList.remove("entered-zero");
            }
            
            let num = (tableTopPart[i][j] == undefined) ? 0 : tableTopPart[i][j];
            let bonusNum = (tableTopPart[i][j] == undefined) ? (3*(j+1)) : tableTopPart[i][j];
            totalPoints += Number(num);
            calcBonusDiff += bonusNum;
        }
        
        calcBonusDiff = 63 - calcBonusDiff;
        calcBonusDiff *= -1;
        
        bonusDiffLabel.innerHTML = (calcBonusDiff > 0 ? "(+" : "(") + calcBonusDiff + ")";
        if (calcBonusDiff >= 0) {
            bonusDiffLabel.classList.add("positive");
            bonusDiffLabel.classList.remove("negative");
        } else {
            bonusDiffLabel.classList.remove("positive");
            bonusDiffLabel.classList.add("negative");
        }
        
        bonusPoints = (totalPoints >= 63) ? 35 : 0;
        totalPointsLabel.innerHTML = totalPoints;
        bonusPointsLabel.innerHTML = bonusPoints;
        grandTotalLabel.innerHTML = totalPoints + bonusPoints;
        
    }
    
    // Bottom part
    for (let i = 0; i < tableBottomPart.length; i++) {
        let totalPointsLabel = document.getElementById("btm-"+i+"-7-label");
        let grandTopTotalLabel = document.getElementById("btm-"+i+"-8-label");
        let grandTotalLabel = document.getElementById("btm-"+i+"-9-label");
        
        let totalPoints = 0;
        
        for (let j = 0; j < tableBottomPart[i].length; j++) {
            let el = document.querySelector("#bottomTable tr:nth-child("+(j+1)+") td:nth-child("+(i+2)+")");
            if (tableBottomPart[i][j] == null) {
                el.classList.remove("entered");
                el.classList.remove("entered-zero");
            } else if (tableBottomPart[i][j] == 0) {
                el.classList.remove("entered");
                el.classList.add("entered-zero");
            } else {
                el.classList.add("entered");
                el.classList.remove("entered-zero");
            }
            
            let num = (tableBottomPart[i][j] == undefined) ? 0 : tableBottomPart[i][j];
            totalPoints += Number(num);
        }
        
        totalPointsLabel.innerHTML = totalPoints;
        grandTopTotalLabel.innerHTML = document.getElementById("top-"+i+"-8-label").innerHTML;
        let grandTotal = Number(grandTopTotalLabel.innerHTML) + totalPoints;
        grandTotalLabel.innerHTML = grandTotal;   
        totalAllRows += grandTotal;
    }
    
    let allRowsTotalLabel = document.getElementById("total-allrows");
    allRowsTotalLabel.innerHTML = totalAllRows;
    
    if (cookie) saveData();
}

let playCelebrate = false, playSad = false;

function yathzeeCelebrate() {
    if (!soundsEnabled) return;
    
    sound.src = 'assets/celebrate.mp3';
    sound.play();
    document.body.classList.add("animation");
    setTimeout(function() {
        document.body.classList.remove("animation");
    }, 8700);
}

function sadnessScream() {
    if (!soundsEnabled) return;
    
    sound.src = 'assets/pleaseno.mp3';
    sound.play();
    document.body.style.backgroundImage = "url(assets/sadbg.jpg)";
    setTimeout(function() {
        document.body.style.backgroundImage = "none";
    }, 7000);
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
        .register("/serviceWorker.js")
        .then(res =>  {
            console.log("service worker registered");
            window.addEventListener('beforeinstallprompt', (e) => {
                // Prevent Chrome 67 and earlier from automatically showing the prompt
                e.preventDefault();
                // Stash the event so it can be triggered later.
                deferredPrompt = e;
                // Update UI to notify the user they can add to home screen
                addBtn.style.display = 'block';
                
                addBtn.addEventListener('click', (e) => {
                    // hide our user interface that shows our A2HS button
                    addBtn.style.display = 'none';
                    // Show the prompt
                    deferredPrompt.prompt();
                    // Wait for the user to respond to the prompt
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the A2HS prompt');
                        } else {
                            console.log('User dismissed the A2HS prompt');
                        }
                        deferredPrompt = null;
                    });
                });
            });
        })
        .catch(err => console.log("service worker not registered", err))
    })
}