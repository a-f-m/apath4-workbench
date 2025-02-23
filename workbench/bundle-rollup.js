(function (fs, path) {
    'use strict';

    /**
     * errors during run time
     */
    class ParseError extends Error {
        constructor(message) {
            super(message);
            this.name = 'ParseError';
        }
    }
    /**
     * errors during run time
     */
    class AnalyseError extends Error {
        constructor(message) {
            super(message);
            this.name = 'AnalyseError';
        }
    }
    /**
     * errors during transpilation
     */
    class TranspilationError extends Error {
        constructor(message) {
            super(message);
            this.name = 'TranspilationError';
        }
    }
    function cause_mess(message, cause) {
        return `${message}${cause === undefined ? '' : ` (cause: ${cause})`} `;
    }
    /**
     * general errors
     */
    class ApathError extends Error {
        constructor(message, cause) {
            super(cause_mess(message, cause));
            this.name = 'ApathError';
        }
    }
    function gather_issues(root, issue_kind) {
        let messages = [];
        trav(root, (expr) => {
            const loc = expr.loc;
            let s = '';
            const issues = issue_kind === 'errors' ? expr.data?.errors : expr.data?.warnings;
            if (issues) {
                s += ` ${issues} (at location ${loc?.start.line}:${loc?.start.column})`;
                messages.push(s);
            }
        });
        return messages;
    }

    /**
     * Utilities
     * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
     */
    /** */
    function write_file(file_path, content) {
        const r = path.resolve(file_path);
        fs.writeFileSync(r, content);
        return `file://${r}`;
    }
    function valid_url(s) {
        try {
            const url = new URL(s);
            return true;
        }
        catch (_) {
            return false;
        }
    }
    function remove_exports(txt) {
        return txt.replaceAll(new RegExp('\\n\\s*export\\s+', 'g'), '\n');
    }
    function async_func(f) {
        return f.constructor.name === 'AsyncFunction' || f.constructor.name === 'AsyncGeneratorFunction';
    }
    function is_string(x, alsoString = false) {
        return alsoString ? typeof x === 'string' || x instanceof String : typeof x === 'string';
    }
    function is_object(x) {
        return x !== undefined && x.constructor.name === "Object";
    }
    function is_primitive(x) {
        return !(typeof x == 'object' || typeof x == 'function');
    }
    function escape_quote(x) {
        return x.replace("'", "\\'");
    }
    function escape_regex(x) {
        const regexc = '(\\.|\\+|\\*|\\?|\\^|\\$|\\(|\\)|\\[|\\]|\\{|\\}|\\||\\\\)';
        return x.replaceAll(new RegExp(regexc, 'g'), '\\$1');
    }
    function replace_marker_in_file(file, begin_marker, end_marker, replacement) {
        let s = fs.readFileSync(file, { encoding: 'utf-8' });
        s = replace_marker(s, begin_marker, end_marker, replacement);
        fs.writeFileSync(file, s);
    }
    function replace_in_file(file, regex, replacement) {
        let s = fs.readFileSync(file, { encoding: 'utf-8' });
        s = s.replace(new RegExp(regex, 'gms'), replacement);
        fs.writeFileSync(file, s);
    }
    function replace_marker(s, begin_marker, end_marker, replacement) {
        return s.replace(new RegExp(`${begin_marker}.*?${end_marker}`, 'gms'), `${begin_marker}${replacement}${end_marker}`);
    }
    function replace_mult_in_file(file, repl_list) {
        let doc = fs.readFileSync(file, { encoding: 'utf-8' });
        for (const x of repl_list)
            doc = doc.replace(new RegExp(x.regex, 'gms'), x.repl);
        fs.writeFileSync(file, doc);
    }
    function walk_files(dir, path_regex, func, recursive = false) {
        const items = fs.readdirSync(dir, { recursive: recursive });
        for (const item of items) {
            //!!!test
            // if (item.includes('language')) {
            //     console.log()
            // }
            const path = (dir + '/' + item).replaceAll('\\', '/');
            if (path.match(path_regex))
                func(path);
        }
    }
    /** de-indent tick strings */
    function ind_(i, s) {
        let match = s.match(new RegExp('^\n(\\s*).*', 'm'));
        if (match)
            return s.replaceAll('\n' + match[1], '\n' + ' '.repeat(i));
        else
            throw new ApathError('bad ind_');
    }
    function trunc(s, n) {
        return (s.length > n) ? s.slice(0, n - 1) + '...' : s;
    }
    function encode_object(x) {
        return btoa(JSON.stringify(x, null, 3)).replaceAll('+', '_1').replaceAll('/', '_2').replaceAll('=', '_3');
    }
    function decode_to_object(s) {
        return JSON.parse(atob(s.replaceAll('_1', '+').replaceAll('_2', '/').replaceAll('_3', '=')));
    }
    class Stack {
        raw_stack = [];
        constructor() {
        }
        top() {
            return this.raw_stack[this.raw_stack.length - 1];
        }
        push(x) {
            return this.raw_stack.push(x);
        }
        pop() {
            return this.raw_stack.pop();
        }
        contains(x) {
            return this.raw_stack.includes(x);
        }
        // public find(predicate: (value: T, index: number, obj: T[]) => value is T, thisArg?: any): T | undefined {
        find(predicate) {
            // this.raw_stack.find((x) => x !== undefined)
            return this.raw_stack.find(predicate);
        }
        size() {
            return this.raw_stack.length;
        }
        get(i) {
            return this.raw_stack[i];
        }
    }

    var Utils_ = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Stack: Stack,
        async_func: async_func,
        decode_to_object: decode_to_object,
        encode_object: encode_object,
        escape_quote: escape_quote,
        escape_regex: escape_regex,
        ind_: ind_,
        is_object: is_object,
        is_primitive: is_primitive,
        is_string: is_string,
        remove_exports: remove_exports,
        replace_in_file: replace_in_file,
        replace_marker: replace_marker,
        replace_marker_in_file: replace_marker_in_file,
        replace_mult_in_file: replace_mult_in_file,
        trunc: trunc,
        valid_url: valid_url,
        walk_files: walk_files,
        write_file: write_file
    });

    /**
     * adt (algebraic data type) for apath
     *
     * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
     */
    //################################### (algebraic data type) #####################################
    // redundant string equivalent for better json form
    var Adt;
    (function (Adt) {
        Adt["EmptyLeft"] = "EmptyLeft";
        Adt["Filter"] = "Filter";
        Adt["Subscript"] = "Subscript";
        Adt["VariableBindingNode"] = "VariableBindingNode";
        Adt["Empty"] = "Empty";
        Adt["Property"] = "Property";
        Adt["PropertyRegex"] = "PropertyRegex";
        Adt["PropertyExpression"] = "PropertyExpression";
        Adt["Path"] = "Path";
        Adt["AasStep"] = "AasStep";
        Adt["Literal"] = "Literal";
        Adt["Children"] = "Children";
        Adt["Self"] = "Self";
        Adt["ApathFuncDef"] = "ApathFuncDef";
        Adt["FuncCall"] = "FuncCall";
        Adt["ArgumentList"] = "ArgumentList";
        // construction
        Adt["ObjectExpression"] = "ObjectExpression";
        Adt["PropertyAssignmentList"] = "PropertyAssignmentList";
        Adt["NamedAssignment"] = "NamedAssignment";
        Adt["None"] = "None";
        Adt["EmbeddingExpression"] = "EmbeddingExpression";
        Adt["PropertyNameExpression"] = "PropertyNameExpression";
        Adt["ArrayExpression"] = "ArrayExpression";
        Adt["ElementList"] = "ElementList";
        // expression
        Adt["SequencedExpressions"] = "SequencedExpressions";
        Adt["BlockExpression"] = "BlockExpression";
        Adt["Declarations"] = "Declarations";
        Adt["DeclarationExpression"] = "DeclarationExpression";
        Adt["VariableBinding"] = "VariableBinding";
        Adt["Conditional"] = "Conditional";
        Adt["ComparisonExpression"] = "ComparisonExpression";
        Adt["BinaryArithmeticExpression"] = "BinaryArithmeticExpression";
        Adt["UnaryArithmeticExpression"] = "UnaryArithmeticExpression";
        Adt["BinaryLogicalExpression"] = "BinaryLogicalExpression";
        Adt["UnaryLogicalExpression"] = "UnaryLogicalExpression";
        Adt["VariableApplication"] = "VariableApplication";
    })(Adt || (Adt = {}));
    const empty = { type: Adt.Empty };
    var OpCmp;
    (function (OpCmp) {
        OpCmp["eq"] = "==";
        OpCmp["neq"] = "!=";
        OpCmp["gt"] = ">";
        OpCmp["lt"] = "<";
        OpCmp["ge"] = ">=";
        OpCmp["le"] = "<=";
    })(OpCmp || (OpCmp = {}));
    var OpArith;
    (function (OpArith) {
        OpArith["plus"] = "+";
        OpArith["minus"] = "-";
        OpArith["times"] = "*";
        OpArith["div"] = "/";
        OpArith["mod"] = "%";
        OpArith["power"] = "**";
    })(OpArith || (OpArith = {}));
    var BinaryOpBool;
    (function (BinaryOpBool) {
        BinaryOpBool["and"] = "and";
        BinaryOpBool["or"] = "or";
    })(BinaryOpBool || (BinaryOpBool = {}));
    var UnaryOp;
    (function (UnaryOp) {
        UnaryOp["not"] = "not";
        UnaryOp["plus"] = "+";
        UnaryOp["minus"] = "-";
    })(UnaryOp || (UnaryOp = {}));
    var op_map_strict = { '==': '===', '!=': '!==', 'and': '&&', 'or': '||', 'not': '!' };
    function op_map(s) {
        const o = op_map_strict[s];
        return o ? o : s;
    }
    function trav(expr, pre_op, post_op, expr_stack = new Stack()) {
        pre_op?.(expr, expr_stack);
        expr_stack.push(expr);
        for (const key in expr) {
            const sub_expr = expr[key.toString()];
            if (sub_expr) {
                if (sub_expr.type)
                    trav(sub_expr, pre_op, post_op, expr_stack);
                if (Array.isArray(sub_expr)) {
                    for (const s of sub_expr) {
                        trav(s, pre_op, post_op, expr_stack);
                    }
                }
            }
        }
        expr_stack.pop();
        post_op?.(expr, expr_stack);
    }
    function tlist_to_array(l, type, a = []) {
        if (l !== null) {
            if (l.left && l.type === type) {
                tlist_to_array(l.left, type, a);
                a.push(l.right);
            }
            else {
                if (l.type !== Adt.EmptyLeft)
                    a.push(l);
            }
        }
        return a;
    }
    function with_empty_left(expr, parent, ignore = false) {
        if (ignore)
            return expr;
        if (expr.type === parent)
            return expr;
        else
            return {
                type: parent,
                left: {
                    type: Adt.EmptyLeft
                },
                right: expr
            };
    }

    // @generated by Peggy 4.0.2.
    //
    // https://peggyjs.org/
    // compile with 'peggy --allowed-start-rules Start,ExtraStepFunc --format es ...'
    // repl '__ ' -> ''
    // delete {...} : regex '^    \{(\n|.)+?.+\n    \}\n' ,   '\w+:'
    // repl ' =\n    (.+)' -> ' = $1', '\n\n' -> '\n'
    // attention: also def in monarch
    const keywords = ['self', '_', 'and', 'or', 'not', 'if', 'def', 'as', 'nil', 'none', 'prop', 'match', 'func'];
    function loc(w_loc, location) { return w_loc ? location : undefined; }
    function buildGenBinaryExpression(head, tail, type, pos, loc, is_scope = false) {
        return tail.reduce(function (result, element) {
            let ret = {
                type: type,
                left: result,
                right: element[pos],
                loc: loc
            };
            if (is_scope)
                ret.data = { ...ret.data, is_scope: true };
            return ret;
        }, head);
    }
    function buildGenBinaryOpExpression(head, tail, type, pos, loc) {
        return tail.reduce(function (result, element) {
            return {
                type: type,
                operator: element[1],
                left: result,
                right: element[pos],
                loc: loc
            };
        }, head);
    }
    // adopted from js peggy
    function buildBinaryExpression(head, tail, loc) {
        return tail.reduce(function (result, element) {
            return {
                type: Adt.ComparisonExpression,
                operator: element[1],
                left: result,
                right: element[3],
                loc: loc
            };
        }, head);
    }
    // adopted from js peggy
    function buildLogicalExpression(head, tail, loc) {
        return tail.reduce(function (result, element) {
            return {
                type: Adt.BinaryLogicalExpression,
                operator: element[1],
                left: result,
                right: element[4],
                loc: loc
            };
        }, head);
    }
    function extractList(list, index) {
        return list.map(function (element) { return element[index]; });
    }
    function buildList(head, tail, index) {
        return [head].concat(extractList(tail, index));
    }
    function peg$subclass(child, parent) {
        function C() { this.constructor = child; }
        C.prototype = parent.prototype;
        child.prototype = new C();
    }
    function peg$SyntaxError(message, expected, found, location) {
        var self = Error.call(this, message);
        // istanbul ignore next Check is a necessary evil to support older environments
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(self, peg$SyntaxError.prototype);
        }
        self.expected = expected;
        self.found = found;
        self.location = location;
        self.name = "SyntaxError";
        return self;
    }
    peg$subclass(peg$SyntaxError, Error);
    function peg$padEnd(str, targetLength, padString) {
        padString = padString || " ";
        if (str.length > targetLength) {
            return str;
        }
        targetLength -= str.length;
        padString += padString.repeat(targetLength);
        return str + padString.slice(0, targetLength);
    }
    peg$SyntaxError.prototype.format = function (sources) {
        var str = "Error: " + this.message;
        if (this.location) {
            var src = null;
            var k;
            for (k = 0; k < sources.length; k++) {
                if (sources[k].source === this.location.source) {
                    src = sources[k].text.split(/\r\n|\n|\r/g);
                    break;
                }
            }
            var s = this.location.start;
            var offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
                ? this.location.source.offset(s)
                : s;
            var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
            if (src) {
                var e = this.location.end;
                var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
                var line = src[s.line - 1];
                var last = s.line === e.line ? e.column : line.length + 1;
                var hatLen = (last - s.column) || 1;
                str += "\n --> " + loc + "\n"
                    + filler + " |\n"
                    + offset_s.line + " | " + line + "\n"
                    + filler + " | " + peg$padEnd("", s.column - 1, ' ')
                    + peg$padEnd("", hatLen, "^");
            }
            else {
                str += "\n at " + loc;
            }
        }
        return str;
    };
    peg$SyntaxError.buildMessage = function (expected, found) {
        var DESCRIBE_EXPECTATION_FNS = {
            literal: function (expectation) {
                return "\"" + literalEscape(expectation.text) + "\"";
            },
            class: function (expectation) {
                var escapedParts = expectation.parts.map(function (part) {
                    return Array.isArray(part)
                        ? classEscape(part[0]) + "-" + classEscape(part[1])
                        : classEscape(part);
                });
                return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
            },
            any: function () {
                return "any character";
            },
            end: function () {
                return "end of input";
            },
            other: function (expectation) {
                return expectation.description;
            }
        };
        function hex(ch) {
            return ch.charCodeAt(0).toString(16).toUpperCase();
        }
        function literalEscape(s) {
            return s
                .replace(/\\/g, "\\\\")
                .replace(/"/g, "\\\"")
                .replace(/\0/g, "\\0")
                .replace(/\t/g, "\\t")
                .replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r")
                .replace(/[\x00-\x0F]/g, function (ch) { return "\\x0" + hex(ch); })
                .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) { return "\\x" + hex(ch); });
        }
        function classEscape(s) {
            return s
                .replace(/\\/g, "\\\\")
                .replace(/\]/g, "\\]")
                .replace(/\^/g, "\\^")
                .replace(/-/g, "\\-")
                .replace(/\0/g, "\\0")
                .replace(/\t/g, "\\t")
                .replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r")
                .replace(/[\x00-\x0F]/g, function (ch) { return "\\x0" + hex(ch); })
                .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) { return "\\x" + hex(ch); });
        }
        function describeExpectation(expectation) {
            return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
        }
        function describeExpected(expected) {
            var descriptions = expected.map(describeExpectation);
            var i, j;
            descriptions.sort();
            if (descriptions.length > 0) {
                for (i = 1, j = 1; i < descriptions.length; i++) {
                    if (descriptions[i - 1] !== descriptions[i]) {
                        descriptions[j] = descriptions[i];
                        j++;
                    }
                }
                descriptions.length = j;
            }
            switch (descriptions.length) {
                case 1:
                    return descriptions[0];
                case 2:
                    return descriptions[0] + " or " + descriptions[1];
                default:
                    return descriptions.slice(0, -1).join(", ")
                        + ", or "
                        + descriptions[descriptions.length - 1];
            }
        }
        function describeFound(found) {
            return found ? "\"" + literalEscape(found) + "\"" : "end of input";
        }
        return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
    };
    function peg$parse(input, options) {
        options = options !== undefined ? options : {};
        var peg$FAILED = {};
        var peg$source = options.grammarSource;
        var peg$startRuleFunctions = { Start: peg$parseStart, ExtraStepFunc: peg$parseExtraStepFunc };
        var peg$startRuleFunction = peg$parseStart;
        var peg$c0 = ",";
        var peg$c1 = "func";
        var peg$c2 = "(";
        var peg$c3 = ")";
        var peg$c4 = "=";
        var peg$c5 = "if";
        var peg$c6 = "$";
        var peg$c7 = "or";
        var peg$c8 = "and";
        var peg$c9 = "==";
        var peg$c10 = "!=";
        var peg$c11 = "<=";
        var peg$c12 = ">=";
        var peg$c13 = "**";
        var peg$c14 = "not";
        var peg$c15 = ".";
        var peg$c16 = "@";
        var peg$c17 = "?";
        var peg$c18 = "[";
        var peg$c19 = "]";
        var peg$c20 = "prop";
        var peg$c21 = "*";
        var peg$c22 = "self";
        var peg$c23 = "_";
        var peg$c24 = "{";
        var peg$c25 = "}";
        var peg$c26 = ":";
        var peg$c27 = "none";
        var peg$c28 = "nil";
        var peg$c29 = "\n";
        var peg$c30 = "\r\n";
        var peg$c31 = "/*";
        var peg$c32 = "*/";
        var peg$c33 = "//";
        var peg$c34 = "\\";
        var peg$c35 = "null";
        var peg$c36 = "true";
        var peg$c37 = "false";
        var peg$c38 = "0";
        var peg$c39 = "e";
        var peg$c40 = "0x";
        var peg$c41 = "\"";
        var peg$c42 = "'";
        var peg$c43 = "`";
        var peg$c44 = "b";
        var peg$c45 = "f";
        var peg$c46 = "n";
        var peg$c47 = "r";
        var peg$c48 = "t";
        var peg$c49 = "v";
        var peg$c50 = "x";
        var peg$c51 = "u";
        var peg$c52 = "/";
        var peg$r0 = /^[<>]/;
        var peg$r1 = /^[+\-]/;
        var peg$r2 = /^[%*\/]/;
        var peg$r3 = /^[\t\v-\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]/;
        var peg$r4 = /^[\n\r\u2028\u2029]/;
        var peg$r5 = /^[\r\u2028-\u2029]/;
        var peg$r6 = /^[A-Z_a-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376-\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06E5-\u06E6\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4-\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E46\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/;
        var peg$r7 = /^[0-9_\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CD\u09D7\u09E2-\u09E3\u09E6-\u09EF\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47-\u0B48\u0B4B-\u0B4D\u0B56-\u0B57\u0B62-\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5-\u0CD6\u0CE2-\u0CE3\u0CE6-\u0CEF\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62-\u0D63\u0D66-\u0D6F\u0D82-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2-\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0ED0-\u0ED9\u0F18-\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F3F\u0F71-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19D9\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8-\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u200C-\u200D\u203F-\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099-\u309A\uA620-\uA629\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880-\uA881\uA8B4-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F1\uA900-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C-\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5-\uAAF6\uABE3-\uABEA\uABEC-\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33-\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F]/;
        var peg$r10 = /^[0-9]/;
        var peg$r11 = /^[1-9]/;
        var peg$r12 = /^[0-9a-f]/i;
        var peg$r13 = /^[\n\r"\\\u2028-\u2029]/;
        var peg$r14 = /^[\n\r'\\\u2028-\u2029]/;
        var peg$r15 = /^[\n\r\\`\u2028-\u2029]/;
        var peg$r16 = /^["'\\]/;
        var peg$r17 = /^[0-9ux]/;
        var peg$r18 = /^[*\\\/[]/;
        var peg$r19 = /^[\\\/[]/;
        var peg$r20 = /^[\]\\]/;
        var peg$e0 = peg$literalExpectation(",", false);
        var peg$e1 = peg$literalExpectation("func", false);
        var peg$e2 = peg$literalExpectation("(", false);
        var peg$e3 = peg$literalExpectation(")", false);
        var peg$e4 = peg$literalExpectation("=", false);
        var peg$e5 = peg$literalExpectation("if", false);
        var peg$e6 = peg$literalExpectation("$", false);
        var peg$e7 = peg$literalExpectation("or", false);
        var peg$e8 = peg$literalExpectation("and", false);
        var peg$e9 = peg$literalExpectation("==", false);
        var peg$e10 = peg$literalExpectation("!=", false);
        var peg$e11 = peg$literalExpectation("<=", false);
        var peg$e12 = peg$literalExpectation(">=", false);
        var peg$e13 = peg$classExpectation(["<", ">"], false, false);
        var peg$e14 = peg$classExpectation(["+", "-"], false, false);
        var peg$e15 = peg$classExpectation(["%", "*", "/"], false, false);
        var peg$e16 = peg$literalExpectation("**", false);
        var peg$e17 = peg$literalExpectation("not", false);
        var peg$e18 = peg$literalExpectation(".", false);
        var peg$e19 = peg$literalExpectation("@", false);
        var peg$e20 = peg$literalExpectation("?", false);
        var peg$e21 = peg$literalExpectation("[", false);
        var peg$e22 = peg$literalExpectation("]", false);
        var peg$e23 = peg$literalExpectation("prop", false);
        var peg$e24 = peg$literalExpectation("*", false);
        var peg$e25 = peg$literalExpectation("self", false);
        var peg$e26 = peg$literalExpectation("_", false);
        var peg$e27 = peg$literalExpectation("{", false);
        var peg$e28 = peg$literalExpectation("}", false);
        var peg$e29 = peg$literalExpectation(":", false);
        var peg$e30 = peg$literalExpectation("none", false);
        var peg$e31 = peg$literalExpectation("nil", false);
        var peg$e32 = peg$anyExpectation();
        var peg$e33 = peg$otherExpectation("whitespace");
        var peg$e34 = peg$classExpectation(["\t", ["\v", "\f"], " ", "\xA0", "\u1680", ["\u2000", "\u200A"], "\u202F", "\u205F", "\u3000", "\uFEFF"], false, false);
        var peg$e35 = peg$classExpectation(["\n", "\r", "\u2028", "\u2029"], false, false);
        var peg$e36 = peg$otherExpectation("end of line");
        var peg$e37 = peg$literalExpectation("\n", false);
        var peg$e38 = peg$literalExpectation("\r\n", false);
        var peg$e39 = peg$classExpectation(["\r", ["\u2028", "\u2029"]], false, false);
        var peg$e40 = peg$otherExpectation("comment");
        var peg$e41 = peg$literalExpectation("/*", false);
        var peg$e42 = peg$literalExpectation("*/", false);
        var peg$e43 = peg$literalExpectation("//", false);
        var peg$e44 = peg$otherExpectation("identifier");
        var peg$e45 = peg$classExpectation([["A", "Z"], "_", ["a", "z"], "\xAA", "\xB5", "\xBA", ["\xC0", "\xD6"], ["\xD8", "\xF6"], ["\xF8", "\u02C1"], ["\u02C6", "\u02D1"], ["\u02E0", "\u02E4"], "\u02EC", "\u02EE", ["\u0370", "\u0374"], ["\u0376", "\u0377"], ["\u037A", "\u037D"], "\u037F", "\u0386", ["\u0388", "\u038A"], "\u038C", ["\u038E", "\u03A1"], ["\u03A3", "\u03F5"], ["\u03F7", "\u0481"], ["\u048A", "\u052F"], ["\u0531", "\u0556"], "\u0559", ["\u0561", "\u0587"], ["\u05D0", "\u05EA"], ["\u05F0", "\u05F2"], ["\u0620", "\u064A"], ["\u066E", "\u066F"], ["\u0671", "\u06D3"], "\u06D5", ["\u06E5", "\u06E6"], ["\u06EE", "\u06EF"], ["\u06FA", "\u06FC"], "\u06FF", "\u0710", ["\u0712", "\u072F"], ["\u074D", "\u07A5"], "\u07B1", ["\u07CA", "\u07EA"], ["\u07F4", "\u07F5"], "\u07FA", ["\u0800", "\u0815"], "\u081A", "\u0824", "\u0828", ["\u0840", "\u0858"], ["\u08A0", "\u08B4"], ["\u0904", "\u0939"], "\u093D", "\u0950", ["\u0958", "\u0961"], ["\u0971", "\u0980"], ["\u0985", "\u098C"], ["\u098F", "\u0990"], ["\u0993", "\u09A8"], ["\u09AA", "\u09B0"], "\u09B2", ["\u09B6", "\u09B9"], "\u09BD", "\u09CE", ["\u09DC", "\u09DD"], ["\u09DF", "\u09E1"], ["\u09F0", "\u09F1"], ["\u0A05", "\u0A0A"], ["\u0A0F", "\u0A10"], ["\u0A13", "\u0A28"], ["\u0A2A", "\u0A30"], ["\u0A32", "\u0A33"], ["\u0A35", "\u0A36"], ["\u0A38", "\u0A39"], ["\u0A59", "\u0A5C"], "\u0A5E", ["\u0A72", "\u0A74"], ["\u0A85", "\u0A8D"], ["\u0A8F", "\u0A91"], ["\u0A93", "\u0AA8"], ["\u0AAA", "\u0AB0"], ["\u0AB2", "\u0AB3"], ["\u0AB5", "\u0AB9"], "\u0ABD", "\u0AD0", ["\u0AE0", "\u0AE1"], "\u0AF9", ["\u0B05", "\u0B0C"], ["\u0B0F", "\u0B10"], ["\u0B13", "\u0B28"], ["\u0B2A", "\u0B30"], ["\u0B32", "\u0B33"], ["\u0B35", "\u0B39"], "\u0B3D", ["\u0B5C", "\u0B5D"], ["\u0B5F", "\u0B61"], "\u0B71", "\u0B83", ["\u0B85", "\u0B8A"], ["\u0B8E", "\u0B90"], ["\u0B92", "\u0B95"], ["\u0B99", "\u0B9A"], "\u0B9C", ["\u0B9E", "\u0B9F"], ["\u0BA3", "\u0BA4"], ["\u0BA8", "\u0BAA"], ["\u0BAE", "\u0BB9"], "\u0BD0", ["\u0C05", "\u0C0C"], ["\u0C0E", "\u0C10"], ["\u0C12", "\u0C28"], ["\u0C2A", "\u0C39"], "\u0C3D", ["\u0C58", "\u0C5A"], ["\u0C60", "\u0C61"], ["\u0C85", "\u0C8C"], ["\u0C8E", "\u0C90"], ["\u0C92", "\u0CA8"], ["\u0CAA", "\u0CB3"], ["\u0CB5", "\u0CB9"], "\u0CBD", "\u0CDE", ["\u0CE0", "\u0CE1"], ["\u0CF1", "\u0CF2"], ["\u0D05", "\u0D0C"], ["\u0D0E", "\u0D10"], ["\u0D12", "\u0D3A"], "\u0D3D", "\u0D4E", ["\u0D5F", "\u0D61"], ["\u0D7A", "\u0D7F"], ["\u0D85", "\u0D96"], ["\u0D9A", "\u0DB1"], ["\u0DB3", "\u0DBB"], "\u0DBD", ["\u0DC0", "\u0DC6"], ["\u0E01", "\u0E30"], ["\u0E32", "\u0E33"], ["\u0E40", "\u0E46"], ["\u0E81", "\u0E82"], "\u0E84", ["\u0E87", "\u0E88"], "\u0E8A", "\u0E8D", ["\u0E94", "\u0E97"], ["\u0E99", "\u0E9F"], ["\u0EA1", "\u0EA3"], "\u0EA5", "\u0EA7", ["\u0EAA", "\u0EAB"], ["\u0EAD", "\u0EB0"], ["\u0EB2", "\u0EB3"], "\u0EBD", ["\u0EC0", "\u0EC4"], "\u0EC6", ["\u0EDC", "\u0EDF"], "\u0F00", ["\u0F40", "\u0F47"], ["\u0F49", "\u0F6C"], ["\u0F88", "\u0F8C"], ["\u1000", "\u102A"], "\u103F", ["\u1050", "\u1055"], ["\u105A", "\u105D"], "\u1061", ["\u1065", "\u1066"], ["\u106E", "\u1070"], ["\u1075", "\u1081"], "\u108E", ["\u10A0", "\u10C5"], "\u10C7", "\u10CD", ["\u10D0", "\u10FA"], ["\u10FC", "\u1248"], ["\u124A", "\u124D"], ["\u1250", "\u1256"], "\u1258", ["\u125A", "\u125D"], ["\u1260", "\u1288"], ["\u128A", "\u128D"], ["\u1290", "\u12B0"], ["\u12B2", "\u12B5"], ["\u12B8", "\u12BE"], "\u12C0", ["\u12C2", "\u12C5"], ["\u12C8", "\u12D6"], ["\u12D8", "\u1310"], ["\u1312", "\u1315"], ["\u1318", "\u135A"], ["\u1380", "\u138F"], ["\u13A0", "\u13F5"], ["\u13F8", "\u13FD"], ["\u1401", "\u166C"], ["\u166F", "\u167F"], ["\u1681", "\u169A"], ["\u16A0", "\u16EA"], ["\u16EE", "\u16F8"], ["\u1700", "\u170C"], ["\u170E", "\u1711"], ["\u1720", "\u1731"], ["\u1740", "\u1751"], ["\u1760", "\u176C"], ["\u176E", "\u1770"], ["\u1780", "\u17B3"], "\u17D7", "\u17DC", ["\u1820", "\u1877"], ["\u1880", "\u18A8"], "\u18AA", ["\u18B0", "\u18F5"], ["\u1900", "\u191E"], ["\u1950", "\u196D"], ["\u1970", "\u1974"], ["\u1980", "\u19AB"], ["\u19B0", "\u19C9"], ["\u1A00", "\u1A16"], ["\u1A20", "\u1A54"], "\u1AA7", ["\u1B05", "\u1B33"], ["\u1B45", "\u1B4B"], ["\u1B83", "\u1BA0"], ["\u1BAE", "\u1BAF"], ["\u1BBA", "\u1BE5"], ["\u1C00", "\u1C23"], ["\u1C4D", "\u1C4F"], ["\u1C5A", "\u1C7D"], ["\u1CE9", "\u1CEC"], ["\u1CEE", "\u1CF1"], ["\u1CF5", "\u1CF6"], ["\u1D00", "\u1DBF"], ["\u1E00", "\u1F15"], ["\u1F18", "\u1F1D"], ["\u1F20", "\u1F45"], ["\u1F48", "\u1F4D"], ["\u1F50", "\u1F57"], "\u1F59", "\u1F5B", "\u1F5D", ["\u1F5F", "\u1F7D"], ["\u1F80", "\u1FB4"], ["\u1FB6", "\u1FBC"], "\u1FBE", ["\u1FC2", "\u1FC4"], ["\u1FC6", "\u1FCC"], ["\u1FD0", "\u1FD3"], ["\u1FD6", "\u1FDB"], ["\u1FE0", "\u1FEC"], ["\u1FF2", "\u1FF4"], ["\u1FF6", "\u1FFC"], "\u2071", "\u207F", ["\u2090", "\u209C"], "\u2102", "\u2107", ["\u210A", "\u2113"], "\u2115", ["\u2119", "\u211D"], "\u2124", "\u2126", "\u2128", ["\u212A", "\u212D"], ["\u212F", "\u2139"], ["\u213C", "\u213F"], ["\u2145", "\u2149"], "\u214E", ["\u2160", "\u2188"], ["\u2C00", "\u2C2E"], ["\u2C30", "\u2C5E"], ["\u2C60", "\u2CE4"], ["\u2CEB", "\u2CEE"], ["\u2CF2", "\u2CF3"], ["\u2D00", "\u2D25"], "\u2D27", "\u2D2D", ["\u2D30", "\u2D67"], "\u2D6F", ["\u2D80", "\u2D96"], ["\u2DA0", "\u2DA6"], ["\u2DA8", "\u2DAE"], ["\u2DB0", "\u2DB6"], ["\u2DB8", "\u2DBE"], ["\u2DC0", "\u2DC6"], ["\u2DC8", "\u2DCE"], ["\u2DD0", "\u2DD6"], ["\u2DD8", "\u2DDE"], "\u2E2F", ["\u3005", "\u3007"], ["\u3021", "\u3029"], ["\u3031", "\u3035"], ["\u3038", "\u303C"], ["\u3041", "\u3096"], ["\u309D", "\u309F"], ["\u30A1", "\u30FA"], ["\u30FC", "\u30FF"], ["\u3105", "\u312D"], ["\u3131", "\u318E"], ["\u31A0", "\u31BA"], ["\u31F0", "\u31FF"], ["\u3400", "\u4DB5"], ["\u4E00", "\u9FD5"], ["\uA000", "\uA48C"], ["\uA4D0", "\uA4FD"], ["\uA500", "\uA60C"], ["\uA610", "\uA61F"], ["\uA62A", "\uA62B"], ["\uA640", "\uA66E"], ["\uA67F", "\uA69D"], ["\uA6A0", "\uA6EF"], ["\uA717", "\uA71F"], ["\uA722", "\uA788"], ["\uA78B", "\uA7AD"], ["\uA7B0", "\uA7B7"], ["\uA7F7", "\uA801"], ["\uA803", "\uA805"], ["\uA807", "\uA80A"], ["\uA80C", "\uA822"], ["\uA840", "\uA873"], ["\uA882", "\uA8B3"], ["\uA8F2", "\uA8F7"], "\uA8FB", "\uA8FD", ["\uA90A", "\uA925"], ["\uA930", "\uA946"], ["\uA960", "\uA97C"], ["\uA984", "\uA9B2"], "\uA9CF", ["\uA9E0", "\uA9E4"], ["\uA9E6", "\uA9EF"], ["\uA9FA", "\uA9FE"], ["\uAA00", "\uAA28"], ["\uAA40", "\uAA42"], ["\uAA44", "\uAA4B"], ["\uAA60", "\uAA76"], "\uAA7A", ["\uAA7E", "\uAAAF"], "\uAAB1", ["\uAAB5", "\uAAB6"], ["\uAAB9", "\uAABD"], "\uAAC0", "\uAAC2", ["\uAADB", "\uAADD"], ["\uAAE0", "\uAAEA"], ["\uAAF2", "\uAAF4"], ["\uAB01", "\uAB06"], ["\uAB09", "\uAB0E"], ["\uAB11", "\uAB16"], ["\uAB20", "\uAB26"], ["\uAB28", "\uAB2E"], ["\uAB30", "\uAB5A"], ["\uAB5C", "\uAB65"], ["\uAB70", "\uABE2"], ["\uAC00", "\uD7A3"], ["\uD7B0", "\uD7C6"], ["\uD7CB", "\uD7FB"], ["\uF900", "\uFA6D"], ["\uFA70", "\uFAD9"], ["\uFB00", "\uFB06"], ["\uFB13", "\uFB17"], "\uFB1D", ["\uFB1F", "\uFB28"], ["\uFB2A", "\uFB36"], ["\uFB38", "\uFB3C"], "\uFB3E", ["\uFB40", "\uFB41"], ["\uFB43", "\uFB44"], ["\uFB46", "\uFBB1"], ["\uFBD3", "\uFD3D"], ["\uFD50", "\uFD8F"], ["\uFD92", "\uFDC7"], ["\uFDF0", "\uFDFB"], ["\uFE70", "\uFE74"], ["\uFE76", "\uFEFC"], ["\uFF21", "\uFF3A"], ["\uFF41", "\uFF5A"], ["\uFF66", "\uFFBE"], ["\uFFC2", "\uFFC7"], ["\uFFCA", "\uFFCF"], ["\uFFD2", "\uFFD7"], ["\uFFDA", "\uFFDC"]], false, false);
        var peg$e46 = peg$literalExpectation("\\", false);
        var peg$e47 = peg$classExpectation([["0", "9"], "_", ["\u0300", "\u036F"], ["\u0483", "\u0487"], ["\u0591", "\u05BD"], "\u05BF", ["\u05C1", "\u05C2"], ["\u05C4", "\u05C5"], "\u05C7", ["\u0610", "\u061A"], ["\u064B", "\u0669"], "\u0670", ["\u06D6", "\u06DC"], ["\u06DF", "\u06E4"], ["\u06E7", "\u06E8"], ["\u06EA", "\u06ED"], ["\u06F0", "\u06F9"], "\u0711", ["\u0730", "\u074A"], ["\u07A6", "\u07B0"], ["\u07C0", "\u07C9"], ["\u07EB", "\u07F3"], ["\u0816", "\u0819"], ["\u081B", "\u0823"], ["\u0825", "\u0827"], ["\u0829", "\u082D"], ["\u0859", "\u085B"], ["\u08E3", "\u0903"], ["\u093A", "\u093C"], ["\u093E", "\u094F"], ["\u0951", "\u0957"], ["\u0962", "\u0963"], ["\u0966", "\u096F"], ["\u0981", "\u0983"], "\u09BC", ["\u09BE", "\u09C4"], ["\u09C7", "\u09C8"], ["\u09CB", "\u09CD"], "\u09D7", ["\u09E2", "\u09E3"], ["\u09E6", "\u09EF"], ["\u0A01", "\u0A03"], "\u0A3C", ["\u0A3E", "\u0A42"], ["\u0A47", "\u0A48"], ["\u0A4B", "\u0A4D"], "\u0A51", ["\u0A66", "\u0A71"], "\u0A75", ["\u0A81", "\u0A83"], "\u0ABC", ["\u0ABE", "\u0AC5"], ["\u0AC7", "\u0AC9"], ["\u0ACB", "\u0ACD"], ["\u0AE2", "\u0AE3"], ["\u0AE6", "\u0AEF"], ["\u0B01", "\u0B03"], "\u0B3C", ["\u0B3E", "\u0B44"], ["\u0B47", "\u0B48"], ["\u0B4B", "\u0B4D"], ["\u0B56", "\u0B57"], ["\u0B62", "\u0B63"], ["\u0B66", "\u0B6F"], "\u0B82", ["\u0BBE", "\u0BC2"], ["\u0BC6", "\u0BC8"], ["\u0BCA", "\u0BCD"], "\u0BD7", ["\u0BE6", "\u0BEF"], ["\u0C00", "\u0C03"], ["\u0C3E", "\u0C44"], ["\u0C46", "\u0C48"], ["\u0C4A", "\u0C4D"], ["\u0C55", "\u0C56"], ["\u0C62", "\u0C63"], ["\u0C66", "\u0C6F"], ["\u0C81", "\u0C83"], "\u0CBC", ["\u0CBE", "\u0CC4"], ["\u0CC6", "\u0CC8"], ["\u0CCA", "\u0CCD"], ["\u0CD5", "\u0CD6"], ["\u0CE2", "\u0CE3"], ["\u0CE6", "\u0CEF"], ["\u0D01", "\u0D03"], ["\u0D3E", "\u0D44"], ["\u0D46", "\u0D48"], ["\u0D4A", "\u0D4D"], "\u0D57", ["\u0D62", "\u0D63"], ["\u0D66", "\u0D6F"], ["\u0D82", "\u0D83"], "\u0DCA", ["\u0DCF", "\u0DD4"], "\u0DD6", ["\u0DD8", "\u0DDF"], ["\u0DE6", "\u0DEF"], ["\u0DF2", "\u0DF3"], "\u0E31", ["\u0E34", "\u0E3A"], ["\u0E47", "\u0E4E"], ["\u0E50", "\u0E59"], "\u0EB1", ["\u0EB4", "\u0EB9"], ["\u0EBB", "\u0EBC"], ["\u0EC8", "\u0ECD"], ["\u0ED0", "\u0ED9"], ["\u0F18", "\u0F19"], ["\u0F20", "\u0F29"], "\u0F35", "\u0F37", "\u0F39", ["\u0F3E", "\u0F3F"], ["\u0F71", "\u0F84"], ["\u0F86", "\u0F87"], ["\u0F8D", "\u0F97"], ["\u0F99", "\u0FBC"], "\u0FC6", ["\u102B", "\u103E"], ["\u1040", "\u1049"], ["\u1056", "\u1059"], ["\u105E", "\u1060"], ["\u1062", "\u1064"], ["\u1067", "\u106D"], ["\u1071", "\u1074"], ["\u1082", "\u108D"], ["\u108F", "\u109D"], ["\u135D", "\u135F"], ["\u1712", "\u1714"], ["\u1732", "\u1734"], ["\u1752", "\u1753"], ["\u1772", "\u1773"], ["\u17B4", "\u17D3"], "\u17DD", ["\u17E0", "\u17E9"], ["\u180B", "\u180D"], ["\u1810", "\u1819"], "\u18A9", ["\u1920", "\u192B"], ["\u1930", "\u193B"], ["\u1946", "\u194F"], ["\u19D0", "\u19D9"], ["\u1A17", "\u1A1B"], ["\u1A55", "\u1A5E"], ["\u1A60", "\u1A7C"], ["\u1A7F", "\u1A89"], ["\u1A90", "\u1A99"], ["\u1AB0", "\u1ABD"], ["\u1B00", "\u1B04"], ["\u1B34", "\u1B44"], ["\u1B50", "\u1B59"], ["\u1B6B", "\u1B73"], ["\u1B80", "\u1B82"], ["\u1BA1", "\u1BAD"], ["\u1BB0", "\u1BB9"], ["\u1BE6", "\u1BF3"], ["\u1C24", "\u1C37"], ["\u1C40", "\u1C49"], ["\u1C50", "\u1C59"], ["\u1CD0", "\u1CD2"], ["\u1CD4", "\u1CE8"], "\u1CED", ["\u1CF2", "\u1CF4"], ["\u1CF8", "\u1CF9"], ["\u1DC0", "\u1DF5"], ["\u1DFC", "\u1DFF"], ["\u200C", "\u200D"], ["\u203F", "\u2040"], "\u2054", ["\u20D0", "\u20DC"], "\u20E1", ["\u20E5", "\u20F0"], ["\u2CEF", "\u2CF1"], "\u2D7F", ["\u2DE0", "\u2DFF"], ["\u302A", "\u302F"], ["\u3099", "\u309A"], ["\uA620", "\uA629"], "\uA66F", ["\uA674", "\uA67D"], ["\uA69E", "\uA69F"], ["\uA6F0", "\uA6F1"], "\uA802", "\uA806", "\uA80B", ["\uA823", "\uA827"], ["\uA880", "\uA881"], ["\uA8B4", "\uA8C4"], ["\uA8D0", "\uA8D9"], ["\uA8E0", "\uA8F1"], ["\uA900", "\uA909"], ["\uA926", "\uA92D"], ["\uA947", "\uA953"], ["\uA980", "\uA983"], ["\uA9B3", "\uA9C0"], ["\uA9D0", "\uA9D9"], "\uA9E5", ["\uA9F0", "\uA9F9"], ["\uAA29", "\uAA36"], "\uAA43", ["\uAA4C", "\uAA4D"], ["\uAA50", "\uAA59"], ["\uAA7B", "\uAA7D"], "\uAAB0", ["\uAAB2", "\uAAB4"], ["\uAAB7", "\uAAB8"], ["\uAABE", "\uAABF"], "\uAAC1", ["\uAAEB", "\uAAEF"], ["\uAAF5", "\uAAF6"], ["\uABE3", "\uABEA"], ["\uABEC", "\uABED"], ["\uABF0", "\uABF9"], "\uFB1E", ["\uFE00", "\uFE0F"], ["\uFE20", "\uFE2F"], ["\uFE33", "\uFE34"], ["\uFE4D", "\uFE4F"], ["\uFF10", "\uFF19"], "\uFF3F"], false, false);
        var peg$e50 = peg$literalExpectation("null", false);
        var peg$e51 = peg$literalExpectation("true", false);
        var peg$e52 = peg$literalExpectation("false", false);
        var peg$e53 = peg$otherExpectation("number");
        var peg$e54 = peg$literalExpectation("0", false);
        var peg$e55 = peg$classExpectation([["0", "9"]], false, false);
        var peg$e56 = peg$classExpectation([["1", "9"]], false, false);
        var peg$e57 = peg$literalExpectation("e", true);
        var peg$e58 = peg$literalExpectation("0x", true);
        var peg$e59 = peg$classExpectation([["0", "9"], ["a", "f"]], false, true);
        var peg$e60 = peg$literalExpectation("\"", false);
        var peg$e61 = peg$literalExpectation("'", false);
        var peg$e62 = peg$literalExpectation("`", false);
        var peg$e63 = peg$classExpectation(["\n", "\r", "\"", "\\", ["\u2028", "\u2029"]], false, false);
        var peg$e64 = peg$classExpectation(["\n", "\r", "'", "\\", ["\u2028", "\u2029"]], false, false);
        var peg$e65 = peg$classExpectation(["\n", "\r", "\\", "`", ["\u2028", "\u2029"]], false, false);
        var peg$e66 = peg$classExpectation(["\"", "'", "\\"], false, false);
        var peg$e67 = peg$literalExpectation("b", false);
        var peg$e68 = peg$literalExpectation("f", false);
        var peg$e69 = peg$literalExpectation("n", false);
        var peg$e70 = peg$literalExpectation("r", false);
        var peg$e71 = peg$literalExpectation("t", false);
        var peg$e72 = peg$literalExpectation("v", false);
        var peg$e73 = peg$classExpectation([["0", "9"], "u", "x"], false, false);
        var peg$e74 = peg$literalExpectation("x", false);
        var peg$e75 = peg$literalExpectation("u", false);
        var peg$e76 = peg$literalExpectation("/", false);
        var peg$e77 = peg$classExpectation(["*", "\\", "/", "["], false, false);
        var peg$e78 = peg$classExpectation(["\\", "/", "["], false, false);
        var peg$e79 = peg$classExpectation(["]", "\\"], false, false);
        var peg$f0 = function (e) {
            return e;
        };
        var peg$f1 = function (e) {
            return e;
        };
        var peg$f2 = function (head, tail) {
            const seq = with_empty_left(buildGenBinaryExpression(head, tail, Adt.SequencedExpressions, 3, loc(w_loc, location()), false), Adt.SequencedExpressions, options.no_empty_left);
            // if (tail.length > 0) 
            if (w_data)
                seq.data = { ...seq.data, is_scope: true };
            return seq;
            // return decl ?
            //   { 
            //     type: Adt.SequencedExpressions, left: decl[0], right: seq 
            //   }
            //   : seq
        };
        var peg$f3 = function (id, args, e) {
            const f = {
                type: Adt.ApathFuncDef,
                name: id.name,
                formalParameters: args === null ? [] : args,
                body: e,
                loc: loc(w_loc, location())
            };
            if (w_data)
                f.data = { ...f.data, is_scope: true };
            return f;
        };
        var peg$f4 = function (head, tail) {
            // return buildList(head, tail, 3).map(id => id.name)
            return buildList(head, tail, 3);
        };
        var peg$f5 = function (id) {
            return {
                type: Adt.VariableBinding,
                var_name: id.name,
                e: { type: Adt.Empty },
                loc: loc(w_loc, location())
            };
        };
        var peg$f6 = function (id, e) {
            return {
                type: Adt.VariableBinding,
                var_name: id.name,
                e,
                loc: loc(w_loc, location())
            };
        };
        var peg$f7 = function (cond, thenPart, elsePart) {
            return {
                type: Adt.Conditional,
                condition: cond,
                thenPart: thenPart,
                // elsePart: elsePart ? elsePart[2] : undefined
                elsePart: elsePart == null ? undefined : elsePart,
                loc: loc(w_loc, location())
            };
        };
        var peg$f8 = function (id) {
            return {
                type: Adt.VariableApplication,
                var_name: id.name,
                loc: loc(w_loc, location())
            };
        };
        var peg$f9 = function (head, tail) {
            return buildLogicalExpression(head, tail, loc(w_loc, location()));
        };
        var peg$f10 = function (head, tail) {
            return buildLogicalExpression(head, tail, loc(w_loc, location()));
        };
        var peg$f11 = function (head, tail) {
            return buildBinaryExpression(head, tail, loc(w_loc, location()));
        };
        var peg$f12 = function (head, tail) {
            return buildBinaryExpression(head, tail, loc(w_loc, location()));
        };
        var peg$f13 = function (head, tail) {
            return buildGenBinaryOpExpression(head, tail, Adt.BinaryArithmeticExpression, 3, loc(w_loc, location()));
        };
        var peg$f14 = function (head, tail) {
            return buildGenBinaryOpExpression(head, tail, Adt.BinaryArithmeticExpression, 3, loc(w_loc, location()));
        };
        var peg$f15 = function (head, tail) {
            return buildBinaryExpression(head, tail);
        };
        var peg$f16 = function (operator, argument) {
            var type = (operator === '+' || operator === '-')
                ? 'UnaryArithmeticExpression'
                : 'UnaryLogicalExpression';
            return {
                type: type,
                operator: operator,
                e: argument
                // ,
                // prefix: true
            };
        };
        var peg$f17 = function () {
            return 'not';
        };
        var peg$f18 = function (head, tail) {
            const p = with_empty_left(buildGenBinaryExpression(head, tail, Adt.Path, 3, loc(w_loc, location()), false), Adt.Path, options.no_empty_left);
            // if (tail.length > 0) 
            if (w_data)
                p.data = { ...p.data, is_scope: true };
            return p;
        };
        var peg$f19 = function (e) {
            return {
                type: Adt.AasStep,
                e: e,
                loc: loc(w_loc, location())
            };
        };
        var peg$f20 = function (e1, id) {
            if (id === null)
                return e1;
            return {
                type: Adt.VariableBindingNode,
                e: e1,
                var_name: id[2].name,
                loc: loc(w_loc, location())
            };
        };
        var peg$f21 = function (e1, e2) {
            if (e2 === null)
                return e1;
            return {
                type: Adt.Filter,
                e: e1,
                filter: e2[5],
                loc: loc(w_loc, location())
            };
        };
        var peg$f22 = function (e1, e2) {
            if (e2 === null)
                return e1;
            return {
                type: Adt.Subscript,
                e: e1,
                idx: e2[3],
                loc: loc(w_loc, location())
            };
        };
        var peg$f23 = function (e) {
            return e;
        };
        var peg$f24 = function (e0) {
            return {
                type: Adt.AasStep,
                e: e0,
                loc: loc(w_loc, location())
            };
        };
        var peg$f25 = function (id) {
            return {
                type: Adt.Property,
                name: id.name,
                loc: loc(w_loc, location())
            };
        };
        var peg$f26 = function (s) {
            return {
                type: Adt.Property,
                name: s.value,
                loc: loc(w_loc, location())
            };
        };
        var peg$f27 = function (e) {
            return {
                type: Adt.PropertyRegex,
                regex: e.value,
                loc: loc(w_loc, location())
            };
        };
        var peg$f28 = function (e) {
            return {
                type: Adt.PropertyExpression,
                e: e,
                loc: loc(w_loc, location())
            };
        };
        var peg$f29 = function () {
            return {
                type: Adt.Children,
                loc: loc(w_loc, location())
            };
        };
        var peg$f30 = function (t) {
            return {
                type: Adt.Self,
                loc: loc(w_loc, location())
            };
        };
        var peg$f31 = function (id, el) {
            return {
                type: Adt.FuncCall,
                name: id.name,
                arguments: el,
                loc: loc(w_loc, location())
            };
        };
        var peg$f32 = function (head, tail) {
            return buildGenBinaryExpression(head, tail, Adt.ArgumentList, 3, loc(w_loc, location()));
        };
        var peg$f33 = function (propertyAssignments) {
            return {
                type: Adt.ObjectExpression,
                propertyAssignments: propertyAssignments,
                loc: loc(w_loc, location())
            };
        };
        var peg$f34 = function (head, tail) {
            return buildGenBinaryExpression(head, tail, Adt.PropertyAssignmentList, 3, loc(w_loc, location()));
        };
        var peg$f35 = function (name, value) {
            const value_ = value === 'none' ? { type: Adt.None } : value;
            return name !== null ? {
                type: Adt.NamedAssignment,
                key: name[0],
                value: value_,
                loc: loc(w_loc, location())
            }
                :
                    {
                        type: Adt.EmbeddingExpression,
                        e: value_,
                        loc: loc(w_loc, location())
                    };
        };
        var peg$f36 = function (id) {
            return {
                type: Adt.Property,
                name: id.name,
                loc: loc(w_loc, location())
            };
        };
        var peg$f37 = function (s) {
            return {
                type: Adt.Property,
                name: s.value,
                loc: loc(w_loc, location())
            };
        };
        var peg$f38 = function (e) {
            return {
                type: Adt.PropertyNameExpression,
                e: e,
                loc: loc(w_loc, location())
            };
        };
        var peg$f39 = function (e) {
            return {
                type: Adt.PropertyNameExpression,
                e: e,
                loc: loc(w_loc, location()),
                data: { warnings: [`DEPRECATED: dynamic property without 'prop' keyword`] }
            };
        };
        var peg$f40 = function (el) {
            return {
                type: Adt.ArrayExpression,
                elements: el,
                loc: loc(w_loc, location())
            };
        };
        var peg$f41 = function (head, tail) {
            return buildGenBinaryExpression(head, tail, Adt.ElementList, 3, loc(w_loc, location()));
        };
        var peg$f42 = function (name) {
            return name;
        };
        var peg$f43 = function (head, tail) {
            return {
                type: "Identifier",
                name: head + tail.join("")
            };
        };
        var peg$f44 = function (sequence) { return sequence; };
        var peg$f45 = function () { return { type: "Literal", value: null }; };
        var peg$f46 = function () {
            return {
                type: Adt.Empty,
                loc: loc(w_loc, location())
            };
        };
        var peg$f47 = function () { return { type: "Literal", value: true }; };
        var peg$f48 = function () { return { type: "Literal", value: false }; };
        var peg$f49 = function (literal) {
            return literal;
        };
        var peg$f50 = function (literal) {
            return literal;
        };
        var peg$f51 = function () {
            return { type: "Literal", value: parseFloat(text()) };
        };
        var peg$f52 = function () {
            return { type: "Literal", value: parseFloat(text()) };
        };
        var peg$f53 = function () {
            return { type: "Literal", value: parseFloat(text()) };
        };
        var peg$f54 = function (digits) {
            return { type: "Literal", value: parseInt(digits, 16) };
        };
        var peg$f55 = function (chars) {
            return { type: "Literal", value: chars.join("") };
        };
        var peg$f56 = function (chars) {
            return { type: "Literal", value: chars.join("") };
        };
        var peg$f57 = function (chars) {
            return { type: "NameLiteral", value: chars.join("") };
        };
        var peg$f58 = function () { return text(); };
        var peg$f59 = function (sequence) { return sequence; };
        var peg$f60 = function () { return text(); };
        var peg$f61 = function (sequence) { return sequence; };
        var peg$f62 = function () { return text(); };
        var peg$f63 = function (sequence) { return sequence; };
        var peg$f64 = function () { return ""; };
        var peg$f65 = function () { return "\0"; };
        var peg$f66 = function () { return "\b"; };
        var peg$f67 = function () { return "\f"; };
        var peg$f68 = function () { return "\n"; };
        var peg$f69 = function () { return "\r"; };
        var peg$f70 = function () { return "\t"; };
        var peg$f71 = function () { return "\v"; };
        var peg$f72 = function () { return text(); };
        var peg$f73 = function (digits) {
            return String.fromCharCode(parseInt(digits, 16));
        };
        var peg$f74 = function (digits) {
            return String.fromCharCode(parseInt(digits, 16));
        };
        var peg$f75 = function (pattern) {
            // var value
            // try {
            //   value = new RegExp(pattern, flags)
            // } catch (e) {
            //   error(e.message)
            // }
            return { type: "Literal", value: pattern };
        };
        var peg$f76 = function () { return null; };
        var peg$currPos = options.peg$currPos | 0;
        var peg$savedPos = peg$currPos;
        var peg$posDetailsCache = [{ line: 1, column: 1 }];
        var peg$maxFailPos = peg$currPos;
        var peg$maxFailExpected = options.peg$maxFailExpected || [];
        var peg$silentFails = options.peg$silentFails | 0;
        var peg$result;
        if (options.startRule) {
            if (!(options.startRule in peg$startRuleFunctions)) {
                throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
            }
            peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }
        function text() {
            return input.substring(peg$savedPos, peg$currPos);
        }
        function location() {
            return peg$computeLocation(peg$savedPos, peg$currPos);
        }
        function peg$literalExpectation(text, ignoreCase) {
            return { type: "literal", text: text, ignoreCase: ignoreCase };
        }
        function peg$classExpectation(parts, inverted, ignoreCase) {
            return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
        }
        function peg$anyExpectation() {
            return { type: "any" };
        }
        function peg$endExpectation() {
            return { type: "end" };
        }
        function peg$otherExpectation(description) {
            return { type: "other", description: description };
        }
        function peg$computePosDetails(pos) {
            var details = peg$posDetailsCache[pos];
            var p;
            if (details) {
                return details;
            }
            else {
                if (pos >= peg$posDetailsCache.length) {
                    p = peg$posDetailsCache.length - 1;
                }
                else {
                    p = pos;
                    while (!peg$posDetailsCache[--p]) { }
                }
                details = peg$posDetailsCache[p];
                details = {
                    line: details.line,
                    column: details.column
                };
                while (p < pos) {
                    if (input.charCodeAt(p) === 10) {
                        details.line++;
                        details.column = 1;
                    }
                    else {
                        details.column++;
                    }
                    p++;
                }
                peg$posDetailsCache[pos] = details;
                return details;
            }
        }
        function peg$computeLocation(startPos, endPos, offset) {
            var startPosDetails = peg$computePosDetails(startPos);
            var endPosDetails = peg$computePosDetails(endPos);
            var res = {
                source: peg$source,
                start: {
                    offset: startPos,
                    line: startPosDetails.line,
                    column: startPosDetails.column
                },
                end: {
                    offset: endPos,
                    line: endPosDetails.line,
                    column: endPosDetails.column
                }
            };
            return res;
        }
        function peg$fail(expected) {
            if (peg$currPos < peg$maxFailPos) {
                return;
            }
            if (peg$currPos > peg$maxFailPos) {
                peg$maxFailPos = peg$currPos;
                peg$maxFailExpected = [];
            }
            peg$maxFailExpected.push(expected);
        }
        function peg$buildStructuredError(expected, found, location) {
            return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected, found), expected, found, location);
        }
        function peg$parseStart() {
            var s0, s2, s4;
            s0 = peg$currPos;
            peg$parse__();
            s2 = peg$parseScopeExpression();
            if (s2 === peg$FAILED) {
                s2 = null;
            }
            peg$parse__();
            s4 = peg$parseEOF();
            if (s4 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f0(s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseExtraStepFunc() {
            var s0, s2, s4;
            s0 = peg$currPos;
            peg$parse__();
            s2 = peg$parseStepFunctionDefinition();
            if (s2 !== peg$FAILED) {
                peg$parse__();
                s4 = peg$parseEOF();
                if (s4 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f1(s2);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseScopeExpression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            s0 = peg$currPos;
            s1 = peg$parseInScopeExpression();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c0;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e0);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseInScopeExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 44) {
                        s5 = peg$c0;
                        peg$currPos++;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e0);
                        }
                    }
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parse__();
                        s7 = peg$parseInScopeExpression();
                        if (s7 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f2(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseInScopeExpression() {
            var s0;
            s0 = peg$parseStepFunctionDefinition();
            if (s0 === peg$FAILED) {
                s0 = peg$parseVariableAssignment();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseOrdinaryExpression();
                }
            }
            return s0;
        }
        function peg$parseStepFunctionDefinition() {
            var s0, s1, s2, s3, s4, s6, s8, s10, s12, s14;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 4) === peg$c1) {
                s1 = peg$c1;
                peg$currPos += 4;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e1);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                    s2 = undefined;
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    s3 = peg$parse__();
                    s4 = peg$parseIdentifier();
                    if (s4 !== peg$FAILED) {
                        peg$parse__();
                        if (input.charCodeAt(peg$currPos) === 40) {
                            s6 = peg$c2;
                            peg$currPos++;
                        }
                        else {
                            s6 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e2);
                            }
                        }
                        if (s6 !== peg$FAILED) {
                            peg$parse__();
                            s8 = peg$parseFormalParameterList();
                            if (s8 === peg$FAILED) {
                                s8 = null;
                            }
                            peg$parse__();
                            if (input.charCodeAt(peg$currPos) === 41) {
                                s10 = peg$c3;
                                peg$currPos++;
                            }
                            else {
                                s10 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e3);
                                }
                            }
                            if (s10 !== peg$FAILED) {
                                peg$parse__();
                                if (input.charCodeAt(peg$currPos) === 61) {
                                    s12 = peg$c4;
                                    peg$currPos++;
                                }
                                else {
                                    s12 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e4);
                                    }
                                }
                                if (s12 !== peg$FAILED) {
                                    peg$parse__();
                                    s14 = peg$parseOrdinaryExpression();
                                    if (s14 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s0 = peg$f3(s4, s8, s14);
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseFormalParameterList() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            s0 = peg$currPos;
            s1 = peg$parseFormalParameter();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c0;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e0);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseFormalParameter();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 44) {
                        s5 = peg$c0;
                        peg$currPos++;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e0);
                        }
                    }
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parse__();
                        s7 = peg$parseFormalParameter();
                        if (s7 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f4(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseFormalParameter() {
            var s0, s1;
            s0 = peg$currPos;
            s1 = peg$parseIdentifier();
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f5(s1);
            }
            s0 = s1;
            return s0;
        }
        function peg$parseVariableAssignment() {
            var s0, s1, s3, s4, s5, s6;
            s0 = peg$currPos;
            s1 = peg$parseIdentifier();
            if (s1 !== peg$FAILED) {
                peg$parse__();
                if (input.charCodeAt(peg$currPos) === 61) {
                    s3 = peg$c4;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e4);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$currPos;
                    peg$silentFails++;
                    if (input.charCodeAt(peg$currPos) === 61) {
                        s5 = peg$c4;
                        peg$currPos++;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e4);
                        }
                    }
                    peg$silentFails--;
                    if (s5 === peg$FAILED) {
                        s4 = undefined;
                    }
                    else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parse__();
                        s6 = peg$parseOrdinaryExpression();
                        if (s6 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f6(s1, s6);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseOrdinaryExpression() {
            var s0;
            s0 = peg$parseConditionalExpression();
            if (s0 === peg$FAILED) {
                s0 = peg$parseLogicalORExpression();
            }
            return s0;
        }
        function peg$parseConditionalExpression() {
            var s0, s1, s2, s3, s4, s6, s8, s10, s12;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c5) {
                s1 = peg$c5;
                peg$currPos += 2;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e5);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                    s2 = undefined;
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    s3 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 40) {
                        s4 = peg$c2;
                        peg$currPos++;
                    }
                    else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e2);
                        }
                    }
                    if (s4 !== peg$FAILED) {
                        peg$parse__();
                        s6 = peg$parseOrdinaryExpression();
                        if (s6 !== peg$FAILED) {
                            peg$parse__();
                            if (input.charCodeAt(peg$currPos) === 41) {
                                s8 = peg$c3;
                                peg$currPos++;
                            }
                            else {
                                s8 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e3);
                                }
                            }
                            if (s8 !== peg$FAILED) {
                                peg$parse__();
                                s10 = peg$parseOrdinaryExpression();
                                if (s10 !== peg$FAILED) {
                                    peg$parse__();
                                    s12 = peg$parseOrdinaryExpression();
                                    if (s12 === peg$FAILED) {
                                        s12 = null;
                                    }
                                    peg$savedPos = s0;
                                    s0 = peg$f7(s6, s10, s12);
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseVariableReference() {
            var s0, s1, s3;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 36) {
                s1 = peg$c6;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e6);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$parse__();
                s3 = peg$parseIdentifier();
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f8(s3);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseLogicalORExpression() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            s0 = peg$currPos;
            s1 = peg$parseLogicalANDExpression();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.substr(peg$currPos, 2) === peg$c7) {
                    s5 = peg$c7;
                    peg$currPos += 2;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e7);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$currPos;
                    peg$silentFails++;
                    s7 = peg$parseIdentifierPart();
                    peg$silentFails--;
                    if (s7 === peg$FAILED) {
                        s6 = undefined;
                    }
                    else {
                        peg$currPos = s6;
                        s6 = peg$FAILED;
                    }
                    if (s6 !== peg$FAILED) {
                        s7 = peg$parse__();
                        s8 = peg$parseLogicalANDExpression();
                        if (s8 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7, s8];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    if (input.substr(peg$currPos, 2) === peg$c7) {
                        s5 = peg$c7;
                        peg$currPos += 2;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e7);
                        }
                    }
                    if (s5 !== peg$FAILED) {
                        s6 = peg$currPos;
                        peg$silentFails++;
                        s7 = peg$parseIdentifierPart();
                        peg$silentFails--;
                        if (s7 === peg$FAILED) {
                            s6 = undefined;
                        }
                        else {
                            peg$currPos = s6;
                            s6 = peg$FAILED;
                        }
                        if (s6 !== peg$FAILED) {
                            s7 = peg$parse__();
                            s8 = peg$parseLogicalANDExpression();
                            if (s8 !== peg$FAILED) {
                                s4 = [s4, s5, s6, s7, s8];
                                s3 = s4;
                            }
                            else {
                                peg$currPos = s3;
                                s3 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f9(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseLogicalANDExpression() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            s0 = peg$currPos;
            s1 = peg$parseEqualityExpression();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.substr(peg$currPos, 3) === peg$c8) {
                    s5 = peg$c8;
                    peg$currPos += 3;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e8);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$currPos;
                    peg$silentFails++;
                    s7 = peg$parseIdentifierPart();
                    peg$silentFails--;
                    if (s7 === peg$FAILED) {
                        s6 = undefined;
                    }
                    else {
                        peg$currPos = s6;
                        s6 = peg$FAILED;
                    }
                    if (s6 !== peg$FAILED) {
                        s7 = peg$parse__();
                        s8 = peg$parseEqualityExpression();
                        if (s8 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7, s8];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    if (input.substr(peg$currPos, 3) === peg$c8) {
                        s5 = peg$c8;
                        peg$currPos += 3;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e8);
                        }
                    }
                    if (s5 !== peg$FAILED) {
                        s6 = peg$currPos;
                        peg$silentFails++;
                        s7 = peg$parseIdentifierPart();
                        peg$silentFails--;
                        if (s7 === peg$FAILED) {
                            s6 = undefined;
                        }
                        else {
                            peg$currPos = s6;
                            s6 = peg$FAILED;
                        }
                        if (s6 !== peg$FAILED) {
                            s7 = peg$parse__();
                            s8 = peg$parseEqualityExpression();
                            if (s8 !== peg$FAILED) {
                                s4 = [s4, s5, s6, s7, s8];
                                s3 = s4;
                            }
                            else {
                                peg$currPos = s3;
                                s3 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f10(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseEqualityExpression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            s0 = peg$currPos;
            s1 = peg$parseRelationalExpression();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseEqualityOperator();
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseRelationalExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    s5 = peg$parseEqualityOperator();
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parse__();
                        s7 = peg$parseRelationalExpression();
                        if (s7 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f11(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseEqualityOperator() {
            var s0;
            if (input.substr(peg$currPos, 2) === peg$c9) {
                s0 = peg$c9;
                peg$currPos += 2;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e9);
                }
            }
            if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c10) {
                    s0 = peg$c10;
                    peg$currPos += 2;
                }
                else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e10);
                    }
                }
            }
            return s0;
        }
        function peg$parseRelationalExpression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            s0 = peg$currPos;
            s1 = peg$parseAdditiveExpression();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseRelationalOperator();
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseAdditiveExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    s5 = peg$parseRelationalOperator();
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parse__();
                        s7 = peg$parseAdditiveExpression();
                        if (s7 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f12(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseRelationalOperator() {
            var s0;
            if (input.substr(peg$currPos, 2) === peg$c11) {
                s0 = peg$c11;
                peg$currPos += 2;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e11);
                }
            }
            if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c12) {
                    s0 = peg$c12;
                    peg$currPos += 2;
                }
                else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e12);
                    }
                }
                if (s0 === peg$FAILED) {
                    s0 = input.charAt(peg$currPos);
                    if (peg$r0.test(s0)) {
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e13);
                        }
                    }
                }
            }
            return s0;
        }
        function peg$parseAdditiveExpression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            s0 = peg$currPos;
            s1 = peg$parseMultiplicativeExpression();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseAdditiveOperator();
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseMultiplicativeExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    s5 = peg$parseAdditiveOperator();
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parse__();
                        s7 = peg$parseMultiplicativeExpression();
                        if (s7 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f13(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseAdditiveOperator() {
            var s0;
            s0 = input.charAt(peg$currPos);
            if (peg$r1.test(s0)) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e14);
                }
            }
            return s0;
        }
        function peg$parseMultiplicativeExpression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            s0 = peg$currPos;
            s1 = peg$parseExponentiationExpression();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseMultiplicativeOperator();
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseExponentiationExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    s5 = peg$parseMultiplicativeOperator();
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parse__();
                        s7 = peg$parseExponentiationExpression();
                        if (s7 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f14(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseMultiplicativeOperator() {
            var s0;
            s0 = input.charAt(peg$currPos);
            if (peg$r2.test(s0)) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e15);
                }
            }
            return s0;
        }
        function peg$parseExponentiationExpression() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            s0 = peg$currPos;
            s1 = peg$parseUnaryExpression();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.substr(peg$currPos, 2) === peg$c13) {
                    s5 = peg$c13;
                    peg$currPos += 2;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e16);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseExponentiationExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    if (input.substr(peg$currPos, 2) === peg$c13) {
                        s5 = peg$c13;
                        peg$currPos += 2;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e16);
                        }
                    }
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parse__();
                        s7 = peg$parseExponentiationExpression();
                        if (s7 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f15(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseUnaryExpression() {
            var s0, s1, s3;
            s0 = peg$parsePrimaryExpression();
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseUnaryOperator();
                if (s1 !== peg$FAILED) {
                    peg$parse__();
                    s3 = peg$parseUnaryExpression();
                    if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f16(s1, s3);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            return s0;
        }
        function peg$parseUnaryOperator() {
            var s0, s1, s2, s3;
            s0 = input.charAt(peg$currPos);
            if (peg$r1.test(s0)) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e14);
                }
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 3) === peg$c14) {
                    s1 = peg$c14;
                    peg$currPos += 3;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e17);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$currPos;
                    peg$silentFails++;
                    s3 = peg$parseIdentifierPart();
                    peg$silentFails--;
                    if (s3 === peg$FAILED) {
                        s2 = undefined;
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f17();
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            return s0;
        }
        function peg$parsePrimaryExpression() {
            var s0;
            s0 = peg$parseLiteral();
            if (s0 === peg$FAILED) {
                s0 = peg$parsePath();
            }
            return s0;
        }
        function peg$parsePath() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            s0 = peg$currPos;
            s1 = peg$parseStep();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 46) {
                    s5 = peg$c15;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e18);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseStep();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 46) {
                        s5 = peg$c15;
                        peg$currPos++;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e18);
                        }
                    }
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parse__();
                        s7 = peg$parseStep();
                        if (s7 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f18(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseStep() {
            var s0, s1;
            s0 = peg$parseVariableNodeAssignment();
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseFilter();
                if (s1 === peg$FAILED) {
                    s1 = peg$parseSubscript();
                }
                if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f19(s1);
                }
                s0 = s1;
            }
            return s0;
        }
        function peg$parseVariableNodeAssignment() {
            var s0, s1, s3, s4, s5, s6;
            s0 = peg$currPos;
            s1 = peg$parseFilter();
            if (s1 !== peg$FAILED) {
                peg$parse__();
                s3 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 64) {
                    s4 = peg$c16;
                    peg$currPos++;
                }
                else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e19);
                    }
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parse__();
                    s6 = peg$parseIdentifier();
                    if (s6 !== peg$FAILED) {
                        s4 = [s4, s5, s6];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                if (s3 === peg$FAILED) {
                    s3 = null;
                }
                peg$savedPos = s0;
                s0 = peg$f20(s1, s3);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseFilter() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
            s0 = peg$currPos;
            s1 = peg$parseSubscript();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 63) {
                    s4 = peg$c17;
                    peg$currPos++;
                }
                else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e20);
                    }
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 40) {
                        s6 = peg$c2;
                        peg$currPos++;
                    }
                    else {
                        s6 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e2);
                        }
                    }
                    if (s6 !== peg$FAILED) {
                        s7 = peg$parse__();
                        s8 = peg$parseScopeExpression();
                        if (s8 !== peg$FAILED) {
                            s9 = peg$parse__();
                            if (input.charCodeAt(peg$currPos) === 41) {
                                s10 = peg$c3;
                                peg$currPos++;
                            }
                            else {
                                s10 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e3);
                                }
                            }
                            if (s10 !== peg$FAILED) {
                                s3 = [s3, s4, s5, s6, s7, s8, s9, s10];
                                s2 = s3;
                            }
                            else {
                                peg$currPos = s2;
                                s2 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 === peg$FAILED) {
                    s2 = null;
                }
                peg$savedPos = s0;
                s0 = peg$f21(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseSubscript() {
            var s0, s1, s2, s3, s4, s5, s6, s7, s8;
            s0 = peg$currPos;
            s1 = peg$parseBasicStep();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 91) {
                    s4 = peg$c18;
                    peg$currPos++;
                }
                else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e21);
                    }
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parse__();
                    s6 = peg$parseScopeExpression();
                    if (s6 !== peg$FAILED) {
                        s7 = peg$parse__();
                        if (input.charCodeAt(peg$currPos) === 93) {
                            s8 = peg$c19;
                            peg$currPos++;
                        }
                        else {
                            s8 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e22);
                            }
                        }
                        if (s8 !== peg$FAILED) {
                            s3 = [s3, s4, s5, s6, s7, s8];
                            s2 = s3;
                        }
                        else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 === peg$FAILED) {
                    s2 = null;
                }
                peg$savedPos = s0;
                s0 = peg$f22(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseBasicStep() {
            var s0, s1, s2, s4, s6;
            s0 = peg$currPos;
            s1 = peg$parseStepFunctionCall();
            if (s1 === peg$FAILED) {
                s1 = peg$parseProperty();
                if (s1 === peg$FAILED) {
                    s1 = peg$parseChildren();
                    if (s1 === peg$FAILED) {
                        s1 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 40) {
                            s2 = peg$c2;
                            peg$currPos++;
                        }
                        else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e2);
                            }
                        }
                        if (s2 !== peg$FAILED) {
                            peg$parse__();
                            s4 = peg$parseScopeExpression();
                            if (s4 !== peg$FAILED) {
                                peg$parse__();
                                if (input.charCodeAt(peg$currPos) === 41) {
                                    s6 = peg$c3;
                                    peg$currPos++;
                                }
                                else {
                                    s6 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e3);
                                    }
                                }
                                if (s6 !== peg$FAILED) {
                                    peg$savedPos = s1;
                                    s1 = peg$f23(s4);
                                }
                                else {
                                    peg$currPos = s1;
                                    s1 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s1;
                                s1 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s1;
                            s1 = peg$FAILED;
                        }
                        if (s1 === peg$FAILED) {
                            s1 = peg$parseSelf();
                            if (s1 === peg$FAILED) {
                                s1 = peg$parseConstruction();
                                if (s1 === peg$FAILED) {
                                    s1 = peg$parseVariableReference();
                                }
                            }
                        }
                    }
                }
            }
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f24(s1);
            }
            s0 = s1;
            return s0;
        }
        function peg$parseProperty() {
            var s0, s1, s2, s3, s4, s6, s8;
            s0 = peg$currPos;
            s1 = peg$parseIdentifier();
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f25(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseNameLiteral();
                if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f26(s1);
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parseRegularExpressionLiteral();
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f27(s1);
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 4) === peg$c20) {
                            s1 = peg$c20;
                            peg$currPos += 4;
                        }
                        else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e23);
                            }
                        }
                        if (s1 !== peg$FAILED) {
                            s2 = peg$currPos;
                            peg$silentFails++;
                            s3 = peg$parseIdentifierPart();
                            peg$silentFails--;
                            if (s3 === peg$FAILED) {
                                s2 = undefined;
                            }
                            else {
                                peg$currPos = s2;
                                s2 = peg$FAILED;
                            }
                            if (s2 !== peg$FAILED) {
                                s3 = peg$parse__();
                                if (input.charCodeAt(peg$currPos) === 40) {
                                    s4 = peg$c2;
                                    peg$currPos++;
                                }
                                else {
                                    s4 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e2);
                                    }
                                }
                                if (s4 !== peg$FAILED) {
                                    peg$parse__();
                                    s6 = peg$parseScopeExpression();
                                    if (s6 !== peg$FAILED) {
                                        peg$parse__();
                                        if (input.charCodeAt(peg$currPos) === 41) {
                                            s8 = peg$c3;
                                            peg$currPos++;
                                        }
                                        else {
                                            s8 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e3);
                                            }
                                        }
                                        if (s8 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s0 = peg$f28(s6);
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                }
            }
            return s0;
        }
        function peg$parseChildren() {
            var s0, s1;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 42) {
                s1 = peg$c21;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e24);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f29();
            }
            s0 = s1;
            return s0;
        }
        function peg$parseSelf() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$currPos;
            if (input.substr(peg$currPos, 4) === peg$c22) {
                s2 = peg$c22;
                peg$currPos += 4;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e25);
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                peg$silentFails++;
                s4 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s4 === peg$FAILED) {
                    s3 = undefined;
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                    s2 = [s2, s3];
                    s1 = s2;
                }
                else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 === peg$FAILED) {
                s1 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 95) {
                    s2 = peg$c23;
                    peg$currPos++;
                }
                else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e26);
                    }
                }
                if (s2 !== peg$FAILED) {
                    s3 = peg$currPos;
                    peg$silentFails++;
                    s4 = peg$parseIdentifierPart();
                    peg$silentFails--;
                    if (s4 === peg$FAILED) {
                        s3 = undefined;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                    if (s3 !== peg$FAILED) {
                        s2 = [s2, s3];
                        s1 = s2;
                    }
                    else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
            }
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f30();
            }
            s0 = s1;
            return s0;
        }
        function peg$parseStepFunctionCall() {
            var s0, s1, s3, s5, s7;
            s0 = peg$currPos;
            s1 = peg$parseIdentifier();
            if (s1 !== peg$FAILED) {
                peg$parse__();
                if (input.charCodeAt(peg$currPos) === 40) {
                    s3 = peg$c2;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e2);
                    }
                }
                if (s3 !== peg$FAILED) {
                    peg$parse__();
                    s5 = peg$parseArgumentList();
                    if (s5 === peg$FAILED) {
                        s5 = null;
                    }
                    peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 41) {
                        s7 = peg$c3;
                        peg$currPos++;
                    }
                    else {
                        s7 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e3);
                        }
                    }
                    if (s7 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f31(s1, s5);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseArgumentList() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            s0 = peg$currPos;
            s1 = peg$parseOrdinaryExpression();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c0;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e0);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseOrdinaryExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 44) {
                        s5 = peg$c0;
                        peg$currPos++;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e0);
                        }
                    }
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parse__();
                        s7 = peg$parseOrdinaryExpression();
                        if (s7 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f32(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseConstruction() {
            var s0;
            s0 = peg$parseObjectConstruction();
            if (s0 === peg$FAILED) {
                s0 = peg$parseArrayConstruction();
            }
            return s0;
        }
        function peg$parseObjectConstruction() {
            var s0, s1, s3, s5;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 123) {
                s1 = peg$c24;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e27);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$parse__();
                s3 = peg$parsePropertyAssignmentList();
                if (s3 === peg$FAILED) {
                    s3 = null;
                }
                peg$parse__();
                if (input.charCodeAt(peg$currPos) === 125) {
                    s5 = peg$c25;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e28);
                    }
                }
                if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f33(s3);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parsePropertyAssignmentList() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            s0 = peg$currPos;
            s1 = peg$parsePropertyAssignment();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c0;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e0);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parsePropertyAssignment();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 44) {
                        s5 = peg$c0;
                        peg$currPos++;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e0);
                        }
                    }
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parse__();
                        s7 = peg$parsePropertyAssignment();
                        if (s7 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f34(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parsePropertyAssignment() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$currPos;
            s2 = peg$parsePropertyName();
            if (s2 !== peg$FAILED) {
                s3 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 58) {
                    s4 = peg$c26;
                    peg$currPos++;
                }
                else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e29);
                    }
                }
                if (s4 !== peg$FAILED) {
                    s2 = [s2, s3, s4];
                    s1 = s2;
                }
                else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 === peg$FAILED) {
                s1 = null;
            }
            s2 = peg$parse__();
            s3 = peg$parseOrdinaryExpression();
            if (s3 === peg$FAILED) {
                if (input.substr(peg$currPos, 4) === peg$c27) {
                    s3 = peg$c27;
                    peg$currPos += 4;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e30);
                    }
                }
            }
            if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f35(s1, s3);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parsePropertyName() {
            var s0, s1, s3, s5, s7;
            s0 = peg$currPos;
            s1 = peg$parseIdentifier();
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f36(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseStringLiteral();
                if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f37(s1);
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 4) === peg$c20) {
                        s1 = peg$c20;
                        peg$currPos += 4;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e23);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        peg$parse__();
                        if (input.charCodeAt(peg$currPos) === 40) {
                            s3 = peg$c2;
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e2);
                            }
                        }
                        if (s3 !== peg$FAILED) {
                            peg$parse__();
                            s5 = peg$parseScopeExpression();
                            if (s5 !== peg$FAILED) {
                                peg$parse__();
                                if (input.charCodeAt(peg$currPos) === 41) {
                                    s7 = peg$c3;
                                    peg$currPos++;
                                }
                                else {
                                    s7 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e3);
                                    }
                                }
                                if (s7 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s0 = peg$f38(s5);
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseDynDepr();
                    }
                }
            }
            return s0;
        }
        function peg$parseDynDepr() {
            var s0, s1, s3, s5;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 40) {
                s1 = peg$c2;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e2);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$parse__();
                s3 = peg$parseScopeExpression();
                if (s3 !== peg$FAILED) {
                    peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 41) {
                        s5 = peg$c3;
                        peg$currPos++;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e3);
                        }
                    }
                    if (s5 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f39(s3);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseArrayConstruction() {
            var s0, s1, s3, s5;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 91) {
                s1 = peg$c18;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e21);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$parse__();
                s3 = peg$parseElementList();
                if (s3 === peg$FAILED) {
                    s3 = null;
                }
                peg$parse__();
                if (input.charCodeAt(peg$currPos) === 93) {
                    s5 = peg$c19;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e22);
                    }
                }
                if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f40(s3);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseElementList() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            s0 = peg$currPos;
            s1 = peg$parseOrdinaryExpression();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c0;
                    peg$currPos++;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e0);
                    }
                }
                if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseOrdinaryExpression();
                    if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 44) {
                        s5 = peg$c0;
                        peg$currPos++;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e0);
                        }
                    }
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parse__();
                        s7 = peg$parseOrdinaryExpression();
                        if (s7 !== peg$FAILED) {
                            s4 = [s4, s5, s6, s7];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                peg$savedPos = s0;
                s0 = peg$f41(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseIdentifier() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            s2 = peg$parseReservedWord();
            peg$silentFails--;
            if (s2 === peg$FAILED) {
                s1 = undefined;
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseIdentifierName();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f42(s2);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseReservedWord() {
            var s0;
            s0 = peg$parseKeyword();
            if (s0 === peg$FAILED) {
                s0 = peg$parseNullLiteral();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseBooleanLiteral();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseNil();
                    }
                }
            }
            return s0;
        }
        function peg$parseKeyword() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 4) === peg$c22) {
                s1 = peg$c22;
                peg$currPos += 4;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e25);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                    s2 = undefined;
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 95) {
                    s1 = peg$c23;
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e26);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$currPos;
                    peg$silentFails++;
                    s3 = peg$parseIdentifierPart();
                    peg$silentFails--;
                    if (s3 === peg$FAILED) {
                        s2 = undefined;
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                        s1 = [s1, s2];
                        s0 = s1;
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 3) === peg$c8) {
                        s1 = peg$c8;
                        peg$currPos += 3;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e8);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        s2 = peg$currPos;
                        peg$silentFails++;
                        s3 = peg$parseIdentifierPart();
                        peg$silentFails--;
                        if (s3 === peg$FAILED) {
                            s2 = undefined;
                        }
                        else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                        }
                        if (s2 !== peg$FAILED) {
                            s1 = [s1, s2];
                            s0 = s1;
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 2) === peg$c7) {
                            s1 = peg$c7;
                            peg$currPos += 2;
                        }
                        else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e7);
                            }
                        }
                        if (s1 !== peg$FAILED) {
                            s2 = peg$currPos;
                            peg$silentFails++;
                            s3 = peg$parseIdentifierPart();
                            peg$silentFails--;
                            if (s3 === peg$FAILED) {
                                s2 = undefined;
                            }
                            else {
                                peg$currPos = s2;
                                s2 = peg$FAILED;
                            }
                            if (s2 !== peg$FAILED) {
                                s1 = [s1, s2];
                                s0 = s1;
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.substr(peg$currPos, 3) === peg$c14) {
                                s1 = peg$c14;
                                peg$currPos += 3;
                            }
                            else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e17);
                                }
                            }
                            if (s1 !== peg$FAILED) {
                                s2 = peg$currPos;
                                peg$silentFails++;
                                s3 = peg$parseIdentifierPart();
                                peg$silentFails--;
                                if (s3 === peg$FAILED) {
                                    s2 = undefined;
                                }
                                else {
                                    peg$currPos = s2;
                                    s2 = peg$FAILED;
                                }
                                if (s2 !== peg$FAILED) {
                                    s1 = [s1, s2];
                                    s0 = s1;
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.substr(peg$currPos, 2) === peg$c5) {
                                    s1 = peg$c5;
                                    peg$currPos += 2;
                                }
                                else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e5);
                                    }
                                }
                                if (s1 !== peg$FAILED) {
                                    s2 = peg$currPos;
                                    peg$silentFails++;
                                    s3 = peg$parseIdentifierPart();
                                    peg$silentFails--;
                                    if (s3 === peg$FAILED) {
                                        s2 = undefined;
                                    }
                                    else {
                                        peg$currPos = s2;
                                        s2 = peg$FAILED;
                                    }
                                    if (s2 !== peg$FAILED) {
                                        s1 = [s1, s2];
                                        s0 = s1;
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                                if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    if (input.substr(peg$currPos, 3) === peg$c28) {
                                        s1 = peg$c28;
                                        peg$currPos += 3;
                                    }
                                    else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e31);
                                        }
                                    }
                                    if (s1 !== peg$FAILED) {
                                        s2 = peg$currPos;
                                        peg$silentFails++;
                                        s3 = peg$parseIdentifierPart();
                                        peg$silentFails--;
                                        if (s3 === peg$FAILED) {
                                            s2 = undefined;
                                        }
                                        else {
                                            peg$currPos = s2;
                                            s2 = peg$FAILED;
                                        }
                                        if (s2 !== peg$FAILED) {
                                            s1 = [s1, s2];
                                            s0 = s1;
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                    if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        if (input.substr(peg$currPos, 4) === peg$c27) {
                                            s1 = peg$c27;
                                            peg$currPos += 4;
                                        }
                                        else {
                                            s1 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e30);
                                            }
                                        }
                                        if (s1 !== peg$FAILED) {
                                            s2 = peg$currPos;
                                            peg$silentFails++;
                                            s3 = peg$parseIdentifierPart();
                                            peg$silentFails--;
                                            if (s3 === peg$FAILED) {
                                                s2 = undefined;
                                            }
                                            else {
                                                peg$currPos = s2;
                                                s2 = peg$FAILED;
                                            }
                                            if (s2 !== peg$FAILED) {
                                                s1 = [s1, s2];
                                                s0 = s1;
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                        if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            if (input.substr(peg$currPos, 4) === peg$c20) {
                                                s1 = peg$c20;
                                                peg$currPos += 4;
                                            }
                                            else {
                                                s1 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$e23);
                                                }
                                            }
                                            if (s1 !== peg$FAILED) {
                                                s2 = peg$currPos;
                                                peg$silentFails++;
                                                s3 = peg$parseIdentifierPart();
                                                peg$silentFails--;
                                                if (s3 === peg$FAILED) {
                                                    s2 = undefined;
                                                }
                                                else {
                                                    peg$currPos = s2;
                                                    s2 = peg$FAILED;
                                                }
                                                if (s2 !== peg$FAILED) {
                                                    s1 = [s1, s2];
                                                    s0 = s1;
                                                }
                                                else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                            if (s0 === peg$FAILED) {
                                                s0 = peg$currPos;
                                                if (input.substr(peg$currPos, 4) === peg$c1) {
                                                    s1 = peg$c1;
                                                    peg$currPos += 4;
                                                }
                                                else {
                                                    s1 = peg$FAILED;
                                                    if (peg$silentFails === 0) {
                                                        peg$fail(peg$e1);
                                                    }
                                                }
                                                if (s1 !== peg$FAILED) {
                                                    s2 = peg$currPos;
                                                    peg$silentFails++;
                                                    s3 = peg$parseIdentifierPart();
                                                    peg$silentFails--;
                                                    if (s3 === peg$FAILED) {
                                                        s2 = undefined;
                                                    }
                                                    else {
                                                        peg$currPos = s2;
                                                        s2 = peg$FAILED;
                                                    }
                                                    if (s2 !== peg$FAILED) {
                                                        s1 = [s1, s2];
                                                        s0 = s1;
                                                    }
                                                    else {
                                                        peg$currPos = s0;
                                                        s0 = peg$FAILED;
                                                    }
                                                }
                                                else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return s0;
        }
        function peg$parseSourceCharacter() {
            var s0;
            if (input.length > peg$currPos) {
                s0 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e32);
                }
            }
            return s0;
        }
        function peg$parseWhiteSpace() {
            var s0;
            peg$silentFails++;
            s0 = input.charAt(peg$currPos);
            if (peg$r3.test(s0)) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e34);
                }
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                if (peg$silentFails === 0) {
                    peg$fail(peg$e33);
                }
            }
            return s0;
        }
        function peg$parseLineTerminator() {
            var s0;
            s0 = input.charAt(peg$currPos);
            if (peg$r4.test(s0)) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e35);
                }
            }
            return s0;
        }
        function peg$parseLineTerminatorSequence() {
            var s0;
            peg$silentFails++;
            if (input.charCodeAt(peg$currPos) === 10) {
                s0 = peg$c29;
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e37);
                }
            }
            if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c30) {
                    s0 = peg$c30;
                    peg$currPos += 2;
                }
                else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e38);
                    }
                }
                if (s0 === peg$FAILED) {
                    s0 = input.charAt(peg$currPos);
                    if (peg$r5.test(s0)) {
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e39);
                        }
                    }
                }
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                if (peg$silentFails === 0) {
                    peg$fail(peg$e36);
                }
            }
            return s0;
        }
        function peg$parseComment() {
            var s0;
            peg$silentFails++;
            s0 = peg$parseMultiLineComment();
            if (s0 === peg$FAILED) {
                s0 = peg$parseSingleLineComment();
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                if (peg$silentFails === 0) {
                    peg$fail(peg$e40);
                }
            }
            return s0;
        }
        function peg$parseMultiLineComment() {
            var s0, s1, s2, s3, s4, s5;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c31) {
                s1 = peg$c31;
                peg$currPos += 2;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e41);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$currPos;
                peg$silentFails++;
                if (input.substr(peg$currPos, 2) === peg$c32) {
                    s5 = peg$c32;
                    peg$currPos += 2;
                }
                else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e42);
                    }
                }
                peg$silentFails--;
                if (s5 === peg$FAILED) {
                    s4 = undefined;
                }
                else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseSourceCharacter();
                    if (s5 !== peg$FAILED) {
                        s4 = [s4, s5];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$currPos;
                    peg$silentFails++;
                    if (input.substr(peg$currPos, 2) === peg$c32) {
                        s5 = peg$c32;
                        peg$currPos += 2;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e42);
                        }
                    }
                    peg$silentFails--;
                    if (s5 === peg$FAILED) {
                        s4 = undefined;
                    }
                    else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parseSourceCharacter();
                        if (s5 !== peg$FAILED) {
                            s4 = [s4, s5];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                if (input.substr(peg$currPos, 2) === peg$c32) {
                    s3 = peg$c32;
                    peg$currPos += 2;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e42);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s1 = [s1, s2, s3];
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseSingleLineComment() {
            var s0, s1, s2, s3, s4, s5;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c33) {
                s1 = peg$c33;
                peg$currPos += 2;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e43);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$currPos;
                peg$silentFails++;
                s5 = peg$parseLineTerminator();
                peg$silentFails--;
                if (s5 === peg$FAILED) {
                    s4 = undefined;
                }
                else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                }
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseSourceCharacter();
                    if (s5 !== peg$FAILED) {
                        s4 = [s4, s5];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$currPos;
                    s4 = peg$currPos;
                    peg$silentFails++;
                    s5 = peg$parseLineTerminator();
                    peg$silentFails--;
                    if (s5 === peg$FAILED) {
                        s4 = undefined;
                    }
                    else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parseSourceCharacter();
                        if (s5 !== peg$FAILED) {
                            s4 = [s4, s5];
                            s3 = s4;
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                s1 = [s1, s2];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseIdentifierName() {
            var s0, s1, s2, s3;
            peg$silentFails++;
            s0 = peg$currPos;
            s1 = peg$parseIdentifierStart();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseIdentifierPart();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseIdentifierPart();
                }
                peg$savedPos = s0;
                s0 = peg$f43(s1, s2);
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e44);
                }
            }
            return s0;
        }
        function peg$parseIdentifierStart() {
            var s0, s1, s2;
            s0 = input.charAt(peg$currPos);
            if (peg$r6.test(s0)) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e45);
                }
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 92) {
                    s1 = peg$c34;
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e46);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$parseUnicodeEscapeSequence();
                    if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f44(s2);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            return s0;
        }
        function peg$parseIdentifierPart() {
            var s0;
            s0 = peg$parseIdentifierStart();
            if (s0 === peg$FAILED) {
                s0 = input.charAt(peg$currPos);
                if (peg$r7.test(s0)) {
                    peg$currPos++;
                }
                else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e47);
                    }
                }
            }
            return s0;
        }
        function peg$parseLiteral() {
            var s0;
            s0 = peg$parseBooleanLiteral();
            if (s0 === peg$FAILED) {
                s0 = peg$parseNumericLiteral();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseStringLiteral();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseNullLiteral();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parseNil();
                        }
                    }
                }
            }
            return s0;
        }
        function peg$parseNullLiteral() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 4) === peg$c35) {
                s1 = peg$c35;
                peg$currPos += 4;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e50);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                    s2 = undefined;
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f45();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseNil() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c28) {
                s1 = peg$c28;
                peg$currPos += 3;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e31);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                    s2 = undefined;
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f46();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseBooleanLiteral() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 4) === peg$c36) {
                s1 = peg$c36;
                peg$currPos += 4;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e51);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                    s2 = undefined;
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f47();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 5) === peg$c37) {
                    s1 = peg$c37;
                    peg$currPos += 5;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e52);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$currPos;
                    peg$silentFails++;
                    s3 = peg$parseIdentifierPart();
                    peg$silentFails--;
                    if (s3 === peg$FAILED) {
                        s2 = undefined;
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f48();
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            return s0;
        }
        function peg$parseNumericLiteral() {
            var s0, s1, s2, s3;
            peg$silentFails++;
            s0 = peg$currPos;
            s1 = peg$parseHexIntegerLiteral();
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierStart();
                if (s3 === peg$FAILED) {
                    s3 = peg$parseDecimalDigit();
                }
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                    s2 = undefined;
                }
                else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f49(s1);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseDecimalLiteral();
                if (s1 !== peg$FAILED) {
                    s2 = peg$currPos;
                    peg$silentFails++;
                    s3 = peg$parseIdentifierStart();
                    if (s3 === peg$FAILED) {
                        s3 = peg$parseDecimalDigit();
                    }
                    peg$silentFails--;
                    if (s3 === peg$FAILED) {
                        s2 = undefined;
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f50(s1);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            peg$silentFails--;
            if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e53);
                }
            }
            return s0;
        }
        function peg$parseDecimalLiteral() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = peg$parseDecimalIntegerLiteral();
            if (s1 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 46) {
                    s2 = peg$c15;
                    peg$currPos++;
                }
                else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e18);
                    }
                }
                if (s2 !== peg$FAILED) {
                    s3 = [];
                    s4 = peg$parseDecimalDigit();
                    while (s4 !== peg$FAILED) {
                        s3.push(s4);
                        s4 = peg$parseDecimalDigit();
                    }
                    s4 = peg$parseExponentPart();
                    if (s4 === peg$FAILED) {
                        s4 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f51();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 46) {
                    s1 = peg$c15;
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e18);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = [];
                    s3 = peg$parseDecimalDigit();
                    if (s3 !== peg$FAILED) {
                        while (s3 !== peg$FAILED) {
                            s2.push(s3);
                            s3 = peg$parseDecimalDigit();
                        }
                    }
                    else {
                        s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                        s3 = peg$parseExponentPart();
                        if (s3 === peg$FAILED) {
                            s3 = null;
                        }
                        peg$savedPos = s0;
                        s0 = peg$f52();
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parseDecimalIntegerLiteral();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parseExponentPart();
                        if (s2 === peg$FAILED) {
                            s2 = null;
                        }
                        peg$savedPos = s0;
                        s0 = peg$f53();
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
            }
            return s0;
        }
        function peg$parseDecimalIntegerLiteral() {
            var s0, s1, s2, s3;
            if (input.charCodeAt(peg$currPos) === 48) {
                s0 = peg$c38;
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e54);
                }
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseNonZeroDigit();
                if (s1 !== peg$FAILED) {
                    s2 = [];
                    s3 = peg$parseDecimalDigit();
                    while (s3 !== peg$FAILED) {
                        s2.push(s3);
                        s3 = peg$parseDecimalDigit();
                    }
                    s1 = [s1, s2];
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            return s0;
        }
        function peg$parseDecimalDigit() {
            var s0;
            s0 = input.charAt(peg$currPos);
            if (peg$r10.test(s0)) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e55);
                }
            }
            return s0;
        }
        function peg$parseNonZeroDigit() {
            var s0;
            s0 = input.charAt(peg$currPos);
            if (peg$r11.test(s0)) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e56);
                }
            }
            return s0;
        }
        function peg$parseExponentPart() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = peg$parseExponentIndicator();
            if (s1 !== peg$FAILED) {
                s2 = peg$parseSignedInteger();
                if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseExponentIndicator() {
            var s0;
            s0 = input.charAt(peg$currPos);
            if (s0.toLowerCase() === peg$c39) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e57);
                }
            }
            return s0;
        }
        function peg$parseSignedInteger() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            s1 = input.charAt(peg$currPos);
            if (peg$r1.test(s1)) {
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e14);
                }
            }
            if (s1 === peg$FAILED) {
                s1 = null;
            }
            s2 = [];
            s3 = peg$parseDecimalDigit();
            if (s3 !== peg$FAILED) {
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseDecimalDigit();
                }
            }
            else {
                s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseHexIntegerLiteral() {
            var s0, s1, s2, s3, s4;
            s0 = peg$currPos;
            s1 = input.substr(peg$currPos, 2);
            if (s1.toLowerCase() === peg$c40) {
                peg$currPos += 2;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e58);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = [];
                s4 = peg$parseHexDigit();
                if (s4 !== peg$FAILED) {
                    while (s4 !== peg$FAILED) {
                        s3.push(s4);
                        s4 = peg$parseHexDigit();
                    }
                }
                else {
                    s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                    s2 = input.substring(s2, peg$currPos);
                }
                else {
                    s2 = s3;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f54(s2);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseHexDigit() {
            var s0;
            s0 = input.charAt(peg$currPos);
            if (peg$r12.test(s0)) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e59);
                }
            }
            return s0;
        }
        function peg$parseStringLiteral() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 34) {
                s1 = peg$c41;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e60);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseDoubleStringCharacter();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseDoubleStringCharacter();
                }
                if (input.charCodeAt(peg$currPos) === 34) {
                    s3 = peg$c41;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e60);
                    }
                }
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f55(s2);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 39) {
                    s1 = peg$c42;
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e61);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = [];
                    s3 = peg$parseSingleStringCharacter();
                    while (s3 !== peg$FAILED) {
                        s2.push(s3);
                        s3 = peg$parseSingleStringCharacter();
                    }
                    if (input.charCodeAt(peg$currPos) === 39) {
                        s3 = peg$c42;
                        peg$currPos++;
                    }
                    else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e61);
                        }
                    }
                    if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f56(s2);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            return s0;
        }
        function peg$parseNameLiteral() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 96) {
                s1 = peg$c43;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e62);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseBacktickStringCharacter();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseBacktickStringCharacter();
                }
                if (input.charCodeAt(peg$currPos) === 96) {
                    s3 = peg$c43;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e62);
                    }
                }
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f57(s2);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseDoubleStringCharacter() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            s2 = input.charAt(peg$currPos);
            if (peg$r13.test(s2)) {
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e63);
                }
            }
            peg$silentFails--;
            if (s2 === peg$FAILED) {
                s1 = undefined;
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseSourceCharacter();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f58();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 92) {
                    s1 = peg$c34;
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e46);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$parseEscapeSequence();
                    if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f59(s2);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$parseLineContinuation();
                }
            }
            return s0;
        }
        function peg$parseSingleStringCharacter() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            s2 = input.charAt(peg$currPos);
            if (peg$r14.test(s2)) {
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e64);
                }
            }
            peg$silentFails--;
            if (s2 === peg$FAILED) {
                s1 = undefined;
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseSourceCharacter();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f60();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 92) {
                    s1 = peg$c34;
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e46);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$parseEscapeSequence();
                    if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f61(s2);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$parseLineContinuation();
                }
            }
            return s0;
        }
        function peg$parseBacktickStringCharacter() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            s2 = input.charAt(peg$currPos);
            if (peg$r15.test(s2)) {
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e65);
                }
            }
            peg$silentFails--;
            if (s2 === peg$FAILED) {
                s1 = undefined;
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseSourceCharacter();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f62();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 92) {
                    s1 = peg$c34;
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e46);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$parseEscapeSequence();
                    if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f63(s2);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$parseLineContinuation();
                }
            }
            return s0;
        }
        function peg$parseLineContinuation() {
            var s0, s1, s2;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 92) {
                s1 = peg$c34;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e46);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseLineTerminatorSequence();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f64();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseEscapeSequence() {
            var s0, s1, s2, s3;
            s0 = peg$parseCharacterEscapeSequence();
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 48) {
                    s1 = peg$c38;
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e54);
                    }
                }
                if (s1 !== peg$FAILED) {
                    s2 = peg$currPos;
                    peg$silentFails++;
                    s3 = peg$parseDecimalDigit();
                    peg$silentFails--;
                    if (s3 === peg$FAILED) {
                        s2 = undefined;
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f65();
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                    s0 = peg$parseHexEscapeSequence();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parseUnicodeEscapeSequence();
                    }
                }
            }
            return s0;
        }
        function peg$parseCharacterEscapeSequence() {
            var s0;
            s0 = peg$parseSingleEscapeCharacter();
            if (s0 === peg$FAILED) {
                s0 = peg$parseNonEscapeCharacter();
            }
            return s0;
        }
        function peg$parseSingleEscapeCharacter() {
            var s0, s1;
            s0 = input.charAt(peg$currPos);
            if (peg$r16.test(s0)) {
                peg$currPos++;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e66);
                }
            }
            if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 98) {
                    s1 = peg$c44;
                    peg$currPos++;
                }
                else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e67);
                    }
                }
                if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f66();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 102) {
                        s1 = peg$c45;
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e68);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f67();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 110) {
                            s1 = peg$c46;
                            peg$currPos++;
                        }
                        else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e69);
                            }
                        }
                        if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f68();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 114) {
                                s1 = peg$c47;
                                peg$currPos++;
                            }
                            else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e70);
                                }
                            }
                            if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$f69();
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 116) {
                                    s1 = peg$c48;
                                    peg$currPos++;
                                }
                                else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e71);
                                    }
                                }
                                if (s1 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$f70();
                                }
                                s0 = s1;
                                if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    if (input.charCodeAt(peg$currPos) === 118) {
                                        s1 = peg$c49;
                                        peg$currPos++;
                                    }
                                    else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e72);
                                        }
                                    }
                                    if (s1 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s1 = peg$f71();
                                    }
                                    s0 = s1;
                                }
                            }
                        }
                    }
                }
            }
            return s0;
        }
        function peg$parseNonEscapeCharacter() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            s2 = peg$parseEscapeCharacter();
            if (s2 === peg$FAILED) {
                s2 = peg$parseLineTerminator();
            }
            peg$silentFails--;
            if (s2 === peg$FAILED) {
                s1 = undefined;
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseSourceCharacter();
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f72();
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseEscapeCharacter() {
            var s0;
            s0 = peg$parseSingleEscapeCharacter();
            if (s0 === peg$FAILED) {
                s0 = input.charAt(peg$currPos);
                if (peg$r17.test(s0)) {
                    peg$currPos++;
                }
                else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e73);
                    }
                }
            }
            return s0;
        }
        function peg$parseHexEscapeSequence() {
            var s0, s1, s2, s3, s4, s5;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 120) {
                s1 = peg$c50;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e74);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$currPos;
                s4 = peg$parseHexDigit();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseHexDigit();
                    if (s5 !== peg$FAILED) {
                        s4 = [s4, s5];
                        s3 = s4;
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                    s2 = input.substring(s2, peg$currPos);
                }
                else {
                    s2 = s3;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f73(s2);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseUnicodeEscapeSequence() {
            var s0, s1, s2, s3, s4, s5, s6, s7;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 117) {
                s1 = peg$c51;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e75);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$currPos;
                s4 = peg$parseHexDigit();
                if (s4 !== peg$FAILED) {
                    s5 = peg$parseHexDigit();
                    if (s5 !== peg$FAILED) {
                        s6 = peg$parseHexDigit();
                        if (s6 !== peg$FAILED) {
                            s7 = peg$parseHexDigit();
                            if (s7 !== peg$FAILED) {
                                s4 = [s4, s5, s6, s7];
                                s3 = s4;
                            }
                            else {
                                peg$currPos = s3;
                                s3 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                    s2 = input.substring(s2, peg$currPos);
                }
                else {
                    s2 = s3;
                }
                if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f74(s2);
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseRegularExpressionLiteral() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 47) {
                s1 = peg$c52;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e76);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$parseRegularExpressionBody();
                if (s3 !== peg$FAILED) {
                    s2 = input.substring(s2, peg$currPos);
                }
                else {
                    s2 = s3;
                }
                if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 47) {
                        s3 = peg$c52;
                        peg$currPos++;
                    }
                    else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e76);
                        }
                    }
                    if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f75(s2);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseRegularExpressionBody() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            s1 = peg$parseRegularExpressionFirstChar();
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseRegularExpressionChar();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseRegularExpressionChar();
                }
                s1 = [s1, s2];
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseRegularExpressionFirstChar() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            s2 = input.charAt(peg$currPos);
            if (peg$r18.test(s2)) {
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e77);
                }
            }
            peg$silentFails--;
            if (s2 === peg$FAILED) {
                s1 = undefined;
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseRegularExpressionNonTerminator();
                if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$parseRegularExpressionBackslashSequence();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseRegularExpressionClass();
                }
            }
            return s0;
        }
        function peg$parseRegularExpressionChar() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            s2 = input.charAt(peg$currPos);
            if (peg$r19.test(s2)) {
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e78);
                }
            }
            peg$silentFails--;
            if (s2 === peg$FAILED) {
                s1 = undefined;
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseRegularExpressionNonTerminator();
                if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$parseRegularExpressionBackslashSequence();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseRegularExpressionClass();
                }
            }
            return s0;
        }
        function peg$parseRegularExpressionBackslashSequence() {
            var s0, s1, s2;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 92) {
                s1 = peg$c34;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e46);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseRegularExpressionNonTerminator();
                if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseRegularExpressionNonTerminator() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            s2 = peg$parseLineTerminator();
            peg$silentFails--;
            if (s2 === peg$FAILED) {
                s1 = undefined;
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseSourceCharacter();
                if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseRegularExpressionClass() {
            var s0, s1, s2, s3;
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 91) {
                s1 = peg$c18;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e21);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseRegularExpressionClassChar();
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseRegularExpressionClassChar();
                }
                if (input.charCodeAt(peg$currPos) === 93) {
                    s3 = peg$c19;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e22);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s1 = [s1, s2, s3];
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        function peg$parseRegularExpressionClassChar() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            s2 = input.charAt(peg$currPos);
            if (peg$r20.test(s2)) {
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e79);
                }
            }
            peg$silentFails--;
            if (s2 === peg$FAILED) {
                s1 = undefined;
            }
            else {
                peg$currPos = s1;
                s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
                s2 = peg$parseRegularExpressionNonTerminator();
                if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
                s0 = peg$parseRegularExpressionBackslashSequence();
            }
            return s0;
        }
        function peg$parse__() {
            var s0, s1, s2;
            s0 = peg$currPos;
            s1 = [];
            s2 = peg$parseWhiteSpace();
            if (s2 === peg$FAILED) {
                s2 = peg$parseLineTerminatorSequence();
                if (s2 === peg$FAILED) {
                    s2 = peg$parseComment();
                }
            }
            while (s2 !== peg$FAILED) {
                s1.push(s2);
                s2 = peg$parseWhiteSpace();
                if (s2 === peg$FAILED) {
                    s2 = peg$parseLineTerminatorSequence();
                    if (s2 === peg$FAILED) {
                        s2 = peg$parseComment();
                    }
                }
            }
            peg$savedPos = s0;
            s1 = peg$f76();
            s0 = s1;
            return s0;
        }
        function peg$parseEOF() {
            var s0, s1;
            s0 = peg$currPos;
            peg$silentFails++;
            if (input.length > peg$currPos) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$e32);
                }
            }
            peg$silentFails--;
            if (s1 === peg$FAILED) {
                s0 = undefined;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
            return s0;
        }
        let w_loc = typeof options.w_loc === 'undefined' ? false : options.w_loc;
        let w_data = typeof options.w_data === 'undefined' ? true : options.w_data;
        peg$result = peg$startRuleFunction();
        if (options.peg$library) {
            return /** @type {any} */ ({
                peg$result,
                peg$currPos,
                peg$FAILED,
                peg$maxFailExpected,
                peg$maxFailPos
            });
        }
        if (peg$result !== peg$FAILED && peg$currPos === input.length) {
            return peg$result;
        }
        else {
            if (peg$result !== peg$FAILED && peg$currPos < input.length) {
                peg$fail(peg$endExpectation());
            }
            throw peg$buildStructuredError(peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length
                ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
                : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
        }
    }

    /**
     *
     * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
     *
     * @author a-f-m
     */
    /**
     * Parser based on peg.
     */
    class Parser {
        _setting = {
            w_loc: true, // with source locations
            no_empty_left: false, // no empty-left injected
            w_data: true, // data object injected
            startRule: 'Start'
        };
        setting(s) {
            if (s)
                this._setting = { ...this._setting, ...s };
            return this;
        }
        /**
         * @param source apath text
         * @returns parse result
         * @throws ParseError if syntax errors
         */
        parse(source) {
            try {
                const ast = peg$parse(source, this._setting);
                return ast === null ? empty : ast;
            }
            catch (e) {
                const error = e;
                if (error.name !== 'ParseError')
                    throw new ParseError(e.format([{ text: source }])
                        .replace('--> undefined:', 'at (line:column) ')
                        .replace(/ but .*? found/, '') + '\n');
                else
                    throw e;
            }
        }
    }

    var Parser_ = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Parser: Parser
    });

    /**
     * run time module for transpiled js code
     *
     * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
     *
     * @author a-f-m
     */
    // neccessary for work with rollup for now TODO
    var dummy = 0;
    //
    // ------------------ basics -------------------------
    /**
     * rt environment
     */
    class Env {
        incarnation = 0;
        vars = [];
        constructor() {
        }
        incr_incarnation(func_no) {
            this.incarnation++;
            if (this.incarnation > 100)
                throw new ExecutionError(func_no, `execution stack exceeds (incarnation: ${this.incarnation})`);
        }
        copy(e) {
            const e_ = new Env();
            e_.incarnation = this.incarnation;
            e_.vars = [];
            // return Object.assign(new Env(), this)
            return e_;
        }
        dummy() {
            return new Env();
        }
    }
    /**
     * errors during execution
     */
    class ExecutionError extends Error {
        func_no;
        constructor(func_no, message) {
            super(message);
            this.func_no = func_no;
            this.name = 'ExecutionError';
        }
    }
    // ----------------- iter's & eval utilities -------------------------
    /** iter done */
    const done = { value: undefined, done: true };
    /**
     * non-done
     */
    function val(x) {
        return { done: false, value: x };
    }
    /**
     * core iterator corresponding to *S* in Wadler's xpath semantics
     */
    class CoreIter {
        [Symbol.iterator]() { return this; }
        next() { return done; }
        first() {
            const y = this.next();
            return y.done ? undefined : y.value;
        }
        /**
         * convert to core iterator
         * @param it classical iterator
         * @returns core iterator
         */
        static from_it(it) {
            return new class extends CoreIter {
                next() {
                    return it.next();
                }
            };
        }
        /**
         * convert to core iterator from array
         * @param x array
         * @returns core iterator
         */
        static from_array(x) {
            const l = x.length;
            let cnt = -1;
            return new class extends CoreIter {
                next() {
                    if (++cnt >= l)
                        return done;
                    return val(x[cnt]);
                }
            };
        }
        /**
         * wrap any value to an iter if neccessary
         * @param x
         * @returns core iterator
         */
        static optional_wrap(x) { return !single(x) ? x : new SingletonIter(x); }
        /**
         * first value
         */
        static first(x) {
            if (!single(x)) {
                const y = x.next();
                return y.done ? undefined : y.value;
            }
            else {
                return x;
            }
        }
    }
    /**
     * memorizing core iterator
     */
    class MemorizingIter extends CoreIter {
        i = -1;
        mem = [];
        size = 0;
        constructor(it) {
            super();
            if (it) {
                this.mem = [];
                let x;
                while (!(x = it.next()).done)
                    this.mem.push(x);
                this.size = this.mem.length;
            }
        }
        next() {
            return ++this.i >= this.size ? done : this.mem[this.i];
        }
        copy() {
            let m = new MemorizingIter();
            m.mem = this.mem;
            m.size = this.mem.length;
            return m;
        }
    }
    /** nil iter, used when emtpy func eval is intended */
    const nilit = new CoreIter();
    /**
     * singleton iterator
     */
    class SingletonIter extends CoreIter {
        x;
        is_singleton = true;
        consumed = false;
        constructor(x) {
            super();
            this.x = x;
        }
        peek_next() {
            return this.consumed ? done : { value: this.x, done: false };
        }
        next() {
            if (this.consumed) {
                return done;
            }
            else {
                this.consumed = true;
                return { value: this.x, done: false };
            }
        }
    }
    class FinalizingIter extends CoreIter {
        it;
        finalize;
        constructor(it, finalize) {
            super();
            this.it = it;
            this.finalize = finalize;
        }
        next() {
            const next = this.it.next();
            if (next.done)
                this.finalize();
            return next;
        }
    }
    class FinalizingSingletonIter extends SingletonIter {
        finalize;
        constructor(x, finalize) {
            super(x);
            this.finalize = finalize;
        }
        next() {
            const next = super.next();
            if (next.done)
                this.finalize();
            return next;
        }
    }
    class Nest1Iter extends CoreIter {
        env;
        it;
        f;
        nest_it;
        constructor(env, it, f) {
            super();
            this.env = env;
            this.it = it;
            this.f = f;
        }
        next() {
            let y = !this.nest_it ? this.it.next() : this.nest_it.next();
            if (y.done) {
                if (!this.nest_it)
                    return done;
                this.nest_it = undefined;
                return this.next();
            }
            else {
                if (this.nest_it)
                    return y;
                const z = this.f.call(undefined, this.env, y.value);
                if (single(z))
                    return { value: z, done: false };
                this.nest_it = z;
                return this.next();
            }
        }
    }
    // redundant with 'bind' - extra for perf
    function bind_single(func_no, vno, scope_func, x, env, glob_vars) {
        const vars = scope_func === '$global' ? glob_vars : env.vars;
        return vars[vno] = x;
    }
    function bind(func_no, vno, scope_func, x, env, glob_vars) {
        const vars = scope_func === '$global' ? glob_vars : env.vars;
        return vars[vno] = single(x) ? x : new MemorizingIter(x);
    }
    function get_binding_1(func_no, vno, scope_func, env, glob_vars) {
        const v = scope_func === '$global' ? glob_vars[vno] : env.vars[vno];
        if (v === undefined)
            throw new ExecutionError(func_no, `fatal: variable (order no '${vno}') not in stack frame`);
        return single(v) ? v : v.copy();
    }
    function is_apath_iterable(x) {
        if (x === null || x === undefined)
            return false;
        else
            return typeof x[Symbol.iterator] === 'function'
                // cause string is iterable
                && !is_string(x)
                // cause arrays are first class citizens
                && !Array.isArray(x);
    }
    // cause usable by user defined js step functions, a classical name is exported also
    function isApathIterable(x) {
        return is_apath_iterable(x);
    }
    // deferred
    // export function is_iterable(x: any) {
    //     return x !== null && x !== undefined && typeof x[Symbol.iterator] === 'function'
    // }
    // export function is_nilit(x: any) {
    //     return x === nilit || (is_iterable(x) && x.next().done)
    // }
    /** is no iter */
    function single(x) {
        const b = !is_apath_iterable(x);
        // test!!!
        // if (b)
        //     console.log();
        //
        return b;
        // ???check in future: && !(Array.isArray(x))
    }
    /**
     * evaluation of current context sequence corresponding to *S* in Wadler's xpath semantics.
     * if S or f is a single value bypassing is performed to be performant.
     */
    function eval_it(env, S, f) {
        if (typeof f === 'function') {
            // return single(S) ? f.call(undefined, env, S) : eval_it_star(env, S, f)
            return single(S) ? f.call(undefined, env, S) : eval_it_star(env, S, f);
        }
        else {
            return single(S) ? f : eval_it_star_value(S, f);
        }
    }
    /**
     * TODO not in async context !!!
     * actual evaluation for non-single x and a function
     */
    function eval_it_star(env, it, f) {
        return new Nest1Iter(env, it, f);
    }
    /**
     * actual evaluation for non-single x and a value
     */
    function eval_it_star_value(it, v) {
        return new class extends CoreIter {
            next() {
                return it.next().done ? done : { value: v, done: false };
            }
        };
    }
    function arrays_as_seq(x) {
        return Array.isArray(x) ? CoreIter.from_array(x) : x;
    }
    /**
     * classical test according to Wadler
     */
    function test_(x) {
        if (!single(x)) {
            const first = x.next();
            return first.done ?
                false
                : !x.next().done ? // more than one
                    true
                    : test_single(first.value);
        }
        else {
            return test_single(x);
        }
    }
    function test_single(x) {
        return typeof x == "boolean" ? x :
            // (typeof x == "string" ? x.length > 0 : true)
            true;
    }
    // ----------------------- dynamic apath runtime
    var std_funcs = {
        match: 'std_match'
    };
    /**
     * dynamic, parametrizable run time
     */
    class DynApart {
        _setting = {
            // if true then an exception is thrown else no solution is yielded (nilit returned)
            strict_failure: false
        };
        setting(s) {
            if (s)
                this._setting = { ...this._setting, ...s };
            return this;
        }
        /** conversion of subscripts */
        apply_subscript(func_no, x, i) {
            const y = x[i];
            return y === undefined ?
                this.fail(func_no, `index ${i} out of range for ${this.trunc(JSON.stringify(x))}`, nilit)
                : y;
        }
        idx_check(func_no, x) {
            if (typeof x === 'number' && Number.isInteger(x))
                return x;
            else
                return this.fail(func_no, `evaluation to integer expected (found ${this.trunc(x)}, context: subscription)`, -1, true);
        }
        idx_convert(func_no, x) {
            const y = this.force_single_or_nilit(func_no, x, true);
            return y === nilit ? // sufficiency (no is_nilit check) ensured by above line
                y : this.idx_check(func_no, y);
        }
        subscript_check(func_no, x) {
            if (!Array.isArray(x))
                return this.fail(func_no, `object must be an array (found ${this.trunc(x)}, context: subscription)`, undefined, true);
            return true;
        }
        /** forcing single value or empty iter */
        force_single_or_nilit(func_no, x, fail_on_non_single = false) {
            if (!single(x)) {
                const y = x.next();
                if (y.done) {
                    return nilit;
                }
                else {
                    const z = x.next();
                    // const z = peek_next(x)
                    if (!z.done) {
                        return this.fail(func_no, `single value expected (found ${this.trunc(`<${`${y.value}, ${z.value}`}, ...>`)}, context: subscription or comparison or arithmetic or assignment value)`, nilit, fail_on_non_single);
                    }
                }
                return y.value;
            }
            else {
                return x;
            }
        }
        /** checking assignment key */
        ass_key_check(func_no, x) {
            if (is_string(x))
                return true;
            if (x === nilit) // sufficiency (no is_nilit check) ensured earlier force_single_or_nilit
                return false;
            return this.fail(func_no, `evaluation to string expected (found ${this.trunc(x)}, context: assignment key)`, undefined, true);
        }
        array_ing(func_no, x) {
            if (this._setting.arrays_as_seq) {
                if (!single(x)) {
                    const a = [];
                    let y;
                    while (!(y = x.next()).done)
                        a.push(y.value);
                    return a.length == 0 ? nilit : a;
                }
                else {
                    return x;
                }
            }
            else {
                return this.force_single_or_nilit(func_no, x, true);
            }
        }
        /** forcing primitive value or empty iter */
        force_primitive(func_no, x) {
            const y = this.force_single_or_nilit(func_no, x, true);
            if (y === nilit // sufficiency (no is_nilit check) ensured by above line
                || is_primitive(y)) {
                return y;
            }
            else {
                return this.fail(func_no, `for now, evaluation to primitive value expected (found ${this.trunc(y)}, context: comparison or arithmetic)`, undefined, true);
            }
        }
        opt_it_apply(func_no, x, f) {
            if (!single(x)) {
                for (const y of x)
                    f(y);
            }
            else {
                f(x);
            }
        }
        populate_array(func_no, a, x) {
            this.opt_it_apply(func_no, x, (y) => {
                a.push(y);
            });
        }
        embed_objects(func_no, o, x) {
            this.opt_it_apply(func_no, x, (y) => {
                if (is_object(y)) {
                    for (const key in y)
                        if (Object.prototype.hasOwnProperty.call(y, key))
                            o[key] = y[key];
                }
                else {
                    this.fail(func_no, `object expected (found plain value or array: '${JSON.stringify(y)}', context: embedding)`, undefined, true);
                }
            });
        }
        fail(func_no, mess, ret = nilit, force = false) {
            if (force || this._setting.strict_failure)
                throw new ExecutionError(func_no, `${this._setting.strict_failure ? 'strict failure enabled; ' : ''}${mess}; future versions will show source location`);
            else
                return ret;
        }
        trunc(x) {
            return trunc(`'${JSON.stringify(x)}`, 80) + '\'';
        }
        // ----------------- generic eval -------------------------
        gx_property(env, func_no, x, name) {
            // const prop = escape_quote(name)
            // const mess = `object property \\'${escape_quote(name)}\\' not found`
            const y = x[name];
            return y === undefined ? this.fail(func_no, `object property '${escape_quote(name)}' not found`, nilit) : y;
        }
        *gx_property_regex(env, func_no, ctx_node, regex) {
            if (!is_string(regex))
                return this.fail(func_no, "string value expected (context: property regex)", undefined, true);
            if (!is_object(ctx_node))
                return this.fail(func_no, "object expected (context: property regex)", undefined, true);
            for (const key in ctx_node) {
                if (key.match('^' + regex + '$'))
                    yield ctx_node[key];
                // if (key.match(new RegExp(regex))) yield ctx_node[key]
            }
        }
        gx_property_dynamic(env, func_no, ctx_node, p) {
            const y = this.force_single_or_nilit(func_no, p, true);
            if (is_string(y))
                return this.gx_property(env, func_no, ctx_node, y);
            if (y === nilit) // sufficiency (no is_nilit check) ensured by force_single_or_nilit
                return nilit;
            return this.fail(func_no, `evaluation to string expected (found ${this.trunc(y)}, context: dynamic property)`, undefined, true);
        }
        // ----------------- standard step funcs -------------------------
        check_args_num(func_no, n, expected_n, func_name) {
            if (n !== expected_n)
                return this.fail(func_no, `wrong number of arguments (step func '${func_name}')`, undefined, true);
        }
        std_match(env, func_no, ctx_node, regex) {
            this.check_args_num(func_no, arguments.length, 4, 'match');
            if (!is_primitive(ctx_node))
                return nilit;
            if (!is_string(regex))
                return this.fail(func_no, "string value expected (context: 'match(...)')", undefined, true);
            if (regex === '')
                regex = '^$';
            const it = ctx_node.toString().match(new RegExp(regex, ''));
            if (it === null)
                return nilit;
            const ret = { groups: it, ...it.groups };
            delete it.groups;
            delete it.index;
            delete it.input;
            return ret;
        }
        std_text(env, func_no, ctx_node) {
        }
    }
    // console.log('lal'.match('^lal$'))
    // console.log(new RegExp('a', 'g').test('lal'))

    var Apart_ = /*#__PURE__*/Object.freeze({
        __proto__: null,
        CoreIter: CoreIter,
        DynApart: DynApart,
        Env: Env,
        ExecutionError: ExecutionError,
        FinalizingIter: FinalizingIter,
        FinalizingSingletonIter: FinalizingSingletonIter,
        MemorizingIter: MemorizingIter,
        Nest1Iter: Nest1Iter,
        SingletonIter: SingletonIter,
        arrays_as_seq: arrays_as_seq,
        bind: bind,
        bind_single: bind_single,
        done: done,
        dummy: dummy,
        eval_it: eval_it,
        get_binding_1: get_binding_1,
        isApathIterable: isApathIterable,
        is_apath_iterable: is_apath_iterable,
        nilit: nilit,
        single: single,
        std_funcs: std_funcs,
        test_: test_
    });

    /**
     * manager for step funcs.
     *
     * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
     */
    class StepFuncManager {
        sf_descriptors = {};
        contains_async = false;
        // hold seperately for in-mem "new func"-processing
        ctx = {};
        /**
         * adds a js step func
         * @param step_func
         * @returns this
         */
        add_js_func(step_func) {
            const name = step_func.name;
            // if (std_funcs[name]) throw new AnalyseError(`function '${name}' already defined as a standard step function`)
            if (keywords.includes(name))
                throw new AnalyseError(`'${name}' already defined as a standard step function`);
            const descr = this.sf_descriptors[name];
            if (descr && descr.kind === 'apath')
                throw new AnalyseError(`'${name}' already defined as a apath step function`);
            // for now
            if (step_func.constructor.name === 'AsyncGeneratorFunction')
                throw new AnalyseError(`async generator function '${name}' not allowed`);
            //
            this.ctx[name] = step_func;
            const async = async_func(step_func);
            this.contains_async = this.contains_async || async;
            this.sf_descriptors[name] = { name: name, async: async, kind: 'js' };
            return this;
        }
        /**
        * adds a apath step func
        * @param step_func
        * @returns this
        */
        add_apath_func(step_func) {
            const name = step_func.name;
            if (keywords.includes(name))
                return { success: false, mess: `'${name}' is already defined as a standard step function` };
            const descr = this.sf_descriptors[name];
            if (descr)
                return { success: false, mess: `'${name}' already defined as a step function (js or apath)` };
            this.sf_descriptors[name] = { name: name, async: this.contains_async, kind: 'apath', expr: step_func };
            return { success: true, mess: '' };
        }
        clear_apath_funcs() {
            for (const name in this.sf_descriptors) {
                const descr = this.sf_descriptors[name];
                if (descr.kind === 'apath')
                    delete this.sf_descriptors[name];
            }
        }
        set_trp_name(name, trp_name) {
            const descr = this.sf_descriptors[name];
            if (!descr || descr.kind !== 'apath')
                throw new TranspilationError(`apath func ${name} not known`);
            descr.trp_name = trp_name;
        }
        checked_ret_descr(name) {
            if (keywords.includes(name))
                return true;
            return this.sf_descriptors[name];
        }
        get_descr(name) {
            return this.sf_descriptors[name];
        }
        async(name) {
            return this.sf_descriptors[name]?.async;
        }
        copy() {
            const sfman = new StepFuncManager();
            sfman.sf_descriptors = structuredClone(this.sf_descriptors);
            sfman.contains_async = this.contains_async;
            sfman.ctx = this.ctx;
            return sfman;
        }
    }

    /**
     * transpilation module.
     *
     * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
     */
    var in_mem_1 = {
        form: 'func',
        expr_func_inject: (func_name, func_arg) => `ctx.debug?.enabled && ctx.debug('${func_name} (%j)', ${func_arg})`
    };
    var in_mem_2 = {
        form: 'func',
    };
    /**
     * Transpilation of an apath expression to text.
     *
     */
    class Transpiler {
        out_console;
        log_exprs;
        _nocheck;
        /** transpilation result */
        result;
        // '_'-pref cause w/ extra setters
        _sf_manager = new StepFuncManager();
        _mode = in_mem_2;
        _arrays_as_seq = false;
        has_async = false;
        /**
         * @param init.out_console result to console
         * @param init.log_exprs embed expressions in results
         */
        constructor(out_console = false, log_exprs = false, _nocheck = false) {
            this.out_console = out_console;
            this.log_exprs = log_exprs;
            this._nocheck = _nocheck;
            this.result = '';
        }
        /**
         *
         * @param mode transpilation mode
         * @returns this
         */
        mode(v) {
            this._mode = v;
            return this;
        }
        /**
         *
         * @param b arrays will be converted to sequences
         * @returns this
         */
        arrays_as_seq(b) {
            this._arrays_as_seq = b;
            return this;
        }
        /**
         * set_step_func_manager
        */
        sf_manager(v) {
            this._sf_manager = v;
            return this;
        }
        func_cnt = 0;
        new_func_fame(e, is_root) {
            return 'f_' + (is_root ? 'root' : e.type + '_' + this.func_cnt++);
        }
        punch_func(expr, func_name, s) {
            if (this.out_console)
                console.log(s);
            this.punch(this.new_func(expr, func_name, s));
        }
        punch(s) {
            if (this.out_console)
                console.log(s);
            // this.os.write(s)
            this.result += s;
        }
        /**
         * Transpilation. ! Use a new instance of for every transpilation
         * @param expr expression to transpile
         * @returns transpilation result
         * @throws TranspilationError if transpilation errors
         */
        transpile(expr) {
            this.has_async = this.contains_async();
            this.result = '';
            this.trans_root(expr);
            return this.result;
        }
        async_await() {
            return this.has_async ? { async: 'async ', await: 'await ' } : { async: '', await: '' };
        }
        transpile_to_func(expr) {
            this.transpile(expr);
            // console.log(this.result);
            return new Function('ctx', 'apart', 'dynart', `
                ${this.result}
                return ${this.async_await().async} function(env, x) {
                    return ${this.async_await().await} f_root(env, x);
                }`);
            // ...
        }
        punch_vars(root) {
            this.punch(`
            var root;
            var glob_vars = [];
        `);
        }
        trans_root(expr, scope) {
            this.punch_vars(expr);
            const root_func_name = this.new_func_fame(expr, true);
            const tr = this.trans_rec(expr);
            const x = 'x';
            // return ${this.call(tr, 'root')};
            this.punch_func(expr, root_func_name, `
                    ${this.has_async ? '// TODO optimize async/await bubbling' : ''};
                    root = ${x};
                    return ${this.call(tr, 'root')};
        `);
        }
        trans_rec(expr, scope) {
            let new_func_name = this.new_func_fame(expr, false);
            const func_no = this.func_cnt - 1;
            switch (expr.type) {
                case Adt.SequencedExpressions: {
                    const l = tlist_to_array(expr, Adt.SequencedExpressions);
                    if (l.length === 1)
                        return this.trans_rec(l[0]);
                    this.punch_func(expr, new_func_name, `
                    ${this.call_seq_items(l)};
                `);
                    return { snippet: new_func_name, is_scope: expr.data?.is_scope };
                }
                case Adt.DeclarationExpression: {
                    const tr = this.trans_rec(expr.e);
                    this.trans_DeclarationExpression(expr, new_func_name, tr, func_no);
                    return { snippet: new_func_name };
                }
                case Adt.Path: {
                    const tr_r = this.trans_rec(expr.right);
                    if (expr.left.type === Adt.EmptyLeft) {
                        return tr_r;
                    }
                    else {
                        const tr_l = this.trans_rec(expr.left);
                        this.trans_Path(expr, new_func_name, tr_l, tr_r);
                    }
                    return { snippet: new_func_name, is_scope: expr.data?.is_scope };
                }
                case Adt.Filter: {
                    const new_func_name_filter = this.new_func_fame(expr.filter, false);
                    const tr_f = this.trans_rec(expr.filter);
                    this.trans_Filter(expr, new_func_name_filter, tr_f);
                    this.new_spool_func(expr.e, this.trans_rec(expr.e), { snippet: new_func_name_filter }, new_func_name);
                    return { snippet: new_func_name };
                }
                case Adt.Subscript: {
                    const new_func_name_idx = this.new_func_fame(expr, false) + '_idx';
                    const tr_idx = this.trans_rec(expr.idx);
                    this.trans_Subscript(expr, new_func_name_idx, tr_idx, func_no);
                    this.new_spool_func(expr.e, this.trans_rec(expr.e), { snippet: new_func_name_idx }, new_func_name);
                    return { snippet: new_func_name };
                }
                case Adt.VariableBindingNode: {
                    const new_func_name_bind = this.new_func_fame(expr, false) + '_bind';
                    this.punch_func(expr, new_func_name_bind, `
                    return apart.bind_single(${func_no}, ${expr.data.var_stamp.vno}, '${expr.data.var_stamp.scope_func}', x, env, glob_vars);
                `);
                    this.new_spool_func(expr.e, this.trans_rec(expr.e), { snippet: new_func_name_bind }, new_func_name);
                    return { snippet: new_func_name };
                }
                case Adt.VariableBinding: {
                    const tr = this.trans_rec(expr.e);
                    this.punch_func(expr, new_func_name, `
                    const y = ${this.call(tr, 'x')};
                    return apart.bind(${func_no}, ${expr.data.var_stamp.vno}, '${expr.data.var_stamp.scope_func}', y, env, glob_vars);
                `);
                    return { snippet: new_func_name };
                }
                case Adt.VariableApplication: {
                    const is_root = expr.var_name === 'root';
                    if (is_root) {
                        return { inline: true, snippet: `root` };
                    }
                    else {
                        this.punch_func(expr, new_func_name, `
                        return apart.get_binding_1(${func_no}, ${expr.data.var_stamp.vref.data.var_stamp.vno}, '${expr.data.var_stamp.vref.data.var_stamp.scope_func}', env, glob_vars);
                    `);
                        return { snippet: new_func_name };
                    }
                }
                case Adt.Conditional: {
                    const tr_cond = this.trans_rec(expr.condition);
                    const tr_then = this.trans_rec(expr.thenPart);
                    const tr_else = expr.elsePart ? this.trans_rec(expr.elsePart) : undefined;
                    this.trans_Conditional(expr, new_func_name, tr_cond, tr_then, tr_else);
                    return { snippet: new_func_name };
                }
                case Adt.Property: {
                    const prop = escape_quote(expr.name);
                    const mess = `object property \\'${prop}\\' not found`;
                    return {
                        inline: true, func: true,
                        snippet: `(function(env, x){const y = x['${prop}']; return y === undefined ? dynart.fail(-1, '${mess}', apart.nilit) : y})`
                        // snippet: `(function(env, x){return dynart.gx_property(env, ${func_no}, x, '${expr.name}')})`
                    };
                }
                case Adt.PropertyRegex: {
                    const regex = escape_quote(expr.regex);
                    return {
                        inline: true, func: true,
                        snippet: `(function(env, x){return dynart.gx_property_regex(env, ${func_no}, x, '${regex}')})`
                    };
                }
                case Adt.PropertyExpression: {
                    const tr = this.trans_rec(expr.e);
                    return {
                        inline: true, func: true,
                        snippet: `(function(env, x){return dynart.gx_property_dynamic(env, ${func_no}, x, ${this.call(tr, 'x')})})`
                    };
                }
                case Adt.Children: {
                    return {
                        inline: true, func: true,
                        snippet: `function(env, x){return typeof x === 'object' ? apart.CoreIter.from_array(Object.values(x)) : apart.nilit}`
                    };
                }
                case Adt.ComparisonExpression:
                case Adt.BinaryArithmeticExpression: {
                    const tr_left = this.trans_rec(expr.left);
                    const tr_right = this.trans_rec(expr.right);
                    this.trans_BinaryExpression(expr, new_func_name, func_no, tr_left, tr_right);
                    return { snippet: new_func_name };
                }
                case Adt.BinaryLogicalExpression: {
                    const tr_left = this.trans_rec(expr.left);
                    const tr_right = this.trans_rec(expr.right);
                    this.trans_BinaryLogicalExpression(expr, new_func_name, tr_left, tr_right);
                    return { snippet: new_func_name };
                }
                case Adt.UnaryLogicalExpression: {
                    const tr = this.trans_rec(expr.e);
                    this.trans_UnaryLogicalExpression(expr, new_func_name, tr);
                    return { snippet: new_func_name };
                }
                case Adt.UnaryArithmeticExpression: {
                    const tr = this.trans_rec(expr.e);
                    this.trans_UnaryArithmeticExpression(expr, new_func_name, func_no, tr);
                    return { snippet: new_func_name };
                }
                case Adt.FuncCall: {
                    // must be non-inline because of extra args
                    const fname = expr.name;
                    new_func_name = new_func_name + `_call_${fname}`;
                    const std_func_name = std_funcs[fname];
                    if (std_func_name) {
                        this.punch_func(expr, new_func_name, `
                        return ${this.std_func_call(func_no, expr, std_func_name)};
                    `);
                    }
                    else {
                        const descr = this._sf_manager.get_descr(fname);
                        if (descr) {
                            if (descr.kind === 'js') {
                                this.trans_JSFuncCall(expr, new_func_name);
                            }
                            else if (descr.kind === 'apath') {
                                this.trans_ApathFuncCall(expr, new_func_name, descr.expr.formalParameters, func_no);
                            }
                        }
                        else {
                            // if (!this._nocheck) throw new TranspilationError(`fatal: ${fname} not defined`)
                            // TODO no default handling, seems to be used by 'test-mode-func-1' only
                            this.trans_JSFuncCall(expr, new_func_name);
                        }
                    }
                    return { snippet: new_func_name };
                }
                case Adt.ApathFuncDef: {
                    // new_func_name = new_func_name + `_${expr.name}`
                    new_func_name = `f_apath_def_${expr.name}`;
                    this._sf_manager.set_trp_name(expr.name, new_func_name);
                    this.trans_ApathFuncDef(expr, new_func_name);
                    return { inline: true, snippet: `apart.nilit` };
                }
                case Adt.AasStep: {
                    const tr = this.trans_rec(expr.e);
                    if (!this._arrays_as_seq)
                        return tr;
                    return { inline: true, func: true, snippet: `function (env, x) {return apart.arrays_as_seq(${this.call(tr, 'x')})}` };
                }
                case Adt.Literal: {
                    return { inline: true, literal: true, snippet: `(${JSON.stringify(expr.value)})` };
                }
                case Adt.Self: {
                    return { inline: true, func: true, snippet: `/*neccessary due to changing 'x':*/ function (env, x) {return x}` };
                }
                case Adt.Empty: {
                    return { inline: true, snippet: `apart.nilit` };
                }
                case Adt.None: {
                    return { inline: true, literal: true, snippet: `undefined` };
                }
                case Adt.EmptyLeft: {
                    return { inline: true, snippet: `x` };
                }
                case Adt.ObjectExpression:
                case Adt.ArrayExpression:
                    return this.trans_rec_construction(expr, scope);
                default:
                    throw new TranspilationError('transpilation of following expression not implemented:\n' + JSON.stringify(expr, null, 3));
            }
        }
        // extra trans methods to ease overwriting for other target langs (unfortunately, js has no overloading, therefore type is in method name)
        trans_DeclarationExpression(expr, new_func_name, tr, func_no) {
            this.punch_func(expr, new_func_name, `
                    const y = ${this.call(tr, 'x')};
                    return apart.create_finalizing_binding_1(${func_no}, '${expr.var_name}', y, env);
                `);
        }
        trans_Path(expr, new_func_name, tr_l, tr_r) {
            this.punch_func(expr, new_func_name, `
                    const y = ${expr.left.type === Adt.EmptyLeft ? 'x'
            : this.call(tr_l, 'x', false)};
                    return ${this.call(tr_r, 'y', true)};
                `);
        }
        trans_Filter(expr, new_func_name_filter, tr_f) {
            this.punch_func(expr.filter, new_func_name_filter, `
                    const y = ${this.call(tr_f, 'x')};
                    const b = apart.test_(y);
                    return b ? x : apart.nilit;
                `);
        }
        trans_Subscript(expr, new_func_name_idx, tr_idx, func_no) {
            this.punch_func(expr.idx, new_func_name_idx, `
                    const y = ${this.call(tr_idx, 'x')};
                    if (!dynart.subscript_check(${func_no}, x)) return apart.nilit;
                    const idx = dynart.idx_convert(${func_no}, y);
                    if (idx === -1) return apart.nilit;
                    const z = dynart.apply_subscript(${func_no}, x, idx);
                    return z === undefined ? apart.nilit : z;
                `);
        }
        trans_Conditional(expr, new_func_name, tr_cond, tr_then, tr_else) {
            this.punch_func(expr, new_func_name, `
                    const y = ${this.call(tr_cond, 'x')};
                    const b = apart.test_(y);
                    return b ? (${this.call(tr_then, 'x')}) : ${tr_else ? '(' + this.call(tr_else, 'x') + ')' : 'apart.nilit'};
                `);
        }
        trans_BinaryExpression(expr, new_func_name, func_no, tr_left, tr_right) {
            this.punch_func(expr, new_func_name, `
                    // TODO if v1 or v2 are literals we could inline it
                    const v1 = dynart.force_primitive(${func_no}, ${this.call(tr_left, 'x')});
                    const v2 = dynart.force_primitive(${func_no}, ${this.call(tr_right, 'x')});
                    if (v1 === apart.nilit || v2 === apart.nilit) return apart.nilit;
                    return (v1 ${op_map(expr.operator)} v2);
                `);
        }
        trans_UnaryLogicalExpression(expr, new_func_name, tr) {
            this.punch_func(expr, new_func_name, `
                    return (${op_map(expr.operator)} apart.test_(${this.call(tr, 'x')}));
                `);
        }
        trans_BinaryLogicalExpression(expr, new_func_name, tr_left, tr_right) {
            this.punch_func(expr, new_func_name, `
                    return (apart.test_(${this.call(tr_left, 'x')}) 
                            ${op_map(expr.operator)} 
                            apart.test_(${this.call(tr_right, 'x')}));
                `);
        }
        trans_UnaryArithmeticExpression(expr, new_func_name, func_no, tr) {
            this.punch_func(expr, new_func_name, `
                    const v1 = dynart.force_primitive(${func_no}, ${this.call(tr, 'x')});
                    return (${op_map(expr.operator)} v1);
                `);
        }
        trans_JSFuncCall(expr, new_func_name) {
            this.punch_func(expr, new_func_name, `
                    const y = ${this.js_func_call(expr)};
                    return y === undefined ? apart.nilit : y;
                `);
        }
        trans_ApathFuncCall(expr, new_func_name, formalParameters, func_no) {
            const args = tlist_to_array(expr.arguments, Adt.ArgumentList);
            const trs = args.map(e => this.trans_rec(e));
            let i = -1;
            const formal_par_binding = trs.map(tr => {
                i++;
                const vno = formalParameters[i].data.var_stamp.vno;
                const scope_func = formalParameters[i].data.var_stamp.scope_func;
                return `
                    apart.bind(${func_no}, ${vno}, '${scope_func}', ${this.call(trs[i], 'x')}, env_, glob_vars)
                `;
            });
            this.punch_func(expr, new_func_name, `
                    const env_ = env.copy();
                    ${formal_par_binding}
                    env_.incr_incarnation(${func_no});
                    return f_apath_def_${expr.name}(env_, x);
                `);
        }
        trans_ApathFuncDef(expr, new_func_name) {
            const tr = this.trans_rec(expr.body);
            this.punch_func(expr, new_func_name, `
                    return ${this.call(tr, 'x')};
                `);
        }
        new_spool_func(expr, trans_result_left, trans_result_right, func_name) {
            this.punch_func(expr, func_name, `
                    const y = ${this.call(trans_result_left, 'x', false)};
                    return ${this.call(trans_result_right, 'y', true)};
                `);
        }
        call_seq_items(l) {
            let ret = '';
            let i = 0;
            ret += `
                    // for later use
                    let v;`;
            for (const expr of l) {
                const tr = this.trans_rec(expr);
                if (i < l.length - 1) {
                    ret += `
                    v = ${this.call(tr, 'x')}`;
                    if (expr.type === Adt.DeclarationExpression) {
                        ret += `
                    v = apart.create_memoit(v);
                    env = new apart.Env(env).extend_varmap(-1, '${expr.var_name}', v);
                    // console.log(env.toString())`;
                    }
                }
                else {
                    ret += `
                    return ${this.call(tr, 'x')}`;
                }
                i++;
            }
            return ret;
        }
        trans_rec_construction(expr, scope) {
            let new_func_name = this.new_func_fame(expr, false);
            const func_no = this.func_cnt - 1;
            switch (expr.type) {
                case Adt.ObjectExpression: {
                    this.punch_func(expr, new_func_name, `
                    let o = {};
                    ${this.build_property_ass(func_no, expr)}
                    return o;
                `);
                    return { snippet: new_func_name };
                }
                case Adt.ArrayExpression: {
                    this.punch_func(expr, new_func_name, `
                    let a = [];
                    ${this.build_arr_elm_list(func_no, expr)}
                    return a;
                `);
                    return { snippet: new_func_name };
                }
                default:
                    throw new TranspilationError('transpilation of following expression not implemented:\n' + JSON.stringify(expr, null, 3));
            }
        }
        build_property_ass(func_no, expr) {
            // const pref = '\n' + '\t'.repeat(5)
            let ret = '';
            let i = 0;
            for (const item of tlist_to_array(expr.propertyAssignments, Adt.PropertyAssignmentList)) {
                switch (item.type) {
                    case Adt.NamedAssignment: {
                        ret = this.build_named_ass(item, ret, i, func_no);
                        break;
                    }
                    case Adt.EmbeddingExpression: {
                        ret = this.build_embedding(item, ret, i, func_no);
                        break;
                    }
                    default:
                        throw new TranspilationError('transpilation of following expression not implemented:\n' + JSON.stringify(expr, null, 3));
                }
                i++;
            }
            return ret;
        }
        build_named_ass(pa, ret, i, func_no) {
            const key = this.build_property_ass_key(pa.key);
            const tr_val = this.trans_rec(pa.value);
            const value_call = this.call(tr_val, 'x');
            if (!key.simple) {
                ret += `
                    const key${i} = dynart.force_single_or_nilit(${func_no}, ${key.s}, true);
                    const b1_${i} = dynart.ass_key_check(${func_no}, key${i});`;
            }
            if (!tr_val.literal) {
                ret += `
                    const value${i} = ${value_call};
                    const y_${i} = dynart.array_ing(${func_no}, value${i});
                    // const y_${i} = dynart.force_single_or_nilit(${func_no}, value${i}, true);
                    const b2_${i} = y_${i} !== apart.nilit;`;
            }
            const no_inline = !key.simple || !tr_val.literal;
            if (no_inline) {
                const both = !key.simple && !tr_val.literal ? '&&' : '';
                ret += `
                    if (${!key.simple ? `b1_${i}` : ''} ${both} ${!tr_val.literal ? `b2_${i}` : ''})`;
            }
            ret += `
                    ${no_inline ? '   ' : ''}o[${key.simple ? key.s : `key${i}`}] = ${tr_val.literal ? value_call : `y_${i}`}` + ';';
            // !!! remove-prop-semantics to be proved
            // if (!tr_val.literal) {
            //     ret += `
            //             else if (!b2_${i}) o[${key.simple ? key.s : `key${i}`}] = undefined // TODO condition optim`
            // }
            ret += `
                    //------`;
            return ret;
        }
        build_embedding(emb, ret, i, func_no) {
            const value = this.call(this.trans_rec(emb.e), 'x');
            ret += `
                    const value${i} = ${value};`;
            ret += `
                    dynart.embed_objects(${func_no}, o, value${i});`;
            ret += `
                    //------`;
            return ret;
        }
        build_property_ass_key(expr) {
            switch (expr.type) {
                case Adt.Property: return { s: `'${expr.name}'`, simple: true };
                case Adt.PropertyNameExpression:
                    const tr_pn = this.trans_rec(expr.e);
                    return { s: `${this.call(tr_pn, 'x')}` };
                default:
                    throw new TranspilationError('transpilation of following expression not implemented:\n' + JSON.stringify(expr, null, 3));
            }
        }
        build_arr_elm_list(func_no, expr) {
            let ret = '';
            let i = 0;
            for (const elm of tlist_to_array(expr.elements, Adt.ElementList)) {
                const tr_elm = this.trans_rec(elm);
                const value = this.call(tr_elm, 'x');
                if (!tr_elm.literal) {
                    ret += `
                    const value${i} = ${value};`;
                }
                ret += `
                    ${tr_elm.literal ? `a.push(${value})` : `dynart.populate_array(${func_no}, a, value${i})`}` + ';';
                ret += `
                    //------`;
                i++;
            }
            return ret;
        }
        // public for testing
        js_func_call(expr, ctx = 'ctx') {
            let args = this.build_args(expr, 'x');
            // TODO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! only w/o eval generator func due to async
            // return `apart.CoreIter.optional_wrap(${this.async_await().await}${ctx}.${expr.name}(${args}))`
            return `${this.async_await().await}${ctx}.${expr.name}(${args});`;
        }
        // public for testing
        std_func_call(func_no, expr, fname) {
            let args = this.build_args(expr, 'x');
            return `${this.async_await().await}dynart.${fname}(env, ${func_no}, ${args});`;
        }
        build_args(expr, ctx_var) {
            const arg_list = expr.arguments !== null ? tlist_to_array(expr.arguments, Adt.ArgumentList) : [];
            let a = ctx_var;
            for (const arg of arg_list) {
                const tra = this.trans_rec(arg);
                a += `, ${this.call(tra, ctx_var)}`;
            }
            return a;
        }
        contains_async() {
            return this._sf_manager.contains_async;
        }
        new_func(expr, new_func_name, body) {
            return `
                /* ${this.comment(expr)} */
                ${this.has_async
            // || this.contains_async() 
            ? 'async' : ''} function ${new_func_name}(env, x) {
                    ${this._mode.expr_func_inject ? this._mode.expr_func_inject(new_func_name, 'x') : ''}
                    ${body}
                }
                `;
        }
        call(tr, var_name, iter = false, args_ = []) {
            // args
            const wargs = args_.length > 0;
            let args = wargs ? (iter ? ', [' + args_.join(',') + ']' : ',' + args_.join(',')) : '';
            const par = `env, ${var_name}`;
            let ret;
            if (iter) {
                ret = `apart.eval_it(${par}, ${tr.snippet}${args})`;
                return ret;
            }
            else {
                ret = tr.inline ?
                    `(${tr.snippet}${tr.func ? `(${par}${args})` : ''})`
                    : `${this.async_await().await}${tr.snippet}(${par}${args})`;
                return ret;
            }
        }
        comment(expr) {
            return this.log_exprs ? '\n' + JSON.stringify(expr, null, 3) + '\n' : '';
        }
    }

    var Transpiler_ = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Transpiler: Transpiler,
        in_mem_1: in_mem_1,
        in_mem_2: in_mem_2
    });

    /////////////////////////////////////////////////
    // directly copies from 'https://github.com/sindresorhus/strip-json-comments'
    // author: the fabulous developer Sindre Sorhus ('https://sindresorhus.com/apps')
    /////////////////////////////////////////////////
    const singleComment = Symbol('singleComment');
    const multiComment = Symbol('multiComment');
    const stripWithoutWhitespace = () => '';
    const stripWithWhitespace = (string, start, end) => string.slice(start, end).replace(/\S/g, ' ');
    const isEscaped = (jsonString, quotePosition) => {
        let index = quotePosition - 1;
        let backslashCount = 0;
        while (jsonString[index] === '\\') {
            index -= 1;
            backslashCount += 1;
        }
        return Boolean(backslashCount % 2);
    };
    function stripJsonComments(jsonString, { whitespace = true, trailingCommas = false } = {}) {
        if (typeof jsonString !== 'string') {
            throw new TypeError(`Expected argument \`jsonString\` to be a \`string\`, got \`${typeof jsonString}\``);
        }
        const strip = whitespace ? stripWithWhitespace : stripWithoutWhitespace;
        let isInsideString = false;
        let isInsideComment = false;
        let offset = 0;
        let buffer = '';
        let result = '';
        let commaIndex = -1;
        for (let index = 0; index < jsonString.length; index++) {
            const currentCharacter = jsonString[index];
            const nextCharacter = jsonString[index + 1];
            if (!isInsideComment && currentCharacter === '"') {
                // Enter or exit string
                const escaped = isEscaped(jsonString, index);
                if (!escaped) {
                    isInsideString = !isInsideString;
                }
            }
            if (isInsideString) {
                continue;
            }
            if (!isInsideComment && currentCharacter + nextCharacter === '//') {
                // Enter single-line comment
                buffer += jsonString.slice(offset, index);
                offset = index;
                isInsideComment = singleComment;
                index++;
            }
            else if (isInsideComment === singleComment && currentCharacter + nextCharacter === '\r\n') {
                // Exit single-line comment via \r\n
                index++;
                isInsideComment = false;
                buffer += strip(jsonString, offset, index);
                offset = index;
                continue;
            }
            else if (isInsideComment === singleComment && currentCharacter === '\n') {
                // Exit single-line comment via \n
                isInsideComment = false;
                buffer += strip(jsonString, offset, index);
                offset = index;
            }
            else if (!isInsideComment && currentCharacter + nextCharacter === '/*') {
                // Enter multiline comment
                buffer += jsonString.slice(offset, index);
                offset = index;
                isInsideComment = multiComment;
                index++;
                continue;
            }
            else if (isInsideComment === multiComment && currentCharacter + nextCharacter === '*/') {
                // Exit multiline comment
                index++;
                isInsideComment = false;
                buffer += strip(jsonString, offset, index + 1);
                offset = index + 1;
                continue;
            }
            else if (trailingCommas && !isInsideComment) {
                if (commaIndex !== -1) {
                    if (currentCharacter === '}' || currentCharacter === ']') {
                        // Strip trailing comma
                        buffer += jsonString.slice(offset, index);
                        result += strip(buffer, 0, 1) + buffer.slice(1);
                        buffer = '';
                        offset = index;
                        commaIndex = -1;
                    }
                    else if (currentCharacter !== ' ' && currentCharacter !== '\t' && currentCharacter !== '\r' && currentCharacter !== '\n') {
                        // Hit non-whitespace following a comma; comma is not trailing
                        buffer += jsonString.slice(offset, index);
                        offset = index;
                        commaIndex = -1;
                    }
                }
                else if (currentCharacter === ',') {
                    // Flush buffer prior to this point, and save new comma index
                    result += buffer + jsonString.slice(offset, index);
                    buffer = '';
                    offset = index;
                    commaIndex = index;
                }
            }
        }
        return result + buffer + (isInsideComment ? strip(jsonString.slice(offset)) : jsonString.slice(offset));
    }
    // console.log(stripJsonComments('{"a":"b//c"}'))
    // console.log(stripJsonComments('//comment\n{"a":"b"}'))

    function stk_contains(stk, name) {
        for (let i = stk.size() - 1; i >= 0; i--) {
            const e = stk.get(i).get(name);
            if (e)
                return e;
        }
        return undefined;
    }
    /**
     * AST checker, incl, var handling
     */
    class AstChecker {
        sfman;
        result = { errors: false, warnings: false };
        constructor(sfman) {
            this.sfman = sfman;
        }
        /**
         * invokes all processors
         */
        process(root) {
            return this.process_step_funcs(root)
                && this.process_vars(root);
        }
        // pattern:
        // trav(root,
        //     expr => {
        //     },
        //     expr => {
        //     })
        /**
        * process step funcs
        */
        process_step_funcs(root) {
            let ok = true;
            // register
            trav(root, (expr, stk) => {
                if (expr.type === Adt.ApathFuncDef) {
                    const res = this.sfman.add_apath_func(expr);
                    if (!res.success) {
                        ok = false;
                        this.issue('errors', expr, res.mess);
                    }
                    if (stk.size() > 1) ;
                    let params = [];
                    for (const p of expr.formalParameters) {
                        if (params.includes(p.var_name)) {
                            ok = false;
                            this.issue('errors', expr, `duplicate parameter '${p.var_name}'`);
                        }
                        else {
                            params.push(p.var_name);
                        }
                    }
                }
            });
            // check existence
            trav(root, expr => {
                if (expr.type === Adt.FuncCall) {
                    const descr = this.sfman.checked_ret_descr(expr.name);
                    if (!descr) {
                        ok = false;
                        this.issue('errors', expr, `step function '${expr.name}' not defined`);
                    }
                    else {
                        // check arg nums
                        if (descr !== true && descr.kind === 'apath') { // not e.g. 'match'
                            descr.expr?.formalParameters.length;
                            const l = tlist_to_array(expr.arguments, Adt.ArgumentList);
                            if (l.length !== descr.expr?.formalParameters.length) {
                                ok = false;
                                this.issue('errors', expr, `step function call '${expr.name}' has wrong number of parameters`);
                            }
                        }
                        // if (descr.)
                    }
                }
            });
            return ok;
        }
        /**
         * process_vars
         */
        process_vars(root) {
            const global = '$global';
            let var_cnt = 0;
            let ok = true;
            let curr_func_name = global;
            const var_stamp_stk = new Stack();
            trav(root, expr => {
                if (expr.data?.is_scope) {
                    var_stamp_stk.push(new Map());
                }
                if (expr.type === Adt.ApathFuncDef) {
                    curr_func_name = expr.name;
                }
                if (expr.type === Adt.VariableBindingNode || expr.type === Adt.VariableBinding) {
                    const vname = expr.var_name;
                    const vdecl = stk_contains(var_stamp_stk, vname);
                    if (!vdecl) {
                        expr.data = {
                            ...expr.data,
                            var_stamp: { vorigin: true, vno: var_cnt++, scope_func: curr_func_name }
                        };
                        var_stamp_stk.top().set(vname, expr);
                    }
                    else {
                        expr.data = {
                            ...expr.data,
                            var_stamp: { vorigin: false, vno: vdecl.data.var_stamp.vno,
                                scope_func: vdecl.data.var_stamp.scope_func }
                        };
                    }
                    // deferred
                    // if (this.sfman.check_existance(vname)) {
                    //     ok = false
                    //     this.issue('warnings', expr, `variable '${vname}' already defined as a step function`)
                    // }
                }
                if (expr.type === Adt.VariableApplication) {
                    const vname = expr.var_name;
                    if (vname === 'root')
                        return;
                    const vdecl = stk_contains(var_stamp_stk, vname);
                    if (vdecl) {
                        expr.data = {
                            ...expr.data,
                            var_stamp: { vref: vdecl }
                        };
                    }
                    else {
                        ok = false;
                        this.issue('errors', expr, `variable '${vname}' not bound in scope`);
                    }
                }
            }, expr => {
                if (expr.type === Adt.ApathFuncDef)
                    curr_func_name = global;
                if (expr.data?.is_scope) {
                    var_stamp_stk.pop();
                }
            });
            return ok;
        }
        issue(kind, expr, mess) {
            this.result[kind] = true;
            if (!expr.data)
                expr.data = {};
            if (expr.data[kind])
                expr.data[kind].push(mess);
            else
                expr.data[kind] = [mess];
        }
    }

    /**
     * func style apath facade.
     *
     * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
     */
    class Apath {
        mode;
        _setting = {};
        setting(s) {
            if (s)
                this._setting = { ...this._setting, ...s };
            return this;
        }
        sfman = new StepFuncManager();
        /** side effect at parsing: detect empty ast. not thread-save wrt. member */
        empty_ast = false;
        /** side effect at parsing: current ast. not thread-save wrt. member */
        ast = empty;
        /** side effect at parsing: current warnings. not thread-save wrt. member */
        warnings = [];
        /**
         * @param mode default: in-mem mode
         */
        constructor(mode = in_mem_2) {
            this.mode = mode;
        }
        /**
         * @deprecated use {@link add_js_func}
         */
        step_func(f) { return this.add_js_func(f); }
        /**
         * Register step function
         * @param f step function
         * @returns this
         */
        add_js_func(f) {
            this.sfman.add_js_func(f);
            return this;
        }
        // /**
        //  * Register an apath step function
        //  * @param f step function as a textual apath expression 'func f(...) = ...'
        //  * @returns this
        //  */
        // public add_apath_func(f: string): this {
        //     const ast = new Parser().setting({ startRule: 'ExtraStepFunc' }).parse(f)
        //     // TODO review overriding param
        //     this.check_ast(this.sfman, ast)
        //     return this
        // }
        // public add_import(evaluator: Evaluator) {
        //     if (Object.keys(this.sfman.sf_descriptors).length > 0) throw new ApathError('please use this as first action, base properties are not fresh')
        //     const sfman_import = evaluator.sfman
        //     this.sfman.sf_descriptors = sfman_import.sf_descriptors
        // }
        /**
         * transpilation of an apath textual expression
         * @param s apath textual expression
         * @param dynart_setting setting for dynart
         * @returns an evaluator
         * @throws ApathError
         */
        transpile(s, dynart_setting) {
            try {
                this.ast = new Parser().parse(s);
                const fresh_sfman = this.sfman.copy();
                // this.sfman.clear_apath_funcs()
                // const warnings = this.check_ast()
                const astChecker = new AstChecker(fresh_sfman);
                if (!astChecker.process(this.ast)) {
                    if (astChecker.result.errors)
                        throw new AnalyseError(gather_issues(this.ast, 'errors').toString());
                }
                this.warnings = gather_issues(this.ast, 'warnings');
                this.empty_ast = this.ast === empty;
                const trp = new Transpiler()
                    .mode(this.mode)
                    .sf_manager(fresh_sfman)
                    .arrays_as_seq(dynart_setting?.arrays_as_seq ? dynart_setting?.arrays_as_seq : false)
                    .transpile_to_func(this.ast);
                return new Evaluator(fresh_sfman, trp, dynart_setting);
            }
            catch (error) {
                throw new ApathError('error during transpilation', error);
            }
        }
    }
    function error_eval(error) {
        return new ApathError('error during evaluation', error);
    }
    /**
     * Evaluator for transpiled apath expressions.
     * !!! Only one instance per thread.
     */
    class Evaluator {
        sfman;
        transpilat;
        resolved_transpilat;
        // for testing
        env = new Env();
        // only used inderectly by class Apath
        constructor(sfman, transpilat, dynart_setting) {
            this.sfman = sfman;
            this.transpilat = transpilat;
            this.resolved_transpilat = this.transpilat(this.sfman.ctx, Apart_, new DynApart().setting(dynart_setting));
        }
        transpilat_text() {
            return this.transpilat.toString();
        }
        /**
         * Evaluation over an input javascript object
         * @param input input javascript object
         * @returns iterable-iterator of results (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
         */
        evaluate(input) {
            try {
                return CoreIter.optional_wrap(this.resolved_transpilat(this.root_env(input), input));
            }
            catch (error) {
                throw error_eval(error);
            }
        }
        /** Async version of {@link evaluate} */
        async evaluate_async(input) {
            try {
                return CoreIter.optional_wrap(await this.resolved_transpilat(this.root_env(input), input));
            }
            catch (error) {
                throw error_eval(error);
            }
        }
        /**
         * Evaluation over an input javascript object
         * @param input input javascript object
         * @returns the first element in the result iterator (see {@link evaluate})
         */
        evaluate_first(input) {
            try {
                return CoreIter.first(this.resolved_transpilat(this.root_env(input), input));
            }
            catch (error) {
                throw error_eval(error);
            }
        }
        /**
         * Evaluation over an input json object
         * @param json input json object
         * @returns iterable-iterator of results (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
         */
        evaluate_json(json) {
            return this.evaluate(JSON.parse(stripJsonComments(json)));
        }
        /** Async version of {@link evaluate_json} */
        async evaluate_json_async(json) {
            return await this.evaluate_async(JSON.parse(json));
        }
        root_env(input) {
            const env = new Env();
            // only for testing
            // this.env = env
            //
            return env;
        }
    }

    var apath_ = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Apath: Apath,
        Evaluator: Evaluator
    });

    /**
     * Rem.: We follow python naming conventions (https://peps.python.org/pep-0008/) due to readability
     */
    function format_results(results) {
        let s = '';
        for (const result of results) {
            s += JSON.stringify(result, function (key, value) {
                if (Number.isNaN(value)) {
                    return 'NaN';
                }
                return value;
            }, 3) + '\n------\n';
        }
        return s;
    }
    /**
     *
     * @param input json string
     * @param apath_txt apath text
     * @param sfuncs array of step functions as a js string (will be called by 'eval')
     * @param strict_failure strict failure
     * @param arrays_as_seq arrays as sequence
     * @returns \{ result: string, trp: string, empty_ast: boolean, warnings: string[] } where 'result': formatted result string, 'trp': the transpiled code, 'empty_ast': no ast produced (caused by empty 'apath', 'warnings': warnings at transpilation phase)
     */
    function evaluate(input, apath_txt, sfuncs, strict_failure = false, arrays_as_seq = false) {
        const apath = new Apath();
        if (sfuncs) {
            // neccessary for 'eval':
            var apart = Apart_;
            console.log(apart.dummy);
            //
            for (let func of eval(sfuncs)) {
                apath.add_js_func(func);
            }
        }
        const evaluator = apath.transpile(apath_txt, { strict_failure, arrays_as_seq });
        const res = evaluator.evaluate_json(input);
        return { result: format_results(res), trp: evaluator.transpilat_text(), empty_ast: apath.empty_ast, warnings: apath.warnings };
    }

    var apath_func_utils_ = /*#__PURE__*/Object.freeze({
        __proto__: null,
        evaluate: evaluate
    });

    window.Parser__ = Parser_;
    window.Transpiler__ = Transpiler_;
    window.Apart_ = Apart_;
    window.Utils_ = Utils_;
    window.apath_ = apath_;
    window.apath_func_utils_ = apath_func_utils_;

})(fs, path);
