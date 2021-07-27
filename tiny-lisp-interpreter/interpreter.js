/*** Main ***/

/* Error Defination */
class ReferenceError extends Error {
    constructor(message) {
        super('Reference Error: ' + message)
    }
}

/* Type Defination */
class Meta {
    constructor(value) {
        this.value = value
    }
}
class Sym extends Meta {
    constructor(value) {
        super(value)
    }
}
class Procedure {
    constructor(parms, body, env) {
        this.parms = parms
        this.body = body
        this.env = env
    }
    execute(args) {
        return eval(this.body, new Env(this.parms, args, this.env))
    }
}

/* Environments */
class Env {
    constructor(parms=[], args=[], outer=null) {
        this.e = new Object()
        this.init(parms, args)
        this.outer = outer
    }
    find(vari) {
        if ((! (vari in this.e)) && (! this.outer)) {
            throw new ReferenceError('variable ' + vari + ' is undefined.')
        }
        return vari in this.e ? this.e : this.outer.find(vari)
    }
    init(keys, values) {
        keys.forEach((key, index) => {
            this.e[key.value] = values[index]
        })
    }
    assign(subEnv) {
        Object.assign(this.e, subEnv)
    }
    add(key, value) {
        this.e[key] = value
    }
}

const baseEnv = {
        'abs': Math.abs,
        'max': Math.max,
        'min': Math.min,
        'pi': Math.PI,
        'round': Math.round,
        'floor': Math.floor,
        'ceil': Math.ceil,
        'pow': Math.pow,
        '+': (x, y) => x + y,
        '-': (x, y) => x - y,
        '*': (x, y) => x * y,
        '/': (x, y) => x / y,
        '>': (x, y) => x > y,
        '<': (x, y) => x < y,
        '>=': (x, y) => x >= y,
        '<=': (x, y) => x <= y,
        '=': (x, y) => x == y,
        'car': x => x[0],
        'cdr': x => x.slice(1),
        'cons': (x, y) => [x, ...y],
        'eq?': (x, y) => x === y,
        'equal?': (x, y) => x instanceof Sym ? x.value == y.value : x == y,
        'length': x => x.length,
        'list': function(...e){return e},
        'list?': x => x instanceof Array,
        'not': x => ! x,
        'null?': x => x instanceof Array && x.length == 0,
        'number?': x => x instanceof Number,
        'begin': function(){ return Array.prototype.slice(arguments, 1) },
}
// append, apply, equal?, list, map, procedure?, symbol?
let global_env = new Env()
global_env.assign(baseEnv)

/* Abstraction Syntax Tree */
function parse(program) {
    return read_from_tokens(tokenize(program))
}
function tokenize(program) {
    return program.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').split(' ')
}
function read_from_tokens(tokens) {
    if (tokens.length === 0) {
        throw new Error('unexpected EOF while reading')
    }
    let token = tokens.shift()
    while (token === '') {
        token = tokens.shift()
    }
    if ('(' === token) {
        let L = []
        while (tokens[0] === '') {
            tokens.shift()
        }
        while (tokens[0] !== ')') {
            L.push(read_from_tokens(tokens))
            while (tokens[0] === '') {
                tokens.shift()
            }
        }
        tokens.shift()
        return L
    } else if (')' === token) {
        throw new Error('unexpected )')
    } else {
        return atom(token)
    }
}
function atom(token) {
    let temp = parseInt(token)
    if (isNaN(temp)) {   
        return new Sym(token)
    } else if (token - temp === 0) {
        return temp
    } else {
        return parseFloat(token)
    }
}

/* Eval */
function eval(x, env=global_env) {
    if (x instanceof Sym) {
        return env.find(x.value)[x.value]
    } else if (! (x instanceof Array)) {
        return x
    } else if (x[0].value == 'if') {
        let [sym, test, conseq, alt] = x
        let exp = (eval(test, env) ? conseq : alt)
        return eval(exp, env)
    } else if (x[0].value == 'define') {
        let [vari, exp] = x.slice(1)
        env.add(vari.value, eval(exp, env))
    } else if (x[0].value == 'lambda') {
        let [parms, body] = x.slice(1)
        return new Procedure(parms, body, env)
    } else if (x[0].value == 'quote') {
        let [sym, exp] = x
        return exp
    } else {
        let proc = eval(x[0], env)
        let args = []
        x.slice(1).forEach(function(arg) {
            args.push(eval(arg, env))
        })
        if (proc instanceof Procedure) {
            return proc.execute.call(proc, args)
        }
        return proc.apply(this, args)
    }
}

module.exports = function interpret (row) {
    return eval(parse(row))
}

process.stdin.setEncoding( 'utf8' );
process.stdin.on( 'readable', function() {
    var chunk = process.stdin.read();
    if (chunk) {
        try {
            console.log(eval(parse(chunk)))
        } catch(err) {
            console.log(err.message)
        }
    }
    console.log('lispy>')
} );