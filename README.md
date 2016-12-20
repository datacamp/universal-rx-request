# universal-rx-request 
[![codecov](https://codecov.io/gh/datacamp/universal-rx-request/branch/master/graph/badge.svg)](https://codecov.io/gh/datacamp/universal-rx-request)

Ligthweight HTTP requests library based on [superagent](https://github.com/visionmedia/superagent) that returns a [RxJS 5](https://github.com/ReactiveX/rxjs) observable. This library works on browser and server side. 

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

The library exposes a function which makes directly the HTTP request depending of the configuration you give. The request will return an observable.
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

You can import rx extensions which allow you to have more controls on the different steps that the request will going through (fetching => success|error). 
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
Thanks to this rx extension you will be able to handle your state after each step of the HTTP request.

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

Once you map the request to an action with `maptoAction`, We recommand you to use the extended operators to deal with succeed or failure request. these are the extended operators which may be useful:
- `throwErrorOnFailedRequest()`: It will throw an error if the result of the http request is an error. To handle the error, you will have to catch it in the observable flow.
- `mergeMapOnSucceedRequest((result) => {...})`: It acts like a classic `mergeMap` in the Rx world except that it will mergeMap only on succeed request (not fetching or error status). The function given as argument has to return an observable.
- `flatMapOnSucceedRequest((result) => {...})`: It's an alias for `mergeMapOnSucceedRequest`.
- `concatMapOnSucceedRequest((result) => {...})`: It's like `mergeMapOnSucceedRequest` except that it use the `concatMap` operator.
- `doOnSucceedRequest((result) => {...})`: It's like `mergeMapOnSucceedRequest` except that it use the `do` operator to do side effects.
- `filterOnSucceedRequest()`: It's like `mergeMapOnSucceedRequest` except that it use the `fitler` operator.

I invite you to check out the test folder which contains great example of how to use these operators correctly.
