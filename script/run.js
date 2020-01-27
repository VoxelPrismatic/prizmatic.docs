url = document.URL;
if(url.includes("?")) {
    try {
        loadUri(url.split("?")[1]);
    } catch(err) {
        var file = url.split("?")[1].split("#")[0].split("&")[0];
        if(!file.startsWith("/prizmatic.docs/doc/"))
            file = "/prizmatic.docs/doc/" + file;
        var txt = read(file);
        var md = mark_page(txt);
        setHtml("page", md);
        setHtml("this-here", file);
    }
} else {
    loadDoc("/prizmatic.docs/doc/index.txt");
}
