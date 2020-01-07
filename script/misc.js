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
                    {id: file, onclick: "loadDoc(this);", class: "lnk",
                     onmouseover: "setcoll(this)"}
                )
            }
        } else if(line.endsWith(".dir")) {
            line = line.slice(0, -4);
            layout += Elm(
                "div", lvl.slice(19) + "/" + line, 
                {id: "DROP_" + lvl + "/" + line, class: "collapser", onclick: "collapser()", 
                 onmouseover: "setcoll(this)"},
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
    colldesel();
    if(elem.className.includes("collapser")) {
        elem.className += " collhover";
    }
}

function colldesel(elem = find("nav")) {
    var ch = elem.children;
    for(var c of ch) {
        if(c.className.includes("collhover"))
            c.className = c.className.replace("collhover", "");
        colldesel(c);
    }
}

function collapser(elem) {
    if(elem == undefined || elem == null|| elem.className.includes("lnk"))
        return;
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
}

function collall() {
    var elem = globalThis.hover_collapsable[0];
    if(elem == undefined || elem.className.includes("lnk"))
        return;
    var child = elem.children;
    for(var c of child) {
        if(c.className == "collapser collopen") {
            collapser(c);
        }
        if(c.className.includes("collapser")) {
           collall(c);
        }
    }
    if(c.className.includes("collapser")) {
       collapser(c);
    }
}

prev_pages = [];
next_pages = [];
