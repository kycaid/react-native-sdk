import React, { FC, ReactElement, useEffect, useRef } from 'react';
import { WebView } from '@kycaid/react-native-webview';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import {
  generateForm,
  getVerification,
  resetVerificationData,
  selectGenerateFormData,
  selectGetVerificationData,
  VerificationData,
} from './store';

export interface Config {
  form_id: string;
  applicant_id?: string;
  api_url?: string;
  response_url?: string;
  api_token: string;
  language?: string;
}

interface Props {
  config: Config;
  verificationCallback?: (data?: VerificationData) => void;
}

const KYCaidComponent: FC<Props> = ({
  config,
  verificationCallback,
}): ReactElement => {
  const dispatch = useDispatch();
  const generatedForm = useSelector(selectGenerateFormData);
  const verificationData = useSelector(selectGetVerificationData);
  const webviewRef = useRef();

  useEffect(() => {
    dispatch(generateForm(config));
    dispatch(resetVerificationData());
  }, []);

  useEffect(() => {
    if (verificationData?.verification_id) {
      verificationCallback && verificationCallback(verificationData);
    }
  }, [verificationData?.verification_id]);

  const onNavigationStateChange = (event: any) => {
    if (event?.url === config.response_url) {
      if (generatedForm?.verification_id) {
        dispatch(getVerification({
          api_url: config.api_url,
          api_token: config.api_token,
          verification_id: generatedForm.verification_id
        }));
      }
    }
  }

  const formUrl = generatedForm?.form_url ? `${generatedForm?.form_url}?reactNative=1${config.language ? `&lang=${config.language}` : ''}` : '';

  return (
    <WebView
      ref={() => webviewRef}
      useWebKit={true}
      originWhitelist={['*']}
      bounces={true}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      startInLoadingState={true}
      allowsFullscreenVideo={true}
      mediaCapturePermissionGrantType={'grant'}
      autoManageStatusBarEnabled={false}
      useWebView2={true}
      incognito={true}
      source={{
        uri: formUrl || ''
      }}
      onNavigationStateChange={onNavigationStateChange}
    />
  );
}

export const KYCAID: FC<Props> = (props): ReactElement => (
  <Provider store={store}>
    <KYCaidComponent {...props} />
  </Provider>
);
