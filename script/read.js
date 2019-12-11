function read(filename) {
    var f = new XMLHttpRequest()
    f.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200)
            find("file").innerHTML = f.responseText.replace(/  /gm, "\u200b \u200b \u200b");
    }
    f.open("GET", filename, false);
    f.send();
    return findHtml("file");
}

function readAsync(filename) {
    var f = new XMLHttpRequest()
    var cur = findHtml("file");
    f.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200)
            find("file").innerHTML = f.responseText.replace(/  /gm, "\u200b \u200b \u200b");
    }
    f.open("GET", filename, true);
    f.send();
    var trys = 0;
    while(findHtml("file") == cur && trys < 5)
        trys += 1;
        setTimeout(() => {console.log("wait");}, 500);
    return findHtml("file");
}
