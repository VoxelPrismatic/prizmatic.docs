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

gsd = " an item as if this class as if it were a "

var py_desc = {
    "__repr__": "Returns the 'Python Correct' name string",
    "__dict__": "Returns the 'send-ready' object",
    "__iter__": "Makes a generator ",
    "__next__": "Allows you to iterate through ",
    "__list__": "Returns a list of ",

    "__getitem__": "Get" + gsd,
    "__setitem__": "Set" + gsd,
    "__delitem__": "Delete" + gsd,

    "__getitemL__": "Get" + gsd + "list",
    "__setitemL__": "Set" + gsd + "list",
    "__delitemL__": "Delete" + gsd + "list",

    "__getitemD__": "Get" + gsd + "dict",
    "__setitemD__": "Set" + gsd + "dict",
    "__delitemD__": "Delete" + gsd + "dict"
};

var notes = {};
var jumps = [];
var loc = "";
var here = "";

let py_site = "https://docs.python.org/3/library/";
let ahttp_site = "https://docs.aiohttp.org/en/stable/";
let py_modules = [
    "io.BytesIO",
    "datetime.datetime",
    'io.IOBase'
];
// ^ Updated when necessary, ofc I won't list every single python module
var links_to_docs = {
    "aiohttp.ClientSession": ahttp_site + "client_reference.html#client-session"
};
for(var module of py_modules) {
    links_to_docs[module] = py_site + module.split(".")[0] + ".html#" + module;
}

var current_obj = "";

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
            var st = `<div id="top"></div>`;
            st += `\0-=-/CLS ${p2}/-=-\0-=-./CLS ${p2}-=-\0<div class="head1">`;
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
            var st = `<div id="top"></div>\0-=-/SUBCLS ${p2}/-=-\0-=-./SUBCLS ${p2}-=-\0`;
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
            var st = `\0-=-.../desc(${rngHex()})-=-\0`;
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
            var st = `\n\n\0-=-/FN ${p2}/-=-\0-=-./FN ${p2}-=-\0<div class="head2">`;
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
            var st = `\n\n\0-=-/FN ${p2}/-=-\0-=-./FN ${p2}-=-\0<div class="head2">`;
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
            var st = `\n\n\0-=-/FN ${p2}/-=-\0-=-./FN ${p2}-=-\0<div class="head3">`;
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
            var st = `\n\n\0-=-/FN ${p2}/-=-\0-=-./FN_${p2}-=-\0<div class="head3">`;
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
            st += `\0-=-.../params(${rngHex()})/-=-\0-=-./${p1}(${rngHex()})-=-\0`;
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
            var st = `\0-=-.../prop(${rngHex()})/-=-\0-=-./${p1}(${rngHex()})-=-\0`;
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
            var st = `\0-=-.../rtn(${rngHex()})/-=-\0-=-./${p1}(${rngHex()})-=-\0`;
            st += `<span class="typ">{{rtn}}</span>`;
            st += ` [<span class="cls">${p1}</span>] ${p2}\n`;
            return st;
        }
    ], [
        /\{\{err\}\} \[(.+?)\] ([^%{]+)\n\n/gm,
        function(m, p1, p2) {
            var st = `\0-=-.../err(${rngHex()})/-=-\0-=-./${p1}(${rngHex()})-=-\0`;
            st += `<span class="typ">{{err}}</span>`;
            st += ` [<span class="err">${p1}</span>] ${p2}\n`;
            return st;
        }
    ], [
        /\{\{notdone\}\}/gm,
        `{{note}} This class is not completely finished`
    ], [
        /\{\{nodocs\}\}/gm,
        `{{note}} The documentation for this class is not complete`
    ], [
        /\{\{noexist\}\}/gm,
        `{{note}} This class doesn't actually exist yet`
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
                var st = `\0-=-.../__doc__(${rngHex()})-=-\0` ;
                st += ind(4) + py_desc[p1] + p2 + "\n";
                return st;
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
                l = p2 + ".models." + p1.split(".").slice(-1)[0];
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
    globalThis.notes = {};
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

    return st
}

function getJmp(st) {
    var level = 0;
    var jmp = {"": []};
    var lvl = [];
    var prevlvl = [];
    var lastlvl = "";
    for(var line of st.split("\0")) {
        if(!line.startsWith("-=-") || !line.endsWith("-=-"))
            continue;
        line = line.slice(3, -3);
        if(line.startsWith(".../")) {
            line = line.slice(4);
            lvl = lvl.slice(0, 1);
        }
        if(line.startsWith("/")) {
            line = line.slice(1);
            lvl = [];
        }
        if(line.startsWith("./")) {
            line = line.slice(2);
        }
        if(line.endsWith("/")) {
            line = line.slice(0, -1);
            if(line.replace(/\(.*\)/gm, "") != lastlvl.replace(/\(.*\)/gm, "")) {
                lvl.push(line);
                jmp[lvl.join("/")] = [];
            } else {
                lvl = prevlvl;
            }
            lastlvl = line;
        } else {
            jmp[lvl.join("/")].push(line);
        }
        prevlvl = lvl;
    }
    var layout = "";
    var lastkey = "";
    var level = 0;
    for(var key of jmp.constructor.keys(jmp)) {
        if(key != "") {
            var thisdirs = key.split("/");
            var lastdirs = lastkey.split("/");
            if(thisdirs.length <= lastdirs.length) {
                for(var i = 0; i < lastdirs.length; i += 1) {
                    if(thisdirs[i] != lastdirs[i]) {
                        layout += "</div>";
                        level -= 1;
                    }
                }
            }
            layout += Elm(
                "div", thisdirs.slice(-1)[0].replace(/\(.*?\)/gm, ""),
                {id: "DROP_" + key, class: "collapser", onclick: "collapser(this)",
                 onmouseover: "setjump(this)"},
                false
            );
            level += 1;
        }
        for(var lnk of jmp[key]) {
            layout += Elm(
                "div", lnk.replace(/\(.*?\)/gm, ""),
                {id: "JUMP_" + lnk, class: "lnk", onclick: "collapser(this)",
                 onmouseover: "setjump(this)"}
            );
        }
        lastkey = key;
    }
    for(var x = 0; x < level; x += 1) {
        layout += "</div>";
    }
    remJumps();
    addHtml("sect", layout);
    collall(find("sect"));
    st = st.replace(/\u0000*-=-\.*\/?(.+?)\/?-=-\u0000*/gm, `<div id="$1"></div>`);
    return st;
}
