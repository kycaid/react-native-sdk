import { CommonError } from '../types';
import {
  GET_VERIFICATION_DATA,
  GET_VERIFICATION_ERROR,
  GET_VERIFICATION_FETCH,
  GET_VERIFICATION_RESET,
} from './constants';
import { VerificationData } from './types';

export interface GetVerificationPayload {
  verification_id: string;
  form_token?: string;
  api_token?: string;
  api_url?: string;
}

export interface GetVerificationFetch {
  type: typeof GET_VERIFICATION_FETCH;
  payload: GetVerificationPayload;
}

export interface GetVerificationData {
  type: typeof GET_VERIFICATION_DATA;
  payload: VerificationData;
}

export interface GetVerificationError {
  type: typeof GET_VERIFICATION_ERROR;
  payload: CommonError;
}

export interface GetVerificationReset {
  type: typeof GET_VERIFICATION_RESET;
}

export type VerificationsAction =
    GetVerificationFetch
  | GetVerificationData
  | GetVerificationError
  | GetVerificationReset;

export const getVerification = (payload: GetVerificationFetch['payload']): GetVerificationFetch => ({
  type: GET_VERIFICATION_FETCH,
  payload,
});

export const getVerificationData = (payload: GetVerificationData['payload']): GetVerificationData => ({
  type: GET_VERIFICATION_DATA,
  payload,
});

export const getVerificationError = (payload: GetVerificationError['payload']): GetVerificationError => ({
  type: GET_VERIFICATION_ERROR,
  payload,
});

export const resetVerificationData = (): GetVerificationReset => ({
  type: GET_VERIFICATION_RESET,
});
