function folder_back() {
    while(prev_pages.slice(-1)[0] == findHtml("this-here"))
        prev_pages = prev_pages.slice(0, -1)
    id = prev_pages.slice(-1)[0];
    next_pages.push(id);
    prev_pages = prev_pages.slice(0, -1)
    loadDoc(id, false);
}

function folder_prev() {
    var stuff = find("nav").children;
    var found = false;
    for(thing of stuff) {
        if(found) {
            loadDoc(thing.id);
            break;
        }
        if(thing.className == "lnk sel") {
            found = true;
        }
    }
}

function folder_up() {
    if(findHtml("this-here").lastIndexOf("/") != 19)
        btnload("../__init__.txt");
}

function folder_next() {
    while(next_pages.slice(-1)[0] == findHtml("this-here"))
        next_pages = next_pages.slice(0, -1)
    var stuffs = find("nav").children;
    var stuff = [];
    for(thing in stuffs)
        stuff.push(thing)
    var found = false;
    stuff.reverse()
    for(thing of stuff) {
        if(found) {
            loadDoc(thing.id);
            break;
        }
        if(thing.className == "lnk sel") {
            found = true;
        }
    }
}

function folder_fwd() {
    id = next_pages.slice(-1)[0];
    prev_pages.push(id);
    loadDoc(id, false);
}
