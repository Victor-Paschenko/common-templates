import * as registerAction from '../commonComponents/RegisterModal/actions/index';
import * as registerAPI from '../commonComponents/RegisterModal/api/index';

const apiCallsMapping = (action) => {
  const mapping = {
    [registerAction.SIGN_UP]: registerAPI.signUp,
    [loginActions.LOGIN]: loginAPI.signIn,

    [globalActions.GET_CATEGORIES]: globalAPI.getCategories,
  };

  if (!mapping.hasOwnProperty(action.type)) {
    throw 'Not mapped action';
  }

  return mapping[action.type];
};

export default apiCallsMapping;
