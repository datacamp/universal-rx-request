import { expect } from 'chai';
import lib from '../index';

describe('test', () => {
  it('check result', (done) => {
    console.log(lib);
    expect(2).to.equal(2);
    done();
  });
});
