let fixes = 0;
let result = null;

class Lexer {
    constructor(s) {
        this.s = s;
        this.offset = 0;
    }

    static is_digit(c) {
        return c >= "0" && c <= "9";
    }

    chop_number() {
        let r = "";

        for (let i = this.offset; i < this.s.length; i++) {
            const c = this.s[i];
            if (Lexer.is_digit(c)) {
                r += c;
            } else if (c === "०" || c === "o" || c === "о") {
                r += "0";
            } else if (c === "," || c === ".") {
                r += ".";
            } else break;
        }

        this.offset += r.length;
        return [r.length > 0, r];
    }

    chop_punct() {
        if (this.offset >= this.s.length) return [false, null];
        const c = this.s[this.offset++];
        return [true, c];
    }

    next_token() {
        if (this.offset >= this.s.length) return {
            type: "eof"
        };
        
        let [ok, x] = this.chop_number();
        if (ok) return {
            type: "number",
            value: x
        };

        [ok, x] = this.chop_punct();
        if (ok) return {
            type: "punct",
            value: x
        };

        return {
            type: "unknown",
            value: this.s[this.offset]
        };
    }

    expect_type(type) {
        const t = this.next_token();
        if (t.type !== type) {
            console.log(`LINE "${this.s}"`);
            console.log(`ERROR: Expected type "${type}", but got "${t.type}"`);
            return [false, null];
        }
        return [true, t.value];
    }

    expect_punct(value) {
        const t = this.next_token();
        if (t.type === "punct" && t.value === value) {
            return true;
        }
        console.log(`LINE "${this.s}"`);
        console.log(`ERROR: Expected punct "${value}", but got "${t.value}" of type "${t.type}"`);
        return false;
    }
};

function parse_lit(lexer) {
    let [ok, x] = lexer.expect_type("number");
    if (!ok) return [false, null];
    
    const dot = x.indexOf(".");
    if (x.indexOf(".", dot+1) !== -1) {
        console.log("NUMBER ", x);
        console.log("ERROR: More than one comma, not sure how to process, skipping");
        return [false, null];
    }
    
    if (dot !== -1 && x.length - dot - 1 > 3 && x[dot+1] === "1") {
        console.log("NUMBER ", x);
        console.log("FIX: 4 digits after comma, so removing first digit (misinterpreted as 1 from comma)");
        fixes++;
        x = x.slice(0, dot+1) + x.slice(dot+2);
        return [true, +x];
    }

    if (dot === -1 && x.length > 3) {
        console.log("NUMBER ", x);
        if (x[1] === "1") {
            console.log("FIX: Digit count > 3, so `,` misinterpreted as `1`");
            fixes++;
            x = x.slice(0, 1) + "." + x.slice(2);
            return [true, +x];
        } else {
            console.log("ERROR: Digit count > 3, but second digit is not `1` so idk");
            return [false, null];
        }
    }

    return [true, +x];
}

function parse_expr(lexer) {
    let [ok, x] = parse_lit(lexer);
    if (!ok) return [false, null];

    while (true) {
        const t = lexer.next_token();
        
        if (t.type === "eof") break;

        if (t.type !== "punct") {
            console.log(`LINE "${lexer.s}"`);
            console.log(`ERROR: Unexpected token "${t.value}" of type "${t.type}"`);
            return [false, null];
        }

        if (t.value === "+") {
            let y;
            [ok, y] = parse_lit(lexer);
            if (!ok) return [false, null];
            x += y;
            
            continue;
        } else if (t.value === "-") {
            let y;
            [ok, y] = parse_lit(lexer);
            if (!ok) return [false, null];
            x -= y;

            continue;
        }

        console.log(`LINE "${lexer.s}"`);
        console.log(`ERROR: Unexpected punct "${t.value}", expected "+" or "-"`);
        return [false, null];        
    }

    return [true, x];
}

function parse_line(line) {
    const l = new Lexer(line);
    let [ok, code] = l.expect_type("number");
    if (!ok) return [false, null];

    if (!l.expect_punct("-")) return [false, null];

    let count;
    [ok, count] = parse_expr(l);
    if (!ok) return [false, null];
    
    return [true, [code, count]];
}

function parse_lines(text) {
    const lines = text.split("\n");

    let correct_lines = 0;
    let codes = {};
    for (const line of lines) {
        let [ok, p] = parse_line(line);
        if (ok) {
            correct_lines++;
            const [code, count] = p;
            if (code in codes) {
                codes[code] += count;
            } else {
                codes[code] = count;
            }
        }
    }

    let rs = [];
    for (const code in codes) {
        rs.push(`${code};${codes[code].toFixed(3)}`);
    }

    console.log(`Lines ${lines.length}, Correct lines ${correct_lines}`);
    console.log(`Fixes ${fixes}, Incorrect lines ${lines.length - correct_lines}`);

    return rs.join("\n");
}

function download_result() {
    if (!result) return;
    const blob = new Blob([result], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "result.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.getElementById("btn-process").addEventListener("click", () => {
    const text = document.getElementById("textarea-input").value;
    fixes = 0;
    result = parse_lines(text);
    document.getElementById("textarea-output").value = result;
});

document.getElementById("btn-download").addEventListener("click", () => {
    download_result();
});
