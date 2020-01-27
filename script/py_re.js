var cls = [
    "int", "float", "dict", "list",
    "tuple", "set", "bool", "None",
    "frozenset", "str", "bytes",
    "file", "type", "complex", "True",
    "range", "bytearray", "memoryview",
    "False", "range"
];

var kw = [
    "import", "from", "yield", "break", 
    "if", "assert",  "finally", "def",
    "elif", "else", "for", "while", "id",
    "with", "as", "in", "not", "and", 
    "or", "is", "super", "self", "global",
    "local", "try", "except", "pass",
    "continue", "break", "return",
    "del", "nonlocal", "lambda"
];

function str_regex(m, a, b, c) {
    var st = "";
    if(a == "f" || a == "F") {
        var incode = false;
        for(var d of c.split('')) {
            if(d == "{") {
                st += "</span>{";
                incode = true;
            } else if(d == "}") {
                st += '}<span class="str">';
                incode = false;
            } else if(incode) {
                st += d;
            } else {
                st += d+"\u200b";
            } 
        }
    } else {
        st = c.split('').join("\u200b");
    }
    return `<span class="str">${a}${b}${st}${b}</span>`;
}

py_regex = [
    [
        /([fFrRuUbB]?)(")(.*?)"/gm,
        str_regex
    ], [
        /([fFrRuUbB]?)(')(.*?)'/gm,
        str_regex
    ], [
        /([fFrRuUbB]?)(''')((.|\n)*)'''/gm,
        str_regex
    ], [
        /([fFrRuUbB]?)(""")((.|\n)*)"""/gm,
        str_regex
    ], [
        /\\u([A-Fa-f0-9\u200b]{8})/gm, 
        `<span class="op">\\u$1</span>`
    ], [
        /\\U([A-Fa-f0-9\u200b]{16})/gm, 
        `<span class="op">\\U$1</span>`
    ], [
        /\\x([A-Fa-f0-9\u200b]{4})/gm, 
        `<span class="op">\\x$1</span>`
    ], [
        /\\N\{([\w\d ]+)\}/gm, 
        `<span class="op">\\N{$1}</span..,>`
    ], [
        /\\(.)/gm, 
        `<span class="op">\\$1</span>`
    ], [
        /^([\u200b ]*)def ([\w\d_]+)/gm, 
        `$1<span class="kw">def</span> <span class="fn">$2</span>`
    ], [
        /__([\w\d_]+)__/gm,
        `<span class="op">__$1__</span>`
    ], [
        /^([\u200b ]*)class ([\w\d_]+)/gm,
        function(m, a, b) {
            cls.push(b);
            return `${a}<span class="kw">class</span> <span class="cls">${b}</span>`;
        }
    ], [
        /([\w\d_]+)([\(\[.])/gm,
        `<span class="fn">$1</span>$2`
    ], [
        /([^\u200b])\#(.*)$/gm,
        function(m, b, a) {
            return `${b}<span class="comm">#${a.split('').join('\u200b')}</span>`;
        }
    ], [
        /^\#(.*)$/gm,
        function(m, a) {
            return `<span class="comm">#${a.split('').join('\u200b')}</span>`;
        }
    ], [
        /(-?)(0x[A-Fa-f0-9\u200b]+)/gm,
        `<span class="var">$1$2</span>`
    ], [
        /([^\w])(\d+(\.\d+)?j?)/gm, 
        `<span class="var">$1$2</span>`
    ], [
        /^([\u200b ]*)\@([\d\w_.]+)/gm,
        `<span class="dec">$1@$2</span>`
    ], [
        /([\w\d_]*)(Error|Exception|Failure|Exit|Warning)/gm,
        `<span class="err">$1$2</span>`
    ], [
        /Stop([\w\d_]+)/gm,
        `<span class="err">Stop$1</span>`
    ]
];

function py_mark(st) {
    st = st.replace(/\n/gm, " \n");
    var sym = "[\\"+"\\.,:;()[]{}~|/-+=*^%&@ ".split('').join("\\")+"]";
    var gsym = "("+sym+")";
    for(var r of py_regex) {
        st = st.replace(r[0], r[1]);
    } for(var r of cls) {
        st = st.replace(
            RegExp("^"+r+gsym, "gm"),
            `<span class="cls">${r.split('').join('\u200b')}</span>$1`
        );
        st = st.replace(
            RegExp("("+sym+"|\n|[\u200b ]+)"+r+gsym, "gm"), 
            `$1<span class="cls">${r.split('').join('\u200b')}</span>$2`
        );
    } for(var r of kw) {
        st = st.replace(
            RegExp("^"+r+gsym, "gm"), 
            `<span class="kw">${r.split('').join('\u200b')}</span>$1`
        );
        st = st.replace(
            RegExp("("+sym+"|\n|[\u200b ]+)"+r+gsym, "gm"), 
            `$1<span class="kw">${r.split('').join('\u200b')}</span>$2`
        );
    } for(var r of ["await", "async"]) {
        st = st.replace(
            RegExp("^"+r+gsym, "gm"), 
            `<span class="aio">${r.split('').join('\u200b')}</span>$1`
        );
        st = st.replace(
            RegExp("("+sym+"|\n|[\u200b ]+)"+r+gsym, "gm"), 
            `$1<span class="aio">${r.split('').join('\u200b')}</span>$2`
        );
    }
    return st.replace(/([^ ])\u200b/gm, "$1").replace(/ +\n/gm, "\n");
}
