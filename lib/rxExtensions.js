/* eslint-disable func-names */
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concat';
import { STATUS, getStatus } from './index';
import RequestError from './RequestError';

export default () => {
  Observable.prototype.reduxRequest = function (action) {
    return Observable.of({ type: getStatus(action.type, STATUS.FETCHING), status: STATUS.FETCHING })
      .concat(
        this.map(data => ({ type: getStatus(action.type, STATUS.SUCCESS), status: STATUS.SUCCESS, data }))
          .catch(error => Observable.of({ type: getStatus(action.type, STATUS.ERROR), status: STATUS.ERROR, error })));
  };

  Observable.prototype.throwErrorOnFailedRequest = function () {
    return this.mergeMap((action) => {
      if (action instanceof RequestError) {
        return Observable.throw(action);
      }
      return Observable.of(action);
    });
  };

  Observable.prototype.mergeMapOnSucceedRequest = function (cb) {
    return this.mergeMap((action) => {
      if (action && action.status === STATUS.SUCCESS) {
        return cb(action);
      }
      return Observable.of(action);
    });
  };
  Observable.prototype.flatMapOnSucceedRequest = Observable.prototype.mergeMapOnSucceedRequest;

  Observable.prototype.doOnSucceedRequest = function (cb) {
    return this.do((action) => {
      if (action && action.status === STATUS.SUCCESS) cb(action);
    });
  };

  Observable.prototype.filterOnSucceedRequest = function () {
    return this.filter(action => (action && action.status === STATUS.SUCCESS));
  };
};
