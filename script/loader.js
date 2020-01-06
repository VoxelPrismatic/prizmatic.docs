function loadDoc(fileName, append = true) {
    
    var file_name = "";
    if(fileName.id != undefined)
        file_name = fileName.id;
    else
        file_name = fileName;
    
    if(append)
        prev_pages.push(file_name);
    
    setHtml("this-here", file_name);
    setHtml("page", "WAIT... [LOADING FILE]");
    remJumps();
    
    try {
        find(file_name).className = "lnk sel";
    } catch(err) {
        console.error(err);
        console.log(file_name);
    }
    
    try {
        var things = find("nav").children;
        setHtml("page", findHtml("DOCS_" + file_name));
        setHtml("sect", findHtml("SECT_" + file_name));
    } catch(err) {
        try {
            var txt = read(file_name);
            
        } catch(err) {
            console.error(err);
            setHtml("page", Elm("div", "404 ] Not found", {class: "warn"}));
            return;
        }
        
        if(txt.startsWith("__listdir__")) {
            setHtml("page", Elm(
                "div", "This file only imports the others in this directory", 
                {class: "note"}
            ));
            for(var dir of dirs) {
                addHtml("page", Elm(
                    "div",  `[View ${dir}]`, {
                        id: "/prizmatic.docs/doc/" + dir, 
                        class: "btn", 
                        onclick: 'onclick="btnload(this.id)"'
                    }
                ));
            }
        }
        
        if(!(txt.startsWith("--top--\n")))
            txt = "--top--\n" + txt;
        addHtml("cached-pages", Elm(
            "div", txt, {id: "RAW_" + file_name, class: "invis"}
        ));
        var mark = mark_page(txt);
        mark = mark.replace(/<span><\/span>/gm, "");
        mark = mark.replace(/(<br>){2,}/gm, "<br>");
        setHtml("page", mark);
        
        // Section
        for(var line of txt.split("\n")) {
            if(line.search(/^--[\w\d_.-]+--$/gm) == 0) {
                var sec = line.slice(2, -2);
                addHtml("sect", Elm(
                    "div", "#" + sec,
                    {class: "lnk", id: "JUMP_" + sec, onclick: "jump(this)"}
                ));
            }
        }
        check_for_dupes();
        addHtml("loaded-pages", Elm(
            "div", findHtml("page"), {id: "DOCS_" + file_name, class: "invis"}
        ));
        addHtml("loaded-sects", Elm(
            "div", findHtml("sect"), {id: "SECT_" + file_name, class: "invis"}
        ));
    }
    
    var url = "https://github.com/VoxelPrismatic/prizmatic.docs/edit/master/doc/";
    find("edit_url").href = url + file_name.split("/").slice(3).join("/");
    var high = find("page_url").href.split("&")[1]
    find("page_url").href = find("page_url").href.split("?")[0] + "?" +
                            file_name.split("/").slice(3).join("/") + "#top";
    if(high != undefined)
        find("page_url").href += "&" + high;
    for(var thing of things)
        if(thing.className == "lnk sel")
            thing.className = "lnk";
    try {
        find(file_name).className = "lnk sel";
    } catch(err) {
        console.error(err);
    }
    
    highlight(find("highlighter").innerHTML);
    
    jump("JUMP_top");
    return;
}

function loadUri(uri, init = false) {
    if (!(uri.startsWith("/prizmatic.docs/doc/")));
          uri = "/prizmatic.docs/doc/" + uri;
    var url = uri.replace(/\/\//gm, "/").split("#")[0].split("&")[0];
    if(url.endsWith("/") && !init)
        url += "index.txt";
    else if(url.endsWith("/") && init)
        url += "__init__.txt";
    else if(!(url.endsWith(".txt")))
        url += ".txt";
    try {
        loadDoc(url);
    } catch(err) {
        setHtml("page", Elm(
            "div", "An unknown error occured, check console for details", 
            {class: "warn"}
        ));
        let issues = "https://github.com/prizmatic.docs/issues";
        addHtml("page", Elm(
            "div", `You can always send a bug report over at <a href="${issues}">` +
            "issues</a>"
        ));
    }
    url = uri;
    if(url.includes("#")) {
        var sec = url.split("#")[1].split("?")[0].split("&")[0];
        if(!(sec.startsWith("JUMP_")))
            sec = "JUMP_" + sec;
        jump(sec);
    } else {
        jump("JUMP_top");
    }
    if(url.includes("&")) {
        var sec = url.split("#")[1].split("?")[0].split("&")[0];
        setHtml("page", findHtml("page").replace(
            RegExp(sec, "gm"), `<div class="find">${sec}</div>`
        ));
    }
}

function loadBtn(url) {
    var here = findHtml("this-here");
    if(url.startsWith("/prizmatic.docs/doc/"))
        url = url.slice(20);
    if(url.startsWith("./")) {
        loadDoc(here.split("/").slice(0, -1).join("/") +"/" + url.replace(/\.\//gm, ""), true);
    } else if(url.startsWith("../")) {
        while(url.startsWith("../")) {
            url = url.slice(3);
            here = here.split("/").slice(0, -1).join("/");
        }
        loadDoc(here + "/" + url.replace(/\.\//gm, ""), true);
    } else if(url.startsWith("~/")) {
        loadDoc("prizmatic.doc/doc" + url.slice(1), true);
    } else {
        loadDoc(url, true);
    }
    find("back-page").innerHTML += `<span>${url}</span>`;
}

function jump(elem) {
    find("docs").click();
    var id = "";
    try {
        id = elem.id.split("JUMP_").slice(-1)[0];
    } catch {
        id = elem.split("JUMP_").slice(-1)[0];
    }
    try {
        find(id).scrollIntoView();
        var things = find("sect").children;
        for(var thing of things)
            if(thing.className == "lnk sel")
                thing.className = "lnk";
        find("JUMP_"+id).className = "lnk sel";
        var high = find("page_url").href.split("&")[1]
        find("page_url").href = find("page_url").href.split("#")[0] + "#" + id.slice(5);
        if(high != undefined)
            find("page_url").href += "&" + high;
        check_for_dupes();
    } catch(err) {
        console.error(err);
    }
}

function finder(thing) {
    var ls = [];
    for(var file of dirs) {
        try {
            if(findHtml("RAW_" + file).includes(thing))
                ls.push(file);
        } catch(err) {
            var txt = mayberead(file);
            addHtml(
                "cached-pages",  
                `<div id="RAW_${file}" class="invis">${txt}</div>`
            );
            if(txt.includes(thing))
                ls.push(file);
        }
    }
    st = "";
    for(var file of ls)
        st += `<div onclick="maybeload('${file}&${thing}')" class="exc">${file}</div>`;
    editHtml("page", st);
}
