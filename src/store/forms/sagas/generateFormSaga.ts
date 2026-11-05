import axios from 'axios';
import { call, put } from 'redux-saga/effects';
import { assertFormConfig, formTokenRequestConfig } from '../../../api/formToken';
import { Config } from '../../../App';

import {
  generateFormData,
  generateFormError,
  GenerateFormFetch,
} from '../actions';

export const postRequest = (config: Config) => {
  assertFormConfig(config);
  const requestConfig = formTokenRequestConfig(config.form_token);

  return axios.post(
    `${config.api_url || 'https://api.kycaid.com'}/forms/${config.form_id}/urls`,
    {
      form_id: config.form_id,
      applicant_id: config.applicant_id,
    },
    requestConfig,
  );
};

export function* generateFormSaga(action: GenerateFormFetch) {
  try {
    const { data } = yield call(() => postRequest(action.payload));

    yield put(generateFormData(data));
  } catch (error) {
    console.log(`Error during generate form url: ${error.message}`);

    yield put(generateFormError(error));
  }
}
