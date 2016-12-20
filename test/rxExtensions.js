import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/of';

import { expect, assert } from 'chai';
import superagentMock from 'superagent-mock';
import superagent from 'superagent';
import request from '../src/index';

request.importRxExtensions();

const URL = 'http://test.com/';
const MOVIES = ['Matrix', 'Star Wars', 'The Social Network'];
const SETTINGS = { method: 'get', url: `${URL}get_movies`, data: {}, query: {}, options: { headers: {}, json: true, only2xx: true } };
const TYPE = 'get_movies';
const ACTION_DISPATCHED = 'action_dispatched';
const STATUS = request.STATUS;
const getStatus = request.getStatus;

let mock = null;

describe('Tests the extended operators', () => {
  before(() => {
    mock = superagentMock(superagent, [
      {
        pattern: `${URL}(.*)`,
        fixtures: (match) => {
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

  it('Tests mapToAction operator', (done) => {
    request(SETTINGS).mapToAction({ type: TYPE }).toArray().subscribe(
      (results) => {
        const [fetching, success] = results;

        expect(fetching.requestStatus).to.equal(request.STATUS.FETCHING);
        expect(fetching.type).to.equal(getStatus(TYPE, STATUS.FETCHING));

        expect(success.requestStatus).to.equal(request.STATUS.SUCCESS);
        expect(success.type).to.equal(getStatus(TYPE, STATUS.SUCCESS));
        expect(success.data).to.deep.equal({ ok: true, code: 200, body: { movies: MOVIES } });
      },
      error => assert(false, error),
      done);
  });

  it('Tests throwErrorOnFailedRequest operator', (done) => {
    request({ SETTINGS, url: `${URL}wrong_url` }).mapToAction({ type: TYPE })
      .throwErrorOnFailedRequest().toArray()
      .subscribe(
        (fetching) => {
          expect(fetching.requestStatus).to.equal(request.STATUS.FETCHING);
          expect(fetching.type).to.equal(getStatus(TYPE, STATUS.FETCHING));
        },
        (error) => {
          expect(error.requestStatus).to.equal(request.STATUS.ERROR);
          expect(error.type).to.equal(getStatus(TYPE, STATUS.ERROR));
          expect(error.error).to.deep.equal(new Error(404));
          expect(error.response.notFound).to.equal(true);
          done();
        });
  });

  it('Tests mergeMapOnSucceedRequest operator', (done) => {
    let actionId = 0;
    request(SETTINGS).mapToAction({ type: TYPE }).concat(request(SETTINGS).mapToAction({ type: TYPE }))
      .mergeMapOnSucceedRequest((result) => {
        actionId += 1;
        return Observable.of({ type: ACTION_DISPATCHED, result: result.data.body.movies, actionId })
          .delay(20 / actionId);
      })
      .toArray()
      .subscribe(
        (results) => {
          const [firstResult, secondResult] = results.filter(item => item.type === ACTION_DISPATCHED);

          expect(firstResult.type).to.equal('action_dispatched');
          expect(firstResult.result).to.deep.equal(MOVIES);

          expect(firstResult.actionId).to.equal(2);
          expect(secondResult.actionId).to.equal(1);
        },
        error => assert(false, error),
        done);
  });

  it('Tests concatMapOnSucceedRequest operator', (done) => {
    let actionId = 0;
    request(SETTINGS).mapToAction({ type: TYPE }).concat(request(SETTINGS).mapToAction({ type: TYPE }))
      .concatMapOnSucceedRequest((result) => {
        actionId += 1;
        return Observable.of({ type: ACTION_DISPATCHED, result: result.data.body.movies, actionId })
          .delay(20 / actionId);
      })
      .toArray()
      .subscribe(
        (results) => {
          const [firstResult, secondResult] = results.filter(item => item.type === ACTION_DISPATCHED);

          expect(firstResult.type).to.equal('action_dispatched');
          expect(firstResult.result).to.deep.equal(MOVIES);

          expect(firstResult.actionId).to.equal(1);
          expect(secondResult.actionId).to.equal(2);
        },
        error => assert(false, error),
        done);
  });

  it('Tests doOnSucceedRequest operator', (done) => {
    let sideEffect = null;
    request(SETTINGS).mapToAction({ type: TYPE })
      .doOnSucceedRequest((result) => {
        sideEffect = result.data.body.movies;
      })
      .toArray()
      .subscribe(
        (results) => {
          expect(results.length).to.equal(2);
          expect(sideEffect).to.equal(MOVIES);
        },
        error => assert(false, error),
        done);
  });

  it('Tests filterOnSucceedRequest operator', (done) => {
    const otherType = 'other_type';
    request(SETTINGS).mapToAction({ type: TYPE }).concat(request(SETTINGS).mapToAction({ type: otherType }))
      .filterOnSucceedRequest()
      .toArray()
      .subscribe(
        (results) => {
          const [firstResult, secondResult] = results;
          expect(firstResult.type).to.equal(getStatus(TYPE, STATUS.SUCCESS));
          expect(secondResult.type).to.equal(getStatus(otherType, STATUS.SUCCESS));
        },
        error => assert(false, error),
        done);
  });

  after(() => {
    mock.unset();
  });
});
