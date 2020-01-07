function remJumps() {
    var jumps = find("sect").children;
    for(var jmp of jumps) {
        if(jmp.id.startsWith("JUMP_")) {
            jmp.remove();
        }
    }
}

var hover_collapsable = [];

function grab_dirs(lvl = "/prizmatic.docs/doc") {
    var dirs = [];
    var layout = "";
    if(lvl == "/prizmatic.docs/doc")
        layout = findHtml("nav");
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
                layout += Elm(
                    "div", short, 
                    {id: file, onclick: "loadDoc(this);", class: "lnk"}
                )
            }
        } else if(line.endsWith(".dir")) {
            line = line.slice(0, -4);
            layout += Elm(
                "div", lvl + "/" + line, 
                {id: "DROP_" + lvl + "/" + line, class: "collapser", onclick: "collapser()", 
                 onmouseover: "setcoll(this)", onmouseout: "unsetcoll(this)"},
                false
            )
            var a = [];
            var b = "";
            [a, b] = grab_dirs(lvl + "/" + line);
            dirs.push(...a)
            layout += b + "</div>";
        }
    }
    if(lvl != "/prizmatic.docs/doc")
        return [dirs, layout];
    setHtml("nav", layout);
    var collapsers = find(".collapser");
    for(var collapse of collapsers) {
        var items = collapse.children;
        for(var item of items)
            item.style.display = "none";
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

function setcoll(elem) {
    globalThis.hover_collapsable.push(elem);
}

function unsetcoll(elem) {
    var thing = globalThis.hover_collapsable;
    thing.reverse();
    var ls = [];
    var found = false;
    for(var item of thing) {
        if(!found && item.id == elem.id) {
            found = true;
            continue;
        }
        ls.push(item);
    }
    ls.reverse();
    globalThis.hover_collapsable = ls;
}

function collapser() {
    var elem = globalThis.hover_collapsable[0];
    var disp = "block";
    var name = "collapser collopen";
    if(elem.className == name) {
        disp = "none";
        name = "collapser";
    }
    var thing = elem.children;
    for(var child of thing) {
        child.style.display = disp;
    }
    elem.className = name;
    globalThis.hover_collapsable = [];
}

prev_pages = [];
next_pages = [];
