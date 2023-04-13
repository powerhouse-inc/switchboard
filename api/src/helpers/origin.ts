import { GraphQLError } from 'graphql';
import wildcard from 'wildcard-match';

export function isOriginValid(originParam: string): boolean {
  if (originParam === '*') {
    return true;
  }
  if (originParam.includes(' ')) {
    return false;
  }
  const origins = originParam.split(',');
  return origins.some((origin) => {
    if (!origin.startsWith('http://') && !origin.startsWith('https://')) {
      return false;
    }
    return true;
  });
}
export function throwGQLErrorIfOriginInvalid(originRestriction: string, originReceived?: string) {
  if (originRestriction !== '*') {
    if (!originReceived) {
      throw new GraphQLError('Origin not provided', {
        extensions: { code: 'ORIGIN_HEADER_MISSING' },
      });
    }
    const allowedOrigins = originRestriction.split(',');
    if (!allowedOrigins.some((o) => wildcard(o)(originReceived))) {
      throw new GraphQLError('Access denied due to origin restriction', {
        extensions: { code: 'ORIGIN_FORBIDDEN' },
      });
    }
  }
}
