export default class RequestError extends Error {
  constructor(err) {
    const message = JSON.stringify(err, null, 2);
    super();
    this.name = this.constructor.name;
    this.error = err && err.error;
    this.data = err && err.data;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}
