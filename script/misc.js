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
                    "div", "./" + (lvl.slice(19) + "/" + line).split("/").slice(-1)[0], 
                    {id: file, onclick: "collapser(this);", class: "lnk",
                     onmouseover: "setcoll(this);"}
                )
            }
        } else if(line.endsWith(".dir")) {
            line = line.slice(0, -4);
            layout += Elm(
                "div", "./" + (lvl.slice(19) + "/" + line).split("/").slice(-1)[0], 
                {id: "DROP_" + lvl + "/" + line, class: "collapser", onclick: "collapser(this)", 
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

function collsel(elem = find("nav")) {
    var ch = elem.children;
    var itm = null;
    for(var c of ch) {
        if(c.className.includes("collhover"))
            itm = null;
        var tmp = collsel(c);
        if(tmp != null) 
            return itm
    }
    return itm;
}
    

function setcoll(elem) {
    colldesel();
    
}

function colldesel(elem = find("nav")) {
    var ch = elem.children;
    for(var c of ch) {
        if(c.className.includes("collhover"))
            c.classList.remove("collhover");
        colldesel(c);
    }
}

var timeout = false;

function collapser(elem) {
    if(globalThis.timeout)
        return;
    globalThis.timeout = true;
    window.setTimeout(function() {globalThis.timeout = false;}, 500);
    //Set timeout so multiple collapses cannot run at the same time
    if(elem.className.includes("lnk"))
        return loadDoc(elem);
    if(elem == undefined || elem == null)
        return;
    var disp = true;
    var name = "collapser collopen";
    if(elem.className.includes("collopen")) {
        disp = false;
        name = "collapser";
    }
    var thing = elem.children;
    for(var child of thing) {
        if(disp && !child.className.includes("invis"))
            child.style.display = "block";
        else
            child.style.display = "none";
    }
    elem.className = name;
}

function collall() {
    var child = find("nav");
    for(var c of child) {
        if(c.className.includes("collopen")) {
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
