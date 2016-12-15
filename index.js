import { Observable } from 'rxjs/Observable';
import rxRequest, * as utils from './lib';
import * as rxExtensions from './lib/rxExtensions';

const addReduxOperators = () => Object.assign(Observable, rxExtensions);
export default Object.assign(rxRequest, utils, { addReduxOperators });
