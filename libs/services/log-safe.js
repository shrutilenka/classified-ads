/**
 * Author: https://gist.github.com/hyamamoto/
 * Credit: https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 *
 * @param {string} s a string
 * @return {number} a hash code value for the given string.
 */
function hashCode(s) {
    var h = 0,
        l = s.length,
        i = 0
    if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0
    return h
}

/**
 * SafeLogError is an Error. A JS Error wrapper that limits `err.message` to some fixed length if the same error
 * has been seen in a time window. The "same" error is defined either by the same exact message, or the same message
 * plus the same stack, or with a user defined callback that decides uniqueness.
 *
 * `format` reformats (err.message, err.stack). If not provided, we split the err.message by: str.slice(0, 120) + nearest function call in the stack
 * 120 is chosen arbitrarily in SafeLogError while It is generally a good length of a line (Word wrap in IDEs)
 * `unique` uniqueness function. If not provided, we calculate err.message + err.stack
 * 
 * The return object is a "safe to log" error object. Stack is left intact ! You are supposed to only log the message (knowing the purpose of this !)
 *
 * @param {Number} window time window expressed in milliseconds
 * @param {Function} format reformats (err.message, err.stack). Default shorted err.message and shorted nearest call stack
 * @param {Function} unique uniqueness function. Default: err.message + err.stack
 * @returns {Error} LogSafeError instance
 */
function SafeLogError(window, format, unique) {
    let history = []
    class LogSafeError extends Error {
        constructor(err) {
            super(err)
            this.name = 'LogSafeError'

            const print = unique ? unique(err.message, err.stack) : err.message + err.stack
            this.hash = hashCode(print)
            this.time = new Date().getTime()
            const earliers = history.filter((err) => err[0] === this.hash)
            const latest = Math.max(earliers.map((err) => err[2]))
            // console.log(latest)
            history.push([this.hash, Math.random(), this.time])
            this.message = format
                ? format(err.message, err.stack)
                : err.message.slice(0, 120) + '\t' +err.stack.split('/n')[1].slice(4, 120)
            if (this.time - latest < window) this.message = this.hash
            // There is no Stack format standard (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack)
            // Do no modify stack.
        }
    }

    return LogSafeError
}

export default SafeLogError

// Example
function test(safeLogger1) {
    try {
        null.f()
    } catch (error) {
        throw new safeLogger1(error);
    }

}
const unique = (message, stack) => message + stack
let format = (message, stack) => message.slice(0, 120) + '\t' +stack.split('/n')[1].slice(4, 120)
let window = 100 // milliseconds
const safeLogger1 = SafeLogError(window, format, unique)
for (let index = 0; index < 100; index++) {
    try {
        test(safeLogger1);
    } catch (err) {
        console.log(err.message);
    }
}
