import { getOrigin, resolveNavigation } from '../src/webview/navigationPolicy';

const FORM_ORIGIN = 'https://forms.kycaid.com';
const RESPONSE_URL = 'https://customer.example.com/kyc/done';
const options = { formOrigin: FORM_ORIGIN, responseUrl: RESPONSE_URL };

const topFrame = (url: string) => resolveNavigation({ url, isTopFrame: true }, options);

describe('getOrigin', () => {
  it.each([
    ['https://forms.kycaid.com/aa12cd34?reactNative=1', 'https://forms.kycaid.com'],
    ['HTTPS://Forms.KYCAID.com/path', 'https://forms.kycaid.com'],
    ['https://forms.kycaid.com:443/path', 'https://forms.kycaid.com'],
    ['http://localhost:3000/path', 'http://localhost:3000'],
    ['https://forms.kycaid.com@evil.example/path', 'https://evil.example'],
    ['https://user:pass@forms.kycaid.com/path', 'https://forms.kycaid.com'],
    ['https://forms.kycaid.com.evil.example/', 'https://forms.kycaid.com.evil.example'],
    ['https://[::1]:8443/', 'https://[::1]:8443'],
  ])('%s -> %s', (url, origin) => {
    expect(getOrigin(url)).toBe(origin);
  });

  it.each(['', 'about:blank', 'data:text/html,hi', 'javascript:alert(1)', 'diia://auth', 'not a url'])(
    'has no web origin for %p',
    (url) => {
      expect(getOrigin(url)).toBe('');
    },
  );
});

describe('resolveNavigation', () => {
  it('keeps top-frame navigations on the form origin in the WebView', () => {
    expect(topFrame('https://forms.kycaid.com/aa12cd34?reactNative=1&lang=en')).toBe('allow');
    expect(topFrame('https://forms.kycaid.com/aa12cd34/next-step')).toBe('allow');
    expect(topFrame('about:blank')).toBe('allow');
  });

  it('completes the flow on response_url instead of loading it', () => {
    expect(topFrame(RESPONSE_URL)).toBe('complete');
  });

  it('sends other off-origin top-frame navigations out of the WebView', () => {
    expect(topFrame('https://evil.example/capture')).toBe('external');
    expect(topFrame('https://forms.kycaid.com.evil.example/')).toBe('external');
    expect(topFrame('https://forms.kycaid.com@evil.example/')).toBe('external');
    expect(topFrame('http://forms.kycaid.com/aa12cd34')).toBe('external');
    expect(topFrame(`${RESPONSE_URL}?extra=1`)).toBe('external');
    expect(topFrame('diia://auth?request=1')).toBe('external');
    expect(topFrame('tel:+380000000000')).toBe('external');
  });

  it('blocks top-frame navigations to script and local schemes', () => {
    expect(topFrame('javascript:alert(1)')).toBe('block');
    expect(topFrame('data:text/html,<script>alert(1)</script>')).toBe('block');
    expect(topFrame('blob:https://forms.kycaid.com/1f2e')).toBe('block');
    expect(topFrame('file:///etc/hosts')).toBe('block');
    expect(topFrame('about:srcdoc')).toBe('block');
    expect(topFrame('')).toBe('block');
  });

  it('treats a request without isTopFrame (Android) as a top-frame navigation', () => {
    expect(resolveNavigation({ url: 'https://evil.example/' }, options)).toBe('external');
    expect(resolveNavigation({ url: 'https://forms.kycaid.com/aa12cd34' }, options)).toBe('allow');
  });

  it('leaves sub-frames to the form CSP', () => {
    expect(
      resolveNavigation({ url: 'https://www.googletagmanager.com/ns.html', isTopFrame: false }, options),
    ).toBe('allow');
  });

  it('externalises everything web while the form origin is unknown', () => {
    const noForm = { formOrigin: '' };

    expect(resolveNavigation({ url: 'https://forms.kycaid.com/aa12cd34', isTopFrame: true }, noForm)).toBe(
      'external',
    );
    expect(resolveNavigation({ url: 'about:blank', isTopFrame: true }, noForm)).toBe('allow');
  });

  it('does not complete on an empty response_url', () => {
    expect(resolveNavigation({ url: '', isTopFrame: true }, { formOrigin: FORM_ORIGIN, responseUrl: '' })).toBe(
      'block',
    );
  });
});
