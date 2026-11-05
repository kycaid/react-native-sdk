const FORM_TOKEN_PATTERN = /^[a-f0-9-]{36}$/;
const REQUIRED_CONFIG_FIELDS = ['form_id', 'applicant_id'] as const;

export class KycaidConfigError extends Error {
  constructor(message: string) {
    super(`KYCAID: ${message}`);
    this.name = 'KycaidConfigError';
  }
}

export interface FormTokenRequestConfig {
  headers: {
    'form-token': string;
  };
}

export const formTokenRequestConfig = (formToken?: unknown): FormTokenRequestConfig => {
  if (typeof formToken !== 'string' || !FORM_TOKEN_PATTERN.test(formToken)) {
    throw new KycaidConfigError('a valid form_token is required. Mint it on your backend with POST /forms/{form_id}/urls and pass it to the SDK.');
  }

  return {
    headers: {
      'form-token': formToken,
    },
  };
};

export const assertFormConfig = (config: object): void => {
  if (Object.prototype.hasOwnProperty.call(config, 'api_token')) {
    throw new KycaidConfigError('api_token is not supported. Never ship an api_token in a mobile app: pass a form_token minted by your backend instead, and rotate any api_token that was embedded in an app.');
  }

  REQUIRED_CONFIG_FIELDS.forEach((field) => {
    const value = (config as Record<string, unknown>)[field];

    if (typeof value !== 'string' || !value.trim()) {
      throw new KycaidConfigError(`${field} is required.`);
    }
  });
};
