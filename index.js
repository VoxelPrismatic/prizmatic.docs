const fs = require('fs');

function open(filename) {
    fs.readFile(filename, (err, data) => { 
        if (err) throw err; 
        return data.toString();
    })
}
function grab_dirs(lvl) {
    var dirs = [];
    for(var line of open(lvl+"/dir.txt").split("\n")) {
        if(line.endsWith(".txt")) {
            dirs.append(line);
        } else if(line != "") {
            try {
                grab_dirs(lvl+"/"+line);
            } catch(err) {}
        }
    }
    return dirs;
}
dirs = grab_dirs("./doc");
url = document.URL;
if(url.contains("#")) {
    var fil = "./doc/"+url.split("#")[-1].replace(/\.txt/g, "&").replace(/\./g, "/").replace(/\&/g, ".txt");
} else {
    var fil = "./doc/index.txt";
} if (!(fil.endswith(".txt")) {
    fil += ".txt";
} if (!(dirs.contains(fil)) {
    fil += "index.txt";
} if (!(dirs.contains(fil)) {
    document.getElementById("page").innerHTML = `<div class="warn">404 ] File not found</div>`;
} else {
    txt open(fil);
    chars = [
        ["\\\\n", ""],
        ["&", "&amp;"],
        [">", "&gt;"],
        ["<", "&lt;"]
    ]
    for(var ls of chars) {
        k = ls[0];
        v = ls[1];
        while(txt.contains(k)) {
            txt = txt.replace(k, v);
        }
    }
    txt = txt.replace(/\\U([A-Fa-f0-9]{16})/gm, "\\u{$1}")
    reps = [
        [/^(\#+)(.+)$/gm, "<div class='head'>$1$2</div>"],
        [/\[(.+)\]\(.+)\)/gm, "<a href='$2'>$1</a>"],
        [/\[\[(.+)\]\]\((.+)\)/gm, "<a href='$2'><div class='lnk'>$1</div></a>"],
        [/\%(.+)\%/gm, "<b>$1</b>"],
        [/\*(.+)\*/gm, "<i>$1</i>"],
        [/\_(.+)\_/gm, "<u>$1</u>"],
        [/\~(.+)\~/gm, "<s>$1</s>"],
        [/^WARN---$/gm, "<div class='warn'><b>WARNING ---</b><br>"],
        [/^NOTE---$/gm, "<div class='note'><b>NOTICE ---</b><br>"],
        [/^NEW---$/gm, "<div class='new'><b>NEW ---</b><br>"],
        [/^INFO---$/gm, "<div class='info'><b>INFO ---</b><br>"],
        [/^EX---$/gm, "<div class='exc'><b>EXAMPLES ---</b><br>"],
        [/^CODE---$/gm, "<div class='code'>"],
    ]
    for(var rep of reps)
