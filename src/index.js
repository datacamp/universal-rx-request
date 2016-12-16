import { Observable } from 'rxjs/Observable';
import rxRequest, * as utils from './rxRequest';
import * as rxExtensions from './rxExtensions';

const addReduxOperators = () => Object.assign(Observable, rxExtensions);
export default Object.assign(rxRequest, utils, { addReduxOperators });
