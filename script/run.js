url = document.URL;
if(url.includes("?")) {
    loadUri(url.split("?")[1]);
} else {
    loadDoc("/prizmatic.docs/doc/index.txt");
}
