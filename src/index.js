import rxRequest from './rxRequest';
import rxExtensions, * as utils from './rxExtensions';

export default Object.assign(rxRequest, utils, { addReduxOperators: rxExtensions });
