# universal-rx-request 
[![codecov](https://codecov.io/gh/datacamp/universal-rx-request/branch/master/graph/badge.svg)](https://codecov.io/gh/datacamp/universal-rx-request)

Ligthweight HTTP requests library based on [superagent](https://github.com/visionmedia/superagent) that returns a [RxJS 5](https://github.com/ReactiveX/rxjs) observable. This library works on browser and server side. 

## Install 
This library has peer dependencies of `rxjs@>=5.0.1` and `superagent@>=3.3.0`.
To install via npm for node environment:
```
npm install --save superagent rxjs universal-rx-request
```

To install on the browser:
```
<script type="text/javascript" src="/lib/index.js"></script>
```
The library exposed a global variable called `rxRequest`. It also works with AMD api.

