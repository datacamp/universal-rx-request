import rxRequest from './rxRequest';
import importRxExtensions, * as utils from './rxExtensions';

export default Object.assign(rxRequest, utils, { importRxExtensions });
