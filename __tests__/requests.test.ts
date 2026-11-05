import axios from 'axios';

import { postRequest } from '../src/store/forms/sagas/generateFormSaga';
import { getRequest } from '../src/store/verifications/sagas/getVerificationSaga';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const FORM_TOKEN = '7b8a1a740727094ea51b5715b2fcc1c47571';
const API_TOKEN = 'f1e2d3c40727094ea51b5715b2fcc1c47571';
const FORM_ID = 'a1b2c3d40727094ea51b5715b2fcc1c47571';
const APPLICANT_ID = 'c4d5e6f70727094ea51b5715b2fcc1c47571';
const VERIFICATION_ID = 'e7f8a9b00727094ea51b5715b2fcc1c47571';

const headersOf = (call: any[]) => (call[call.length - 1] || {}).headers || {};

describe('SDK request authentication', () => {
  beforeEach(() => {
    mockedAxios.post.mockReset().mockResolvedValue({ data: {} });
    mockedAxios.get.mockReset().mockResolvedValue({ data: {} });
  });

  describe('POST /forms/{form_id}/urls', () => {
    it('sends only the form-token header when form_token is set', async () => {
      await postRequest({ form_id: FORM_ID, applicant_id: APPLICANT_ID, form_token: FORM_TOKEN });

      const [url, body] = mockedAxios.post.mock.calls[0];

      expect(url).toBe(`https://api.kycaid.com/forms/${FORM_ID}/urls`);
      expect(body).toEqual({ form_id: FORM_ID, applicant_id: APPLICANT_ID });
      expect(headersOf(mockedAxios.post.mock.calls[0])).toEqual({ 'form-token': FORM_TOKEN });
    });

    it('prefers form_token over api_token when both are set', async () => {
      await postRequest({ form_id: FORM_ID, applicant_id: APPLICANT_ID, form_token: FORM_TOKEN, api_token: API_TOKEN });

      expect(headersOf(mockedAxios.post.mock.calls[0])).toEqual({ 'form-token': FORM_TOKEN });
    });

    it('keeps the api_token flow when form_token is not set', async () => {
      await postRequest({ form_id: FORM_ID, api_token: API_TOKEN });

      const [, body] = mockedAxios.post.mock.calls[0];

      expect(body).toEqual({ form_id: FORM_ID, applicant_id: null });
      expect(headersOf(mockedAxios.post.mock.calls[0])).toEqual({ 'Authorization': `Token ${API_TOKEN}` });
    });

    it('throws and sends nothing without any credential', () => {
      expect(() => postRequest({ form_id: FORM_ID, applicant_id: APPLICANT_ID })).toThrow(/form_token is required/);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('throws and sends nothing when form_token is set without applicant_id', () => {
      expect(() => postRequest({ form_id: FORM_ID, form_token: FORM_TOKEN })).toThrow(/applicant_id is required/);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('GET /verifications/{id}', () => {
    it('sends only the form-token header when form_token is set', async () => {
      await getRequest({ verification_id: VERIFICATION_ID, form_token: FORM_TOKEN, api_token: API_TOKEN });

      expect(mockedAxios.get.mock.calls[0][0]).toBe(`https://api.kycaid.com/verifications/${VERIFICATION_ID}`);
      expect(headersOf(mockedAxios.get.mock.calls[0])).toEqual({ 'form-token': FORM_TOKEN });
    });

    it('keeps the api_token flow when form_token is not set', async () => {
      await getRequest({ verification_id: VERIFICATION_ID, api_token: API_TOKEN });

      expect(headersOf(mockedAxios.get.mock.calls[0])).toEqual({ 'Authorization': `Token ${API_TOKEN}` });
    });

    it('throws and sends nothing without any credential', () => {
      expect(() => getRequest({ verification_id: VERIFICATION_ID })).toThrow(/form_token is required/);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });
});
