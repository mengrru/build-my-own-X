const Promise = require('./promise')

module.exports.resolved = function (value) {
    const p = new Promise()
    p.runPRP(value)
    return p
}
module.exports.rejected = function (reason) {
    const p = new Promise()
    p.rejectedWith(reason)
    return p
}
module.exports.deferred = function () {
    const p = new Promise()
    return {
        promise: p,
        resolve: function (value) {
            p.runPRP(value)
        },
        reject: function (reason) {
            p.rejectedWith(reason)
        }
    }
}