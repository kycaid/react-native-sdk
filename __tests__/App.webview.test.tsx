import React from 'react';
import axios from 'axios';
import { Linking } from 'react-native';
import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';

jest.mock('axios');

const webviewProps: any[] = [];
jest.mock('@kycaid/react-native-webview', () => {
  const R = require('react');
  return {
    WebView: R.forwardRef((props: any, _ref: any) => {
      webviewProps.push(props);
      return R.createElement('WebView', null);
    }),
  };
});

(global as any).window = (global as any).window || global;

const { KYCAID } = require('../src/App');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const API_TOKEN = 'ff12cd340727094ea51b5715b2fcc1c47571';
const FORM_ID = 'aa12cd340727094ea51b5715b2fcc1c47571';
const VERIFICATION_ID = 'cc12cd340727094ea51b5715b2fcc1c47571';
const FORM_URL = `https://forms.kycaid.com/${FORM_ID}`;
const RESPONSE_URL = 'https://customer.example.com/kyc/done';

let renderer: ReactTestRenderer | undefined;

const lastProps = () => webviewProps[webviewProps.length - 1];
const verificationRequests = () =>
  mockedAxios.get.mock.calls.filter(([url]) => String(url).includes(`/verifications/${VERIFICATION_ID}`));

const renderSdk = async (verificationCallback = jest.fn()) => {
  await act(async () => {
    renderer = TestRenderer.create(
      <KYCAID
        config={{ api_token: API_TOKEN, form_id: FORM_ID, response_url: RESPONSE_URL }}
        verificationCallback={verificationCallback}
      />,
    );
  });

  return verificationCallback;
};

const navigate = (url: string, isTopFrame?: boolean): boolean => lastProps().onShouldStartLoadWithRequest({
  url,
  isTopFrame,
  loading: true,
  title: '',
  canGoBack: false,
  canGoForward: false,
  lockIdentifier: 1,
  navigationType: 'other',
  mainDocumentURL: url,
});

describe('KYCAID WebView navigation and media policy', () => {
  let openURL: jest.SpyInstance;

  beforeEach(() => {
    webviewProps.length = 0;
    mockedAxios.post.mockReset();
    mockedAxios.get.mockReset();
    mockedAxios.post.mockResolvedValue({
      data: { form_id: FORM_ID, form_url: FORM_URL, verification_id: VERIFICATION_ID },
    });
    mockedAxios.get.mockResolvedValue({
      data: { verification_id: VERIFICATION_ID, status: 'completed', verified: true, verifications: {} },
    });
    openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = undefined;
    openURL.mockRestore();
  });

  it('grants media only to the host the WebView shows, never WebView-wide', async () => {
    await renderSdk();

    expect(lastProps().mediaCapturePermissionGrantType).toBe('grantIfSameHostElseDeny');
    expect(typeof lastProps().onShouldStartLoadWithRequest).toBe('function');
    expect(lastProps().source.uri).toBe(`${FORM_URL}?reactNative=1`);
  });

  it('loads the form origin in the WebView without opening anything outside', async () => {
    await renderSdk();

    expect(navigate(`${FORM_URL}?reactNative=1`, true)).toBe(true);
    expect(navigate(`${FORM_URL}/documents`)).toBe(true);
    expect(openURL).not.toHaveBeenCalled();
  });

  it('keeps an off-origin navigation out of the WebView and hands it to the system', async () => {
    await renderSdk();

    expect(navigate('https://evil.example/capture', true)).toBe(false);
    expect(navigate('https://forms.kycaid.com@evil.example/')).toBe(false);
    expect(openURL).toHaveBeenNthCalledWith(1, 'https://evil.example/capture');
    expect(openURL).toHaveBeenNthCalledWith(2, 'https://forms.kycaid.com@evil.example/');
  });

  it('blocks script and data navigations without opening them', async () => {
    await renderSdk();

    expect(navigate('javascript:alert(1)', true)).toBe(false);
    expect(navigate('data:text/html,<script>alert(1)</script>', true)).toBe(false);
    expect(openURL).not.toHaveBeenCalled();
  });

  it('fetches the verification once on response_url and does not load the customer page', async () => {
    const verificationCallback = await renderSdk();

    let shouldLoad = true;
    await act(async () => {
      shouldLoad = navigate(RESPONSE_URL, true);
    });
    await act(async () => {
      lastProps().onNavigationStateChange({ url: RESPONSE_URL });
    });

    expect(shouldLoad).toBe(false);
    expect(openURL).not.toHaveBeenCalled();
    expect(verificationRequests()).toHaveLength(1);
    expect(verificationCallback).toHaveBeenCalledWith(
      expect.objectContaining({ verification_id: VERIFICATION_ID }),
    );
  });

  it('still fetches the verification when response_url is only seen through onNavigationStateChange', async () => {
    const verificationCallback = await renderSdk();

    await act(async () => {
      lastProps().onNavigationStateChange({ url: RESPONSE_URL });
    });

    expect(verificationRequests()).toHaveLength(1);
    expect(verificationCallback).toHaveBeenCalled();
  });
});
