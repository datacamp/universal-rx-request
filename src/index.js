import { Observable } from 'rxjs/Observable';
import rxRequest from './rxRequest';
import rxExtensions, * as utils from './rxExtensions';

const addReduxOperators = () => Object.assign(Observable, rxExtensions);
export default Object.assign(rxRequest, utils, { addReduxOperators });
