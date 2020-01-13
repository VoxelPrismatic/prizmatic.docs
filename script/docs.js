// Extra functions

function ind(num) {
    var st = "";
    for(var i = 0; i < num; i++)
        st += "\u200b \u200b";
    return st;
}

function mkJmp(nam, show = "", ...other) {
    if(typeof show != "string") {
        show = "";
        other = show.concat(...other)
    }
    if(show == "")
        show = nam;
    if(other.length != 0) {
        var st = `<div class="collapser" id="DROP_${nam}" `;
        st += `onclick="collapser(this)" onmouseover="setjump(this)">`;
        st += show;
        for(var jmp of other)
            st += mkJmp(...jmp);
        st += `</div>`;
        return st;
    }
    var st = `<div class="lnk" id="JUMP_${nam}"`;
    st += `onclick="jump(this);">#${show}</div>`;
    return st;
}

var hexs = [];

function rngHex() {
    var st = "";
    for(var x = 0; x < 8; x += 1)
        st += Math.floor(Math.random() * 16).toString(16)
    if(globalThis.hexs.includes(st))
        st = rngHex();
    globalThis.hexs.push(st);
    return st;
}

// Set up vars

var py_desc = {
    "__repr__": "Returns the 'Python Correct' name string",
    "__dict__": "Returns the 'send-ready' object",
    "__iter__": "Makes a generator ",
    "__next__": "Allows you to iterate through ",
    "__list__": "Returns a list of ",
    "__getitem__": "Treats this class as if it were a ",
    "__getitemL__": "Treats this class as if it were a list",
    "__getitemD__": "Treats this class as if it were a dict"
};

var notes = {};
var jumps = [];
var loc = "";
var here = "";

let py_site = "https://docs.python.org/3/library/";
let ahttp_site = "https://docs.aiohttp.org/en/stable/";
var links_to_docs = {
    "aiohttp.ClientSession": ahttp_site + "client_reference.html#client-session",
    "datetime.datetime": py_site + "datetime.html#datetime-objects",
};

var current_obj = ""

