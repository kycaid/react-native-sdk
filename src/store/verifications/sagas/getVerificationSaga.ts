import axios from 'axios';
import { put, retry } from 'redux-saga/effects';

import {
  getVerificationData,
  getVerificationError,
  GetVerificationFetch,
  GetVerificationPayload,
} from '../actions';

export const apiConfig = (token?: any) => {
  if (token) {
    return {
      headers: {
        'Authorization': 'Token ' + token,
      },
    };
  }

  return {};
};

const VERIFICATION_REQUEST_ATTEMPTS = 3;
const VERIFICATION_REQUEST_DELAY_MS = 500;

export const getRequest = (payload: GetVerificationPayload) => {
  return axios.get(
    `${payload.api_url || 'https://api.kycaid.com'}/verifications/${payload.verification_id}`,
    apiConfig(payload.api_token),
  );
};

export function* getVerificationSaga(action: GetVerificationFetch) {
  try {
    const { data } = yield retry(VERIFICATION_REQUEST_ATTEMPTS, VERIFICATION_REQUEST_DELAY_MS, getRequest, action.payload);

    yield put(getVerificationData(data));
  } catch (error) {
    console.log(`Error during fetch verification data: ${error.message} ${error.stack}`);

    yield put(getVerificationError(error));
  }
}
