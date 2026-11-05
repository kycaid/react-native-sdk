import axios from 'axios';
import { call, put } from 'redux-saga/effects';
import { apiConfig, KycaidConfigError } from '../../../api/auth';
import { Config } from '../../../App';

import {
  generateFormData,
  generateFormError,
  GenerateFormFetch,
} from '../actions';

export const postRequest = (config: Config) => {
  const requestConfig = apiConfig(config);

  if (config.form_token && !config.applicant_id) {
    throw new KycaidConfigError('applicant_id is required with form_token. Pass the applicant the form_token was minted for.');
  }

  return axios.post(
    `${config.api_url || 'https://api.kycaid.com'}/forms/${config.form_id}/urls`,
    {
      form_id: config.form_id,
      applicant_id: config.applicant_id || null
    },
    requestConfig,
  );
};

export function* generateFormSaga(action: GenerateFormFetch) {
  try {
    const { data } = yield call(() => postRequest(action.payload));

    yield put(generateFormData(data));
  } catch (error) {
    if (error instanceof KycaidConfigError) {
      console.error(error.message);
    } else {
      console.log(`Error during generate form url: ${error.message}`);
    }

    yield put(generateFormError(error));
  }
}
