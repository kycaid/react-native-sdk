import React, { FC, ReactElement, useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { WebView } from '@kycaid/react-native-webview';
import { ShouldStartLoadRequest } from '@kycaid/react-native-webview/lib/WebViewTypes';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import { getOrigin, resolveNavigation } from './webview/navigationPolicy';
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
  const requestedVerificationRef = useRef<string>();

  useEffect(() => {
    dispatch(generateForm(config));
    dispatch(resetVerificationData());
  }, []);

  useEffect(() => {
    if (verificationData?.verification_id) {
      verificationCallback && verificationCallback(verificationData);
    }
  }, [verificationData?.verification_id]);

  const requestVerification = () => {
    const verificationId = generatedForm?.verification_id;

    if (verificationId && requestedVerificationRef.current !== verificationId) {
      requestedVerificationRef.current = verificationId;
      dispatch(getVerification({
        api_url: config.api_url,
        api_token: config.api_token,
        verification_id: verificationId
      }));
    }
  }

  const onNavigationStateChange = (event: any) => {
    if (event?.url === config.response_url) {
      requestVerification();
    }
  }

  const formOrigin = getOrigin(generatedForm?.form_url || '');

  const onShouldStartLoadWithRequest = (request: ShouldStartLoadRequest): boolean => {
    const decision = resolveNavigation(request, {
      formOrigin,
      responseUrl: config.response_url,
    });

    if (decision === 'complete') {
      requestVerification();
    } else if (decision === 'external') {
      Linking.openURL(request.url).catch(() => undefined);
    }

    return decision === 'allow';
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
      mediaCapturePermissionGrantType={'grantIfSameHostElseDeny'}
      autoManageStatusBarEnabled={false}
      useWebView2={true}
      incognito={true}
      source={{
        uri: formUrl || ''
      }}
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      onNavigationStateChange={onNavigationStateChange}
    />
  );
}

export const KYCAID: FC<Props> = (props): ReactElement => (
  <Provider store={store}>
    <KYCaidComponent {...props} />
  </Provider>
);
