function read(filename, aio = false) {
    var f = new XMLHttpRequest()
    f.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var resp = f.responseText;
            resp = resp.trim() + "\n"
            while(resp.search(/\n +\n/gm) != -1)
                resp = resp.replace(/\n +\n/gm, "\n\n");
            resp = resp.replace(/  /gm, "\u200b \u200b \u200b");
            setHtml("file", resp)
        }
    }
    f.open("GET", filename, aio);
    f.send();
    if(aio)
        return new Promise(resolve => {
            setTimeout(() => {resolve(findHtml("file"));}, 100)
        });
    return findHtml("file");
}
