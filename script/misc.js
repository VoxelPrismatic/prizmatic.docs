function remJumps() {
    var jumps = find("sect").children;
    for(var jmp of jumps) {
        if(jmp.id.startsWith("JUMP_")) {
            jmp.remove();
        }
    }
}

function grab_dirs(lvl = "/prizmatic.docs/doc") {
    var dirs = [];
    var lines = read(lvl + "/dir.txt").split("\n");
    for(var line of lines) {
        if(line == "dir.txt")
            continue;
        if(line.endsWith(".txt")) {
            var link = lvl + "/" + line;
            var short = link.slice(20);
            dirs.push(link);
            if(link.endsWith("index.txt")) {
                link = link.replace("index.txt", "");
                short = link.slice(20);
            } else {
                name = short.slice(15);
                var file = lvl + "/" + line;
                addHtml("nav", Elm(
                    "div", short, 
                    {id: file, onclick: "loadDoc(this);", class: "lnk"}
                ));
            }
        } else if(line.endsWith(".dir")) {
            line = line.slice(0, -4);
            addHtml("nav", Elm(
                "div", lvl + "/" + line + "V", 
                {id: "DROP_" + lvl + "/" + line, class: "lnk", onclick: "collapser(this)"},
                false
            ));
            dirs.push(...grab_dirs(lvl + "/" + line))
            addHtml("</div>");
        }
    }
    return dirs;
}

function btn(elem, id) {
    var btns = find(".tab");
    for(var el of btns)
        el.className = "tab";
    elem.className = "tab tabbed";
    pages = find(".page");
    for(el of pages)
        el.style.display = "none";
    find(id).style.display = "block";
}

function unimap(str) {
    return uni[str.toUpperCase()];
}

function check_for_dupes() {
    var btns = find("sect").children;
    var ls = [];
    for(var btn of btns) {
        if(ls.includes(btn.id)) {
            btn.remove();
        } else {
            ls.push(btn.id);
        }
    }
}

function collapser(elem) {
    var disp = "block";
    var name = "lnk sel";
    if(elem.id == "lnk sel") {
        disp = "none";
        name = "lnk";
    }
    var thing = elem.children;
    for(var child in thing) {
        child.style.display = disp;
    }
    elem.className = name;
}

prev_pages = [];
next_pages = [];