var docs_regex = [
    [
        /dis\.mod\./gm,
        `discord.models.`
    ], [
        /red\.mod\./gm,
        `reddit.models.`
    ], [
        /mat\.mod\./gm,
        `riot.models.`
    ], [
        /\~\//gm, 
        function(m) {
            console.log("Location: " + loc);
            console.log("This here: " + here);
            return here.split(".").slice(0, 2).join(".") + ".";
        }
    ], [
        /\~\.\.\.\./gm,
        loc.split(".").slice(0, -3).join(".") + "."
    ], [
        /\~\.\.\./gm,
        loc.split(".").slice(0, -2).join(".") + "."
    ], [
        /\~\.\./gm,
        loc.split(".").slice(0, -1).join(".") + "."
    ], [
        /\~\./gm,
        function(m) {
            console.log("Location: " + loc);
            console.log("This here: " + here);
            return loc + "."
        }
    ], [
        /\{\{loc\}\} (.+?)\n\n+/gm,
        function(m, p1) {
            loc = p1;
            return "";
        }
    ], [
        /\{\{cls\}\} (.+?) = (.+?)\(([\w\d*_, \[\]\n]*?)\)\n\n/gm,
        function(m, p1, p2, p3) {
            var st = `<div id="top"></div>\u200a-=-/CLS_${p2}/-=-\u200a-=-/CLS_${p2}-=-\u200a<div class="head1">`;
            st += `#] ` + p2 + ` <span class="typ">{{cls}}</span>`;
            st += `</div><div class="code">`;
            st += `${p1} = <span class="cls">${p2}</span>(`;
            st += p3.replace(/\n */gm, " ");
            st += ")</div>";
            return st;
        }
    ], [
        /\{\{subcls\}\} \[(.+)\] (.+?) = (.+?)\(([\w\d*_, \[\]\n]*?)\)\n\n/gm,
        function(m, p4, p1, p2, p3) {
            var st = `<div id="top"></div>\u200a-=-/SUBCLS_${p2}/-=-\u200a-=-/SUBCLS_${p2}-=-\u200a`;
            st += `<div id="${p2}" class="head1">`;
            st += `#] ` + p2 + "(" + p4 + ")" + ` <span class="typ">{{cls}}</span>`;
            jumps.push([p2, `cls ${p2}()`]);
            st += `</div><div class="code">`;
            st += `${p1} = <span class="cls">${p2}</span>(`;
            st += p3.replace(/\n */gm, " ");
            st += ")</div>";
            return st;
        }
    ], [
        /\{\{desc\}\} ([^{]+)\n\n/gm,
        function(m, p1) {
            var st = `\u200a-=-./__desc__(${rngHex()})-=-\u200a`;
            st += ind(4) + trim(p1).replace(/\n */gm, " ") + "\n";
            return st;
        }
    ], [
        /\{\{fn\}\} (await )?(.+?)\.([\w\d_]+)\(([\w\d*_, \[\]]*?)\)(.*)\n\n/gm,
        function(m, p1, p4, p2, p3, p5) {
            if(p1 == undefined)
                p1 = "";
            else
                p1 = `await `;
            if(p5 == undefined)
                p5 = ""
            var st = `\n\n\u200a-=-/FN_${p2}/-=-\u200a-=-/FN_${p2}-=-\u200a<div class="head2">`;
            st += `~] ` + p1 + p2 + ` <span class="typ">{{fn}}</span>`;
            st += `</div><div class="code">`;
            var py = "";
            py += p1 + p4 + "." + p2 + "(";
            py += p3.replace(/\n */gm, " ") + ")" + p5;
            st += py_mark(py) + "</div>";
            return st;
        }
    ], [
        /\{\{bltin\}\} (.+?)\.(__[\w\d_]+__)\(([\w\d*_, \[\]]*?)\)\n\{\{usage\}\} (.*)\n\n/gm,
        function(m, p4, p2, p3, p5) {
            if(p5 == undefined)
                p5 = ""
            var st = `\n\n\u200a-=-/FN_${p2}/-=-\u200a-=-/FN_${p2}-=-\u200a<div class="head2">`;
            st += `\n\n~] ` + p2 + ` <span class="typ">{{fn}}</span>`;
            st += `</div><div class="note"><b>NOTE ] </b>This function is actually meant to be used as \``;
            st += `${p5}\` because it is a Python builtin function`;
            st += `</div><div class="code">`;
            st += py_mark(p5) + "</div>";
            return st;
        }
    ], [
        /\{\{sepfn\}\} (await )?([\w\d_]+)\(([\w\d*_, \[\]]*?)\)(.*)\n\n/gm,
        function(m, p1, p2, p3, p5) {
            if(p1 == undefined)
                p1 = "";
            else
                p1 = `await `;
            if(p5 == undefined)
                p5 = ""
            var st = `\n\n\u200a-=-/FN_${p2}/-=-\u200a-=-/FN_${p2}-=-\u200a<div class="head3">`;
            st += `~] ` + p1 + p2 + ` <span class="typ">{{fn}}</span>`;
            st += `</div><div class="code">`;
            var py = "";
            py += p1 + p2 + "(";
            py += p3.replace(/\n */gm, " ") + ")" + p5;
            st += py_mark(py) + "</div>";
            st += `<div class="warn"><b>NOTE ] </b>`;
            st += "This function is not part of any class";
            st += "</div>";
            return st;
        }
    ], [
        /\{\{clsfn\}\} (.*) = (await )?([\w\d_]+)\(([\w\d*_, \[\]]*?)\)(.*)\n\n/gm,
        function(m, p4, p1, p2, p3, p5) {
            if(p1 == undefined)
                p1 = "";
            else
                p1 = `<span class="aio">await</span> `;
            if(p5 == undefined)
                p5 = ""
            var st = `\n\n\u200a-=-/FN_${p2}/-=-\u200a-=-./FN_${p2}-=-\u200a<div class="head3">`;
            st += `\n\n~] ` + p1 + p2 + ` <span class="typ">{{fn}}</span>`;
            st += `</div><div class="code">`;
            var py = "";
            py += p4 + " = " + p1 + p2 + "(";
            py += p3.replace(/\n */gm, " ") + ")" + p5;
            st += py_mark(py) + "</div>";
            return st;
        }
    ], [
        /\{\{param\}\} (.+?) \[(.+?)\]\n([^%{]*)\n?/gm,
        function(m, p1, p2, p3) {
            var st = ""
            st += `\u200a-=-./params(${rngHex()})/-=-\u200a-=-./${p1}(${rngHex()})-=-\u200a`;
            p2 = p2.replace(/\n */gm, " ");
            st += `<span class="typ">{{param}}</span>`;
            st += ` <span class="var"><b>${p1}</b></span> [<span class="cls">${p2}</span>]\n`;
            if(p3 != undefined)
                st += ind(4) + trim(p3).replace(/\n */gm, "\n" + ind(4))
            st += "\n";
            return st;
        }
    ], [
        /\{\{prop\}\} (.+?) \[(.+?)\]\n([^%{]*)\n?/gm, 
        function(m, p1, p2, p3) {
            var st = ""
            st += `-=-./props(${rngHex()})/-=--=-./${p1}(${rngHex()})-=-`;
            st += `<span class="typ">{{prop}}</span>`;
            st += ` <span class="var"><b>${p1}</b></span> [<span class="cls">${p2}</span>]\n`;
            if(p3 != undefined)
                st += ind(4) + trim(p3).replace(/\n */gm, "\n" + ind(4))
            st += "\n";
            return st;
        }
    ], [
        /\{\{rtn\}\} \[(.+?)\]([^%{]*)\n\n/gm,
        function(m, p1, p2) {
            if(p2 == undefined)
                p2 = " ";
            if(p2 == "]") {
                p1 += "]";
                p2 = "";
            }
            p2 = p2.trim();
            var st = `-=-.../rtn(${rngHex()})-=-<span class="typ">{{rtn}}</span>`;
            st += ` [<span class="cls">${p1}</span>] ${p2}\n`;
            return st;
        }
    ], [
        /\{\{err\}\} \[(.+?)\] ([^%{]+)\n\n/gm,
        function(m, p1, p2) {
            var st = `-=-.../err(${rngHex()})-=-<span class="typ">{{err}}</span>`;
            st += ` [<span class="err">${p1}</span>] ${p2}\n`;
            return st;
        }
    ], [
        /\{\{note\}\} ([^%{]+)\n\n/gm,
        function(m, p1) {
            var st = `<div class="note"><b>NOTE ] </b>`
            st += p1.replace(/\n */gm, " ");
            st += `</div>`;
            return st;
        }
    ], [
        /\{\{warn\}\} ([^%{]+)\n\n/gm,
        function(m, p1) {
            var st = `<div class="warn"><b>WARNING ] </b>`
            st += p1.replace(/\n */gm, " ");
            st += `</div>`;
            return st;
        }
    ], [
        /\%n(\d+)\% ([^%{]+)\n\n/gm,
        function(m, p1, p2) {
            notes["\\%N" + p1 + "\\%"] = p2;
            console.log(notes);
            return "\n";
        }
    ], [
        /\{\{alias\}\} ([\w\d_]+)\n\n/gm,
        function(m, p1) {
            return `\u200c    <b>NOTE ] </b>An alias resides under \`${p1}</span>\`\n`;
        }
    ], [
        /\{\{norm\}\} (.+)\n\n/gm,
        function(m, p1) {
            return `\u200c    <b>NOTE ] </b>The default value is \`${p1}\`\n`;
        }
    ], [
        /\{\{reqd\}\}\n+/gm,
        `\\!1\n    <b>NOTE ] </b>This is required`
    ], [
        /\{\{optn\}\}\n+/gm,
        `\\!1\n    <b>NOTE ] </b>This is optional`
    ], [
        /\{\{pydesc\}\} (.+)\n\n/gm,
        function(m, p1) {
            var p2 = p1.split(" ").slice(1).join(" ") || " ";
            p1 = p1.split(" ")[0];
            try {
                return `-=-./__desc__(${rngHex()})-=-` + ind(4) + py_desc[p1] + p2 + "\n";
            } catch(err) {
                console.error(err)
                return "{{pydesc}} " + p1 + p2;
            }
        }
    ], [
        /\{\{noinit\}\}([^%{]*)\n\n+/gm,
        function(m, p1) {
            var st = `<div class="note"><b>NOTE ] </b>`;
            var def = 
                "This class shouldn't be initialized by hand. Don't do that. ";
            if(p1 != undefined) {
                if(p1.startsWith("+"))
                    st += def + " " + p1.replace(/\n */gm, " ").slice(1).trim();
                else
                    st += p1;
            } else {
                st += def;
            }
            st += "</div>";
            return st;
        }
    ], [
        /\`(.+?)`/gm, 
        function(m, p1) {
            var st = `<span class="code">`;
            st += py_mark(p1);
            st += `</span>`;
            return st;
        }
    ], [
        /\#\/(.*)"(.*)"(.*)\//gm,
        function(m, p1, p2, p3) {
            var st = `<button class="sct" onclick="loadBtn(this.id)"`;
            st += `id="JUMP_${p2}">`;
            st += "#" + p1 + p2 + p3 + "</button>";
            return st;
        }
    ], [
        /(discord|reddit|matrix)\.([.\w_]+)/gm, 
        function(m, p2, p1) {
            if(p1 == "discord" && p1.startsWith("gg"))
                return "discord." + p1;
            var st = `<button class="btn" onclick="loadBtn(this.id)"`;
            st += `id="${p2}/${p1.replace(/\./gm, "/")}.txt">`;
            var l = p2 + "." + p1;
            if(loc != "" && l.startsWith(loc) && loc == here) {
                l = "~." + p1;
            }
            if(l.startsWith("~.models."))
                l = p2 + "." + p1;
            st += l;
            st += "</button>";
            return st;
        }
    ], [
        /<<md>>((.|\n)+)<<\/md>>/gm,
        function(m, p1) {
            return mark_page(p1);
        }
    ], [
        /( {2,})/gm,
        function(m, p1) {
            return p1.replace(/ /gm, "\u200b \u200b");
        }
    ], [
        /\\n/gm,
        "\n"
    ]
]

function docs_mark(st) {
    var og = st;
    var tmp = findHtml("this-here").split("/prizmatic.docs/doc/")
    while(tmp[0] == "")
        tmp = tmp.slice(1);
    tmp[0] = tmp[0].split("/").slice(0, -1).join(".");
    globalThis.loc = tmp[0];
    globalThis.here = tmp[0];
    globalThis.current_obj = "";
    globalThis.notes = {}
    globalThis.jumps = [];
    if(st.startsWith("--top--"))
        st = st.slice(8); // Removes the "--top--"
    st = st.trim() + "\n\n";
    for(var r of docs_regex)
        st = st.replace(r[0], r[1]);
    var st2 = "";
    for(var i = 0; i < st.length - 1; i += 1) {
        if(st.slice(i, i + 2) == "\\!") {
            st2 = st2.slice(0, "-" + st[i + 2]);
            continue;
        }
        st2 += st[i];
    }
    st2 = st2.replace(/\\?!\d/gm, "");
    st = st2;
    var keys = notes.constructor.keys(notes);
    for(var n of keys)
        st = st.replace(RegExp(n, "gm"), notes[n]);
    for(var doc in links_to_docs)
        st = st.replace(
            RegExp(doc.replace(/\./gm, "\\."), "gm"), 
            `<a href="${links_to_docs[doc]}" target="_blank"><button class="btn">${doc}</button></a>`
        );
    st = st.trim().replace(/\n/gm, "<br>") + "<br>";
    
    st = getJmp(st);
    
    while(find("sect").children.length > 1) {
        var jmp = find("sect").children;
        for(var elm of jmp)
            if(elm.id.startsWith("JUMP_"))
                elm.remove();
    }
    for(var elm of jumps)
        find("sect").innerHTML += mkJmp(...elm);
    return st
}

function getJmp(st) {
    var level = 0;
    st = st.replace(/-=-(.+?)-=-/gm, function(m, p1) {
        var ts = "";
        var folder = true;
        if(p1.startsWith(".../")) {
            while(level > 1) {
                ts += "</div>";
                level -= 1;
            }
            p1 = p1.slice(4);
        }
        if(p1.startsWith("/")) {
            while(level > 0) {
                ts += "</div>";
                level -= 1;
            }
            p1 = p1.slice(1);
        }
        if(p1.startsWith("./")) {
            p1 = p1.slice(2);
        }
        ts += `<div`;
        if(p1.endsWith("/")) {
            level += 1;
            p1 = p1.slice(0, -1);
            ts += ` id="DROP_${p1}" class="collapser"`;
        } else {
            ts += ` id="JUMP_${p1}" class="lnk" `;
            folder = false;
        }
        ts += ` onclick="collapser(this)" onmouseover="setjump(this)">`;
        p1 = p1.replace(/\(.*\)/gm, "");
        ts += p1;
        if(!folder)
            ts += "</div>";
        return ts
    });
    while(level > 0) {
        st += "</div>";
        level -= 1;
    }
    return st;
}
