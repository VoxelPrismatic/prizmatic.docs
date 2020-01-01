function grab_dirs(lvl = "/prizmatic.docs/doc") {
    var dirs = [];
    var lines = read(lvl + "/dir.txt").split("\n");
    for(var line of lines) {
        if(line.endsWith(".txt")) {
            lnk = lvl+"/"+line;
            var smol = lnk.slice(19);
            dirs.push(lnk);
            if(lnk.endsWith("index.txt")) {
                lnk = lnk.replace("index.txt", "");
                var smol = lnk.slice(19);
            } else {
                nam = smol.slice(15);
                fil = lvl+"/"+line;
                find("nav").innerHTML += mkElm("div", smol, {id:fil, onclick:"docs(this);", class: "lnk"})
            }
        } else if(line != "") {
            try {
                if(line.endsWith(".dir")) 
                    line = line.slice(0, -4);
                for(var name of grab_dirs(lvl+"/"+line))
                    dirs.push(name);
            } catch(err) {
                console.log(err);
            }
        }
    }
    return dirs;
}
