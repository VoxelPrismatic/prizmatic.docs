url = document.URL;
if(url.includes("?")) {
    try {
        loadUri(url.split("?")[1]);
    } catch(err) {
        setHtml("page", findHtml("DOCS_/prizmatic.docs/doc/" + url.split("?")[1].split("#")[0]));
    }
} else {
    loadDoc("/prizmatic.docs/doc/index.txt");
}
