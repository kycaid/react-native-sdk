export type NavigationDecision = 'allow' | 'complete' | 'external' | 'block';

export interface NavigationRequest {
  url: string;
  isTopFrame?: boolean;
}

export interface NavigationPolicyOptions {
  formOrigin: string;
  responseUrl?: string;
}

const URL_PATTERN = /^([a-z][a-z0-9+.-]*):(?:\/\/([^/?#\\]*))?/i;
const DEFAULT_PORTS: Record<string, string> = { http: '80', https: '443' };
const WEB_SCHEMES = ['http', 'https'];
const BLOCKED_SCHEMES = ['about', 'blob', 'data', 'file', 'javascript'];
const ALLOWED_TOP_FRAME_URLS = ['about:blank'];

export const getScheme = (url: string): string => {
  const match = URL_PATTERN.exec(url || '');

  return match ? match[1].toLowerCase() : '';
};

export const getOrigin = (url: string): string => {
  const match = URL_PATTERN.exec(url || '');
  const scheme = match ? match[1].toLowerCase() : '';

  if (!match || !WEB_SCHEMES.includes(scheme) || !match[2]) {
    return '';
  }

  const authority = match[2].slice(match[2].lastIndexOf('@') + 1).toLowerCase();
  const [, host, port] = /^(\[[^\]]*\]|[^:]*)(?::(\d*))?$/.exec(authority) || [];

  if (!host) {
    return '';
  }

  return port && port !== DEFAULT_PORTS[scheme]
    ? `${scheme}://${host}:${port}`
    : `${scheme}://${host}`;
};

export const resolveNavigation = (
  { url, isTopFrame }: NavigationRequest,
  { formOrigin, responseUrl }: NavigationPolicyOptions,
): NavigationDecision => {
  if (isTopFrame === false) {
    return 'allow';
  }

  if (responseUrl && url === responseUrl) {
    return 'complete';
  }

  if (ALLOWED_TOP_FRAME_URLS.includes(url)) {
    return 'allow';
  }

  const origin = getOrigin(url);

  if (origin && formOrigin && origin === formOrigin) {
    return 'allow';
  }

  if (origin) {
    return 'external';
  }

  const scheme = getScheme(url);

  return !scheme || BLOCKED_SCHEMES.includes(scheme) || WEB_SCHEMES.includes(scheme)
    ? 'block'
    : 'external';
};
