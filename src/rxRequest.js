import superagent from 'superagent';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concat';

export const STATUS = {
  FETCHING: 'fetching',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const getStatus = (type, status) => `${type}_${status}`;

export default ({ url, method = 'get', options = {}, query = {}, data = {} }) => {
  return Observable.create((subscriber) => {
    let request = superagent[method](url).type(options.type || 'json').query(query).send(data);
    if (options.json) request = request.serialize();
    if (options.headers) request = request.set(options.headers);
    if (options.withCredentials) request = request.withCredentials();

    request.end((error, response) => {
      if (error) {
        subscriber.error({ error, response });
      }
      if (!response || (options.only2xx && !response.ok)) {
        subscriber.error({ error: 'not 2xx', response });
      }

      subscriber.next({ ...response });
      subscriber.complete();
    });
    return () => request && request.abort();
  });
};
