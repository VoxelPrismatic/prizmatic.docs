url = document.URL;
if(url.includes("?")) {
    maybeload(url.split("?")[1]);
} else {
    loadDoc("/prizmatic.docs/doc/index.txt");
}
