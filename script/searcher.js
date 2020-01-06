function regex(st, id = "filter_docs") {
    st = st.trim();
    find(id).style.color = "#ffffff";
    if(st == "")
        return 1;
    if(st.endsWith("/") && st.startsWith("/")) {
        try {
            find(id).style.color = "#00ffff";
            return RegExp(st.slice(1, -1), "gm");
        } catch(err) {
            find(id).style.color = "#ff0000";
            return 1;
        }
    }
    var re = "(";
    for(var ch of st) {
        var lc = ch.toLowerCase().charCodeAt(0).toString(16);
        var uc = ch.toUpperCase().charCodeAt(0).toString(16);
        while(lc.length < 4)
            lc = "0" + lc;
        while(uc.length < 4)
            uc = "0" + uc;
        re += `[\\u${lc}\\u${uc}\\u200b\\\\]`; //Escape chars
    }
    re += ")";
    return RegExp(re, "gm");
}

function highlight(phrase) {
    phrase = phrase.trim();
    find("page").innerHTML = findHtml("DOCS_" + findHtml("this-here"));
    if(phrase.lengh <= 2) {
        return;
        throw "Thrown to stop highlighting";
    }
    find_text(regex(phrase));
    
    find("docs").click();
    ls = find(".find");
    for(var l of ls) {
        l.ondblclick = function() {
            ls = find(".find");
            var show = this.className.includes("nofind");
            for(var l of ls) {
                if(show)
                    l.className = "find";
                else
                    l.className = "find nofind";
            }
        }
        l.onclick = function() {
            this.classList.toggle("nofind");
        }
    }
    find("highlighter").innerHTML = phrase
}

function find_text(re, parent = find("page")) {
    if(re == 1)
        return parent.innerHTML;
    var intag = false;
    var h = parent.innerHTML;
    var ttl = "";
    var st = "";
    var child = parent.children;
    var c = 0;
    var i = 0;
    for(var c of h) {
        if(c == "<" && !intag) {
            if(h.slice(0).startsWith(child[c].outerHtml)) {
                c += 1;
                intag = true;
                ttl += "<";
                continue;
            }
        }
        if(c == ">" && intag) {
            intag -= 1;
            ttl += ">";
            st = st.replace(re, `<span class="find">$1</span>`);
            ttl += st;
            st = "";
            continue;
        }
        if(c == ">" && intag > 0) {
            intag -= 1;
        }
        if(intag) {
            ttl += c;
        } else {
            st += c;
        }
        i += 1;
    }
    return ttl;
}

function filter_docs(thing) {
    var pages = find("nav").children;
    re = regex(thing, "filter_docs");
    if(re == 1)
        return;
    for(var page of pages) {
        if(!(page.id.startsWith("/prizmatic.docs/doc/")))
            continue;
        var id = page.id.slice(20, -4);
        if(thing == "" || id.search(re) != -1)
            page.style.display = "block";
        else
            page.style.display = "none";
    }
}

function filter_jump(thing) {
    var pages = find("sect").children;
    re = regex(thing, "filter_sects");
    if(re == 1)
        return;
    for(var page of pages) {
        if(!(page.id.startsWith("JUMP_")))
            continue;
        if(thing == "" || page.id.slice(5).search(re) != -1)
            page.style.display = "block";
        else
            page.style.display = "none";
    }
}

function find_in_docs(thing) {
    while(find("search").children.length > 2) {
        var jmp = find("search").children;
        for(var elm of jmp)
            if(elm.id.startsWith("JUMP_"))
                elm.remove();
    }
    var pages = find("nav").children;
    re = regex(thing, "filter_text");
    if(re == 1)
        return;
    setHtml("ok_btn", "[JUST A SEC]");
    var i = 0;
    for(var page of pages) {
        var id = page.id;
        if(!(id.startsWith("/prizmatic.docs/doc/")))
            continue;
        try {
            findHtml("DOCS_" + id);
        } catch(err) {
            var aio = read(id, true);
            aio.then(function(txt) {
                addHtml("cached-pages", Elm(
                    "div", txt, {id: "RAW_" + id, class: "invis"}
                ));
            });
        }
        var text = findHtml("RAW_" + page.id)
        if(text.search(re) != -1 && re != "") {
            var st = "<b>" + id + "</b><br>";
            var index = text.search(re)
            st += text.slice(
                Math.max(0, index - 5), //0 and onwards
                Math.min(index + 5, text.length) //Length and offwards
            ).replace(re, "<i>$1</i>");
            addHtml("search", Elm(
                "button", st, 
                {class: "lnk", onclick: "jumpBtn(this.id)", id: "JUMP_" + id}
            ));
        }
        if(i % 9 == 0) {
            var st = "[JUST A SEC]";
            for(var x = 0; x < (i % 3); x += 1)
                st = "~" + st + "~";
            setHtml("ok_btn", st);
        }
        i += 1;
    }
    setHtml("ok_btn", "[OK]");
}
