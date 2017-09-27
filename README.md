# universal-rx-request 
[![codecov](https://codecov.io/gh/datacamp/universal-rx-request/branch/master/graph/badge.svg)](https://codecov.io/gh/datacamp/universal-rx-request)
[![npm](https://img.shields.io/npm/l/universal-rx-request.svg)](https://www.npmjs.com/package/universal-rx-request)
[![npm](https://img.shields.io/npm/dt/universal-rx-request.svg)](https://www.npmjs.com/package/universal-rx-request)
[![npm](https://img.shields.io/npm/v/universal-rx-request.svg)](https://www.npmjs.com/package/universal-rx-request)

Lightweight HTTP requests library based on [superagent](https://github.com/visionmedia/superagent) that returns a [RxJS 5](https://github.com/ReactiveX/rxjs) observable. This library works on browser and server side. 

## Install 
This library has peer dependencies of `rxjs@>=5.0.1` and `superagent@>=3.3.0`.
To install via npm for node environment:
```bash
npm install --save superagent rxjs universal-rx-request
```

To install on the browser:
```html
<script type="text/javascript" src="/lib/index.js"></script>
```
The library exposed a global variable called `rxRequest`. It also works with AMD api.

## Basic Example

The library exposes a function which directly makes an HTTP request, depending on the configuration given. The request returns an observable.
```js
import rxRequest from 'universal-rx-request';

rxRequest({ method: 'get', url: 'https://api.ipify.org?format=json' })
  .subscribe(result => console.log(result.body.ip), console.error);
// print your current ip

rxRequest({ method: 'get', url: 'https://wrong-api.com/notFound' })
  .subscribe(result => console.log, error => console.error(error.error.errno));
// print ENOTFOUND
```

## Works great with redux and redux-observable

Importing rx extensions allows more control of the different steps that the request will go through (fetching => success|error). 
```js
import rxRequest from 'universal-rx-request';

rxRequest.importRxExtensions(); // will add operators for the observables. You only have to do once

rxRequest({ method: 'get', url: 'https://api.ipify.org?format=json' })
  .mapToAction({ type: 'get_my_ip' })
  .subscribe(console.log, console.error);
// print the emitted items as a stream
//  |--- { type: 'get_my_ip_fetching', requestStatus: 'fetching' } ------ { type: 'get_my_ip_success', requestStatus: 'success',  data: reponse } ----|

rxRequest({ method: 'get', url: 'https://wrong-api.com/notFound' })
  .mapToAction({ type: 'get_my_ip' })
  .subscribe(console.log, console.error);
// print the emitted items as a stream
//  |--- { type: 'get_my_ip_fetching', requestStatus: 'fetching' } ------ { type: 'get_my_ip_error', requestStatus: 'error',  error: error } ----|
```
Thanks to this rx extension the state can be handled after each step of the HTTP request.

The rx extensions provide some other useful operators:
```js
import rxRequest from 'universal-rx-request';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

rxRequest.importRxExtensions();

rxRequest({ method: 'get', url: 'https://api.ipify.org?format=json' })
  .mapToAction({ type: 'get_my_ip' })
  .mergeMapOnSucceedRequest(result => Observable.of({ ip: result.data.body.ip }))
  .subscribe(console.log, console.error);
// print the emitted items as a stream
//  |--- { type: 'get_my_ip_fetching', requestStatus: 'fetching' } ------ { ip: 'xxx.xxx.xxx.x' } ----|
```

After mapping the request to an action with `maptoAction`, We recommend the use of the extended operators to deal with succeed or failure responses. These are the extended operators which may be useful:
- `throwErrorOnFailedRequest()`: Throws an error if the result of the http request is an error. To handle the error, you will have to catch it in the observable flow.
- `mergeMapOnSucceedRequest((result) => {...})`: Acts like a classic [mergeMap](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-mergeMap) in the Rx world except that it will mergeMap only on succeed request (not fetching or error status). The function given as argument has to return an observable.
- `flatMapOnSucceedRequest((result) => {...})`: An alias for `mergeMapOnSucceedRequest`.
- `concatMapOnSucceedRequest((result) => {...})`: Like `mergeMapOnSucceedRequest` except that it uses the [concatMap](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-concatMap) operator.
- `doOnSucceedRequest((result) => {...})`: Like `mergeMapOnSucceedRequest` except that it uses the [do](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-do) operator for side effects.
- `filterOnSucceedRequest()`: Like `mergeMapOnSucceedRequest` except that it uses the [filter](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-filter) operator.

Please check out the test folder for a great example of how to use these operators correctly.

## APIs

### rxRequest(settings)
Function that makes the HTTP request and returns an observable. Shape of the settings (only url and method fields are required):
```js
 {
  url: 'https://...',
  method: 'get|post|update|...',
  query: {},
  data: {},
  options: {
    only2xx: true|false,
    agent: superagent.agent(),
    json: true|false,
    headers: {},
    withCredentials: true|false,
    responseType: 'blob|...',
    timeout: {
      response: 5000,
      deadline: 60000,
    },
    auth: ['tobi', 'learnboost'],
    redirects: 2,
    attaches: [ ['file', 'test.png'], ...],
    fields: [ ['user', 'Bob'], ...],
  }
 }
```
The function returns an observable which emits an object corresponding to the response of the HTTP request. If an error occurs, the observable emits an error which can be caught in the observable flow. The error emitted is an object containing the `error` and `response` field. For more details about the shapes of the error and response objects, please check the superagent library.

### rxRequest.STATUS
An object containg all the different possible states of the HTTP request:
```js
{
  FETCHING: 'fetching',
  SUCCESS: 'success',
  ERROR: 'error',
}
```

### rxRequest.getStatus(action, status)
Facility to get the type of the emitted action depending on the action object (`{ type: ... }`) and the status (rxRequest.STATUS).

### rxRequest.importRxExtensions()
Function to extend the observable with new operators described above.
