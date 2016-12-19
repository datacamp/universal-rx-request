import 'rxjs/add/operator/toArray';

import { expect, assert } from 'chai';
import superagentMock from 'superagent-mock';
import superagent from 'superagent';
import request from '../src/index';

request.addReduxOperators();

const URL = 'http://test.com/';
const MOVIES = ['Matrix', 'Star Wars', 'The Social Network'];
const SETTINGS = { method: 'get', url: `${URL}get_movies`, data: {}, query: {}, options: { headers: {}, json: true, only2xx: true } };
const TYPE = 'get_movies';

const STATUS = request.STATUS;
const getStatus = request.getStatus;

let mock = null;

describe('Test extended operators', () => {
  before(() => {
    mock = superagentMock(superagent, [
      {
        pattern: `${URL}(.*)`,
        fixtures: (match, params, headers) => {
          switch (match[1]) {
            case 'get_movies':
              return { movies: MOVIES };
            default: throw new Error(404);
          }
        },
        get: (match, data) => ({ ok: true, code: 200, body: data }),
      },
    ]);
  });

  it('Does GET request and map to an action', (done) => {
    request(SETTINGS).mapToAction({ type: TYPE }).toArray().subscribe(
      (result) => {
        const [fetching, success] = result;
        expect(fetching.requestStatus).to.equal(request.STATUS.FETCHING);
        expect(fetching.type).to.equal(getStatus(TYPE, STATUS.FETCHING));

        expect(success.requestStatus).to.equal(request.STATUS.SUCCESS);
        expect(success.type).to.equal(getStatus(TYPE, STATUS.SUCCESS));
        expect(success.data).to.deep.equal({ ok: true, code: 200, body: { movies: MOVIES } });
      },
      error => assert(false, error),
      done);
  });

  after(() => {
    mock.unset();
  });
});
