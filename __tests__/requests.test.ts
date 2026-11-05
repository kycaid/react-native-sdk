import axios from 'axios';

import { postRequest } from '../src/store/forms/sagas/generateFormSaga';
import { getRequest } from '../src/store/verifications/sagas/getVerificationSaga';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const FORM_TOKEN = '7b8a1a740727094ea51b5715b2fcc1c47571';
const FORM_ID = 'a1b2c3d40727094ea51b5715b2fcc1c47571';
const APPLICANT_ID = 'c4d5e6f70727094ea51b5715b2fcc1c47571';
const VERIFICATION_ID = 'e7f8a9b00727094ea51b5715b2fcc1c47571';

const config = {
  form_id: FORM_ID,
  applicant_id: APPLICANT_ID,
  form_token: FORM_TOKEN,
};

const headersOf = (call: any[]) => (call[call.length - 1] || {}).headers || {};

describe('form-token authentication', () => {
  beforeEach(() => {
    mockedAxios.post.mockReset().mockResolvedValue({ data: {} });
    mockedAxios.get.mockReset().mockResolvedValue({ data: {} });
  });

  describe('POST /forms/{form_id}/urls', () => {
    it('sends the form-token header and never an Authorization header', async () => {
      await postRequest(config);

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      const [url, body] = mockedAxios.post.mock.calls[0];
      const headers = headersOf(mockedAxios.post.mock.calls[0]);

      expect(url).toBe(`https://api.kycaid.com/forms/${FORM_ID}/urls`);
      expect(body).toEqual({ form_id: FORM_ID, applicant_id: APPLICANT_ID });
      expect(headers).toEqual({ 'form-token': FORM_TOKEN });
      expect(headers).not.toHaveProperty('Authorization');
    });

    it('uses api_url when it is set', async () => {
      await postRequest({ ...config, api_url: 'https://api.example.test' });

      expect(mockedAxios.post.mock.calls[0][0]).toBe(`https://api.example.test/forms/${FORM_ID}/urls`);
    });

    it.each([
      ['missing', undefined],
      ['empty', ''],
      ['not token-shaped', 'not-a-token'],
    ])('throws and sends nothing when form_token is %s', (_, formToken) => {
      expect(() => postRequest({ ...config, form_token: formToken as any })).toThrow(/form_token/);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it.each([
      ['form_id'],
      ['applicant_id'],
    ])('throws and sends nothing when %s is missing', (field) => {
      expect(() => postRequest({ ...config, [field]: '' })).toThrow(new RegExp(field));
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('rejects a config that still carries api_token and sends nothing', () => {
      expect(() => postRequest({ ...config, api_token: 'b'.repeat(36) } as any)).toThrow(/api_token/);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('GET /verifications/{id}', () => {
    it('sends the form-token header and never an Authorization header', async () => {
      await getRequest({ verification_id: VERIFICATION_ID, form_token: FORM_TOKEN });

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      const [url] = mockedAxios.get.mock.calls[0];
      const headers = headersOf(mockedAxios.get.mock.calls[0]);

      expect(url).toBe(`https://api.kycaid.com/verifications/${VERIFICATION_ID}`);
      expect(headers).toEqual({ 'form-token': FORM_TOKEN });
      expect(headers).not.toHaveProperty('Authorization');
    });

    it('throws and sends nothing when form_token is missing', () => {
      expect(() => getRequest({ verification_id: VERIFICATION_ID, form_token: '' })).toThrow(/form_token/);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });
});
