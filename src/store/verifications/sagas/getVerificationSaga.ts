import axios from 'axios';
import { call, put } from 'redux-saga/effects';

import { apiConfig } from '../../../api/auth';
import {
  getVerificationData,
  getVerificationError,
  GetVerificationFetch,
  GetVerificationPayload,
} from '../actions';

export const getRequest = (payload: GetVerificationPayload) => {
  const requestConfig = apiConfig(payload);

  return axios.get(
    `${payload.api_url || 'https://api.kycaid.com'}/verifications/${payload.verification_id}`,
    requestConfig,
  );
};

export function* getVerificationSaga(action: GetVerificationFetch) {
  try {
    const { data } = yield call(() => getRequest(action.payload));

    yield put(getVerificationData(data));
  } catch (error) {
    console.log(`Error during fetch verification data: ${error.message} ${error.stack}`);

    yield put(getVerificationError(error));
  }
}
