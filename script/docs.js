function ind(num) {
    var st = "";
    for(var i = 0; i < num; i++)
        st += "\u200b \u200b";
    return st;
}

function mkJmp(nam, show = "") {
    if(show == "")
        show = nam;
    return `<div class="lnk" id="JUMP_${nam}" onclick="jump(this);">#${show}</div>`;
}

var props = false;
var params = false;
var py_desc = {
    "__repr__": "Returns the 'Python Correct' name string",
    "__dict__": "Returns the 'send-ready' object",
};
var notes = {};
var jumps = [];
var loc = "";
var docs_regex = [
    [
        /\{\{loc\}\} (.+?)\n\n+/gm,
        function(m, p1) {
            loc = p1;
            return "";
        }
    ], [
        /\{\{cls\}\} (.+?) = (.+?)\(([\w\d*_, \n]*)\)\n\n+/gm,
        function(m, p1, p2, p3) {
            var st = `<div id="top"></div><div id="${p2}" class="head1">`;
            st += `#] ` + p2 + ` <span class="typ">{{cls}}</span>`;
            jumps.push([p2, `cls ${p2}()`]);
            st += `</div><div class="code">`;
            st += `${p1} = <span class="cls">${p2}</span>(`;
            st += p3.replace(/\n */gm, " ");
            st += ")</div>";
            return st;
        }
    ], [
        /\{\{subcls\}\} \[(.+)\] (.+?) = (.+?)\(([\w\d*_, ]*)\)\n\n+/gm,
        function(m, p4, p1, p2, p3) {
            var st = `<div id="top"></div><div id="${p2}" class="head1">`;
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
            return ind(4) + trim(p1).replace(/\n */gm, "\n" + ind(4)) + "\n";
        }
    ], [
        /\{\{fn\}\} (await )?(.+?)\.([\w\d_]+)\(([\w\d*_, \n]*)\)(.*)\n\n+/gm,
        function(m, p1, p4, p2, p3, p5) {
            if(p1 == undefined)
                p1 = "";
            else
                p1 = `await `;
            if(p5 == undefined)
                p5 = ""
            var st = `\n\n<div id="${p2}" class="head2">`;
            jumps.push([p2, `fn ${p2}()`]);
            st += `~] ` + p1 + p2 + ` <span class="typ">{{fn}}</span>`;
            st += `</div><div class="code">`;
            var py = "";
            py += p1 + p4 + "." + p2 + "(";
            py += p3.replace(/\n */gm, " ") + ")" + p5;
            st += py_mark(py) + "</div>";
            return st;
        }
    ], [
        /\{\{bltin\}\} (.+?)\.(__[\w\d_]+__)\(([\w\d*_, ]*)\)\n\{\{usage\}\} (.*)\n\n+/gm,
        function(m, p4, p2, p3, p5) {
            if(p5 == undefined)
                p5 = ""
            var st = `\n\n<div id="${p2}" class="head2">`;
            jumps.push([p2, `fn ${p2}()`]);
            st += `~] ` + p2 + ` <span class="typ">{{fn}}</span>`;
            st += `</div><div class="note"><b>NOTE ] </b>This function is actually meant to be used as \``;
            st += `${p5}\` because it is a Python builtin function`;
            st += `</div><div class="code">`;
            st += py_mark(p5) + "</div>";
            return st;
        }
    ], [
        /\{\{sepfn\}\} (await )?([\w\d_]+)\(([\w\d*_, \n]*)\)(.*)\n\n+/gm,
        function(m, p1, p2, p3, p5) {
            if(p1 == undefined)
                p1 = "";
            else
                p1 = `await `;
            if(p5 == undefined)
                p5 = ""
            var st = `\n\n<div id="${p2}" class="head3">`;
            st += `~] ` + p1 + p2 + ` <span class="typ">{{fn}}</span>`;
            st += `</div><div class="code">`;
            var py = "";
            jumps.push([p2, `fn ${p2}()`]);
            py += p1 + p2 + "(";
            py += p3.replace(/\n */gm, " ") + ")" + p5;
            st += py_mark(py) + "</div>";
            st += `<div class="warn"><b>NOTE ] </b>`;
            st += "This function is not part of any class";
            st += "</div>";
            return st;
        }
    ], [
        /\{\{clsfn\}\} (.*) = (await )?([\w\d_]+)\(([\w\d*_, \n]*)\)(.*)\n\n+/gm,
        function(m, p4, p1, p2, p3, p5) {
            if(p1 == undefined)
                p1 = "";
            else
                p1 = `<span class="aio">await</span> `;
            if(p5 == undefined)
                p5 = ""
            var st = `\n\n<div id="${p2}" class="head3">`;
            st += `~] ` + p1 + p2 + ` <span class="typ">{{fn}}</span>`;
            st += `</div><div class="code">`;
            var py = "";
            jumps.push([p2, `fn ${p2}()`]);
            py += p4 + " = " + p1 + p2 + "(";
            py += p3.replace(/\n */gm, " ") + ")" + p5;
            st += py_mark(py) + "</div>";
            return st;
        }
    ], [
        /\{\{param\}\} (.+?) \[(.+)\]\n([^{]*)\n+/gm,
        function(m, p1, p2, p3) {
            var st = ""
            if(!params) {
                st += `<div id="params"></div>`;
                jumps.push(["params", ""]);
                params = true;
            }
            st += `<span class="typ">{{param}}</span>`;
            st += ` <span class="var"><b>${p1}</b></span> [<span class="cls">${p2}</span>]\n`;
            st += ind(4) + trim(p3).replace(/\n */gm, "\n" + ind(4)) + "\n";
            return st;
        }
    ], [
        /\{\{prop\}\} (.+?) \[(.+)\]\n([^{]*)\n+/gm, 
        function(m, p1, p2, p3) {
            var st = ""
            if(!props) {
                st += `<div id="props"></div>`;
                jumps.push(["props", ""]);
                props = true;
            }
            st += `<span class="typ">{{prop}}</span>`;
            st += ` <span class="var"><b>${p1}</b></span> [<span class="cls">${p2}</span>]\n`;
            st += ind(4) + trim(p3).replace(/\n */gm, "\n" + ind(4)) + "\n";
            return st;
        }
    ], [
        /\{\{rtn\}\} \[(.+?)\] ([^{]*)\n\n/gm,
        function(m, p1, p2) {
            var st = `<span class="typ">{{rtn}}</span>`;
            st += ` [<span class="cls">${p1}</span>] ${p2}\n`;
            return st;
        }
    ], [
        /\{\{err\}\} \[(.+?)\] ([^{]+)\n\n/gm,
        function(m, p1, p2) {
            var st = `<span class="typ">{{err}}</span>`;
            st += ` [<span class="err">${p1}</span>] ${p2}\n`;
            return st;
        }
    ], [
        /\{\{note\}\} ([^{]+)\n\n/gm,
        function(m, p1) {
            var st = `<div class="note"><b>NOTE ] </b>`
            st += p1.replace(/\n */gm, " ");
            st += `</div>`;
            return st;
        }
    ], [
        /\{\{warn\}\} ([^{]+)\n\n/gm,
        function(m, p1) {
            var st = `<div class="warn"><b>WARNING ] </b>`
            st += p1.replace(/\n */gm, " ");
            st += `</div>`;
            return st;
        }
    ], [
        /dis\.mod\./gm,
        `discord.models.`
    ], [
        /\~\//gm, 
        `discord.models.`
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
        loc + "."
    ], [
        /discord\.([.\w_]+)/gm, 
        function(m, p1) {
            if(p1.startsWith("gg"))
                return "discord." + p1;
            var st = `<button class="btn" onclick="btnload(this.id)"`;
            st += `id="discord/${p1.replace(/\./gm, "/")}.txt">`;
            var l = "discord." + p1;
            if(l.startsWith(loc)) {
                l = "~." + p1;
            } else if (l.startsWith(loc.split(".").slice(0, -1).join("."))) {
                l = "~.." + p1;
            }
            st += l;
            st += "</button>";
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
        /\n\%n(\d+)\% ([^%{]+)\n+/gm,
        function(m, p1, p2) {
            notes["\\%N" + p1 + "\\%"] = p2;
            return "\n";
        }
    ], [
        /\{\{alias\}\} ([\w\d_]+)\n+/gm,
        function(m, p1) {
            return `<b>NOTE ] </b>An alias resides under '${p1}'</div>`;
        }
    ], [
        /\{\{norm\}\} (.+)\n+/gm,
        function(m, p1) {
            return `<b>NOTE ] </b>The default value is <span class="code">${p1}</span>`;
        }
    ], [
        /\{\{pydesc\}\} (.+)\n\n+/gm,
        function(m, p1) {
            try {
                return ind(4) + py_desc[p1];
            } catch(err) {
                console.error(err)
                return "{{pydesc}} " + p1;
            }
        }
    ], [
        /\{\{noinit\}\}([^{]*)\n\n+/gm,
        function(m, p1) {
            var st = `<div class="note"><b>NOTE ] </b>`;
            var def = "This class shouldn't be initialized by hand. Don't do that.";
            if(p1 != undefined) {
                if(p1.startsWith("+"))
                    st += def + " " + p1.slice(1).trim();
                else
                    st += p1;
            } else {
                st += def;
            }
            st += "</div>";
            return st;
        }
    ]
]

function docs_mark(st) {
    jumps = [];
    loc = "";
    props = false;
    params = false;
    st = st.slice(8); // Removes the "--top--"
    st = st.trim() + "\n\n";
    for(var r of docs_regex)
        st = st.replace(r[0], r[1]);
    var keys = notes.constructor.keys(notes);
    for(var n of keys)
        st = st.replace(RegExp(n, "gm"), notes[n]);
    st = st.trim().replace(/\n/gm, "<br>") + "<br>";
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
