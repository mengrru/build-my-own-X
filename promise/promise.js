// 2.1
const State = {
    PENDING: 0,
    FULFILLED: 1,
    REJECTED: 2
}

// 1.1
module.exports = class Promise {
    constructor (fn) {
        this._state = State.PENDING
        this.x = undefined

        // 1.3
        this._value = undefined
        // 1.5
        this._reason = undefined

        this.nextPromises = []
        this.nextPromisesCount = 0

        this.resolvedCallbacks = []

        if (typeof fn === 'function') {
            fn(this.runPRP.bind(this), this.rejectedWith.bind(this))
        }
    }

    runPRP (x) {
        this.x = x

        if (this === x) {
        // 2.3.1
            this.rejectedWith(new TypeError())
        } else if (x instanceof Promise) {
        // 2.3.2
            switch (x.state) {
                // 2.3.2.1
                case State.PENDING:
                    x.resolvedCallbacks.push((xstate) => {
                        if (xstate === State.FULFILLED) {
                            this.fulfilledWith(x.value)
                        } else if (xstate === State.REJECTED) {
                            this.rejectedWith(x.reason)
                        }
                    })
                    break
                // 2.3.2.2
                case State.FULFILLED:
                    this.fulfilledWith(x.value)
                    break
                // 2.3.2.3
                case State.REJECTED:
                    this.rejectedWith(x.reason)
                    break
            }
        } else if (x !== null
            && (typeof x === 'object' || typeof x === 'function')) {
        // 2.3.3
                let then
                try {
                    // 2.3.3.1
                    then = x.then
                } catch (e) {
                    // 2.3.3.2
                    this.rejectedWith(e)
                }
                if (typeof then === 'function') {
                // 2.3.3.3
                    let hasResolveOrRejectPromiseBeenCalled = false
                    try {
                        then.call(x, (y) => {
                        // 2.3.3.3.1
                            // 2.3.3.3.3
                            if (hasResolveOrRejectPromiseBeenCalled) {
                                return
                            }
                            hasResolveOrRejectPromiseBeenCalled = true
                            // 2.3.3.3.1
                            this.runPRP(y)
                        }, (r) => {
                        // 2.3.3.3.2
                            // 2.3.3.3.3
                            if (hasResolveOrRejectPromiseBeenCalled) {
                                return
                            }
                            hasResolveOrRejectPromiseBeenCalled = true
                            this.rejectedWith(r)
                        })
                    } catch (e) {
                    // 2.3.3.3.4
                        // 2.3.3.3.4.1
                        if (hasResolveOrRejectPromiseBeenCalled) {
                            return
                        }
                        // 2.3.3.3.4.2
                        this.rejectedWith(e)
                    }
                } else {
                // 2.3.3.4
                    this.fulfilledWith(x)
                }
        } else {
        // 2.3.4
            this.fulfilledWith(x)
        }
    }

    execThenCallback (i) {
        let len = 1
        if (typeof i !== 'number') {
            len = this.nextPromisesCount
            i = 0
        }
        // 2.2.6
        for (let j = i; j < len + i; j++) {
            const nextPromise = this.nextPromises[j].promise

            switch (this.state) {
                case State.FULFILLED:
                    const onFulfilled = this.nextPromises[j].onFulfilled
                    if (typeof onFulfilled !== 'function') {
                        return
                    }
                    // 2.2.4
                    setTimeout(() => {
                        try {
                            // 2.2.7.1
                            this.resolveNextPromise(
                                nextPromise,
                                // 2.2.2.1
                                // 2.2.5
                                onFulfilled(this.value)
                            )
                        } catch (e) {
                            // 2.2.7.2
                            nextPromise.rejectedWith(e)
                        }
                    })
                    break
                case State.REJECTED:
                    const onRejected = this.nextPromises[j].onRejected
                    if (typeof onRejected !== 'function') {
                        return
                    }
                    // 2.2.4
                    setTimeout(() => {
                        try {
                            // 2.2.7.1
                            this.resolveNextPromise(
                                nextPromise,
                                //2.2.3.1
                                // 2.2.5
                                onRejected(this.reason)
                            )
                        } catch (e) {
                            // 2.2.7.2
                            nextPromise.rejectedWith(e)
                        }
                    })
                    break
            }
        }
    }

    resolveNextPromise (nextPormise, x) {
        nextPormise.runPRP(x)
    }

    fulfilledWith (value) {
        if (this.state !== State.PENDING) {
            return
        }
        this.value = value
        this.state = State.FULFILLED
    }

    rejectedWith (reason) {
        if (this.state !== State.PENDING) {
            return
        }
        this.reason = reason
        this.state = State.REJECTED
    }

    set state (s) {
        // 2.1.2.1
        // 2.1.3.1
        if (this.state !== State.PENDING
            || this.state === s) {
            return
        }
        this._state = s
        this.resolvedCallbacks.forEach(fn => fn.call(this, s))
        this.execThenCallback()
    }
    get state () {
        return this._state
    }

    set value (v) {
        // 2.1.2.2
        if (this.state === State.FULFILLED
            && this.value !== undefined) {
            return
        }
        this._value = v
    }
    get value () {
        return this._value
    }

    set reason (r) {
        // 2.1.3.2
        if (this.state === State.REJECTED
            && this.reason !== undefined) {
            return
        }
        this._reason = r
    }
    get reason () {
        return this._reason
    }

    then (onFulfilled, onRejected) {
        const i = this.nextPromisesCount
        const nextPromise = new Promise()
        this.nextPromises[i] = {
            promise: nextPromise
        }

        if (typeof onFulfilled === 'function') {
        // 2.2.2
            this.nextPromises[i].onFulfilled = onFulfilled
        } else if (this.state === State.FULFILLED) {
        // 2.2.7.3
            nextPromise.fulfilledWith(this.value)
        } else if (typeof onRejected !== 'function') {
        // 2.2.7.3
            this.resolvedCallbacks.push((state) => {
                if (state === State.FULFILLED) {
                    nextPromise.fulfilledWith(this.value)
                }
            })
        }

        if (typeof onRejected === 'function') {
        // 2.2.3
            this.nextPromises[i].onRejected = onRejected
        } else if (this.state === State.REJECTED) {
        // 2.2.7.4
            nextPromise.rejectedWith(this.reason)
        } else if (typeof onFulfilled !== 'function') {
        // 2.2.7.4
            this.resolvedCallbacks.push((state) => {
                if (state === State.REJECTED) {
                    nextPromise.rejectedWith(this.reason)
                }
            })
        }

        // 2.2.2.1
        // 2.2.3.1
        if (this.state !== State.PENDING) {
            this.execThenCallback(i)
        }

        ++this.nextPromisesCount

        // 2.2.7
        return nextPromise
    }
}