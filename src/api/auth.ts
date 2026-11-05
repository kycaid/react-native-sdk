export class KycaidConfigError extends Error {
  constructor(message: string) {
    super(`KYCAID: ${message}`);
    this.name = 'KycaidConfigError';
  }
}

export interface Credentials {
  form_token?: string;
  api_token?: string;
}

export const apiConfig = ({ form_token, api_token }: Credentials) => {
  if (form_token) {
    return {
      headers: {
        'form-token': form_token,
      },
    };
  }

  if (api_token) {
    return {
      headers: {
        'Authorization': 'Token ' + api_token,
      },
    };
  }

  throw new KycaidConfigError('form_token is required. Mint it on your backend with POST /forms/{form_id}/urls and pass it to the SDK.');
};
