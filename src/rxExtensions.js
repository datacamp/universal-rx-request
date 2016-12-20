/* eslint-disable func-names */
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

const isSuccess = action => action && action.requestStatus === STATUS.SUCCESS;
const isError = action => action && action.requestStatus === STATUS.ERROR;

export const STATUS = {
  FETCHING: 'fetching',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const getStatus = (type, status) => `${type}_${status}`;

export default () => {
  Observable.prototype.mapToAction = function (action) {
    return Observable.of({ type: getStatus(action.type, STATUS.FETCHING), requestStatus: STATUS.FETCHING })
      .concat(
        this.map(data => ({ type: getStatus(action.type, STATUS.SUCCESS), requestStatus: STATUS.SUCCESS, data }))
          .catch(error => Observable.of({ type: getStatus(action.type, STATUS.ERROR), requestStatus: STATUS.ERROR, ...error })));
  };

  Observable.prototype.throwErrorOnFailedRequest = function () {
    return this.mergeMap((action) => {
      if (isError(action)) {
        return Observable.throw(action);
      }
      return Observable.of(action);
    });
  };

  Observable.prototype.mergeMapOnSucceedRequest = function (cb) {
    return this.mergeMap((action) => {
      if (isSuccess(action)) {
        return cb(action);
      }
      return Observable.of(action);
    });
  };
  Observable.prototype.flatMapOnSucceedRequest = Observable.prototype.mergeMapOnSucceedRequest;

  Observable.prototype.concatMapOnSucceedRequest = function (cb) {
    return this.concatMap((action) => {
      if (isSuccess(action)) {
        return cb(action);
      }
      return Observable.of(action);
    });
  };

  Observable.prototype.doOnSucceedRequest = function (cb) {
    return this.do((action) => {
      if (isSuccess(action)) cb(action);
    });
  };

  Observable.prototype.filterOnSucceedRequest = function () {
    return this.filter(action => (isSuccess(action)));
  };
};
