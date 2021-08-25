import { call, put, takeEvery, delay } from 'redux-saga/effects';

import apiCallsMapping from '../api/apiCallsMapping';
import { POSTFIXES, REQUEST_PENDING_DELAY } from '../constants/actionPostfixes';

const { REQUEST_POSTFIX, SUCCESS_POSTFIX, FAIL_POSTFIX } = POSTFIXES;

const createActionWithPostfix = (action, payload, postfix) => {
  return {
    type: action.type.slice(0, action.type.length - REQUEST_POSTFIX.length) + postfix,
    payload: { response: payload.response, actionPayload: payload.actionPayload },
  };
};

function* sendRequest(action) {
  try {
    const callMethod = apiCallsMapping(action);
    const response = yield call(callMethod, action.payload);

    yield put(
      createActionWithPostfix(
        action,
        { response: response.data, actionPayload: action.payload },
        SUCCESS_POSTFIX
      )
    );
  } catch (error) {
    yield put(
      createActionWithPostfix(action, { response: error.response.data.errors }, FAIL_POSTFIX)
    );
  }
}

function* requestEnded() {
  yield delay(REQUEST_PENDING_DELAY);
}

const isApiCallAction = (action) => action.type.endsWith(REQUEST_POSTFIX);

const isApiCallEndedAction = (action) =>
  action.type.endsWith(SUCCESS_POSTFIX) || action.type.endsWith(FAIL_POSTFIX);

function* apiCallsSaga() {
  yield takeEvery(isApiCallAction, sendRequest);
  yield takeEvery(isApiCallEndedAction, requestEnded);
}

export default apiCallsSaga;
