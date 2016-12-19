import { expect, assert } from 'chai';
import superagentMock from 'superagent-mock';
import superagent from 'superagent';
import request from '../src/index';

const URL = 'http://test.com/';
const MOVIES = ['Matrix', 'Star Wars', 'The Social Network'];

let mock = null;

describe('Request functionnality', () => {
  before(() => {
    mock = superagentMock(superagent, [
      {
        pattern: `${URL}(.*)`,
        fixtures: (match, params, headers) => {
          switch (match[1]) {
            case 'get_movies':
              return { movies: MOVIES };
            case 'post_movie':
              return { post_succeed: true, posted_movie: params.movie };
            case 'post_movie_with_headers':
              return { post_succeed: true, posted_movie: params.movie, posted_headers: headers };
            default: throw new Error(404);
          }
        },
        get: (match, data) => ({ ok: true, code: 200, body: data }),
        post: (match, data) => ({ ok: true, code: 200, body: data }),
      },
    ]);
  });

  it('Does GET request', (done) => {
    const settings = { method: 'get', url: `${URL}get_movies`, data: {}, query: {}, options: { headers: {}, json: true, only2xx: true } };
    request(settings).subscribe(
      result => expect(result.body.movies).to.equal(MOVIES),
      error => assert(false, error),
      done);
  });

  it('Does POST request', (done) => {
    const settings = { method: 'post', url: `${URL}post_movie`, data: { movie: MOVIES[0] }, query: {}, options: { headers: {}, json: true, only2xx: true } };
    request(settings).subscribe(
      result => expect(result.body.posted_movie).to.equal(MOVIES[0]),
      error => assert(false, error),
      done);
  });

  it('Does POST request using auth options', (done) => {
    const settings = {
      method: 'post',
      url: `${URL}post_movie_with_headers`,
      data: { movie: MOVIES[0] },
      options: {
        auth: ['tobi', 'learnboost'],
      },
    };
    request(settings).subscribe(
      result => expect(result.body.posted_headers.Authorization).to.equal('Basic dG9iaTpsZWFybmJvb3N0'),
      error => assert(false, error),
      done);
  });

  it('Does POST request with custom headers', (done) => {
    const settings = {
      method: 'post',
      url: `${URL}post_movie_with_headers`,
      data: { movie: MOVIES[0] },
      options: {
        headers: { dataAccess: 'Denied' },
      },
    };
    request(settings).subscribe(
      result => expect(result.body.posted_headers.dataAccess).to.equal('Denied'),
      error => assert(false, error),
      done);
  });

  it('Does a call to a non existing endpoint', (done) => {
    const settings = { method: 'get', url: `${URL}wrong_api` };
    request(settings).subscribe(
      result => assert(false, result),
      (error) => {
        expect(error.error.message).to.equal('404');
        expect(error.response.notFound).to.equal(true);
        done();
      });
  });

  after(() => {
    mock.unset();
  });
});
