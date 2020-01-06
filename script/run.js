url = document.URL;
if(url.includes("?")) {
    loadUri(url);
} else {
    loadDoc("/prizmatic.docs/doc/index.txt");
}
