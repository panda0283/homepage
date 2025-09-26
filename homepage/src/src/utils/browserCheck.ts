export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }

  return {
    name: browserName,
    version: browserVersion,
    userAgent: ua
  };
};

export const checkBrowserCompatibility = () => {
  const issues = [];
  
  // 检查 localStorage
  if (typeof(Storage) === "undefined") {
    issues.push('浏览器不支持本地存储');
  }
  
  // 检查 Promise
  if (typeof(Promise) === "undefined") {
    issues.push('浏览器不支持Promise');
  }
  
  // 检查 fetch
  if (typeof(fetch) === "undefined") {
    issues.push('浏览器不支持fetch API');
  }
  
  return {
    compatible: issues.length === 0,
    issues
  };
};
