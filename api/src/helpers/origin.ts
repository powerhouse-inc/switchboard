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
