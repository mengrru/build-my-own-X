const interpret = require('./interpreter')
const cases = require('./cases')

const notPassMsg = []

const isEqual = function (a, b) {
    try {
        if (Array.isArray(a)) {
            if (a.length !== b.length) {
                return false
            }
            for (let i = 0; i < a.length; i++) {
                if (!isEqual(a[i], b[i])) {
                    return false
                }
            }
            return true
        } else if (typeof a === 'number') {
            return a.toFixed(5) === b.toFixed(5)
        }
         else {
            return a === b
        }
    } catch (_) {
        return false
    }
}

cases.forEach(c => {
    const rows = c.rows
    const rightRes = c.result
    let res
    for (let i = 0; i < rows.length; i++) {
        const r = interpret(rows[i])
        if (i === rows.length - 1) {
            res = r
        }
    }
    if (!isEqual(res, rightRes)) {
        const msg = '[not pass]' + ' your result: ' + res + ' right result: ' + rightRes
        notPassMsg.push(msg)
        console.log(msg)
    } else {
        console.log('[passed]' + ' your result: ' + res)
    }
})

if (notPassMsg.length === 0) {
    console.log('All passed!')
}

process.exit()