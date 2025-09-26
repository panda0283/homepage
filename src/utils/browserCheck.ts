/**
 * 浏览器兼容性检查工具
 * 确保所有必需的功能都可用
 */
export const checkBrowserCompatibility = () => {
  const issues: string[] = [];
  
  // 检查localStorage
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
  } catch (e) {
    issues.push('localStorage不可用');
  }
  
  // 检查Promise
  if (typeof Promise === 'undefined') {
    issues.push('Promise不支持');
  }
  
  // 检查fetch
  if (typeof fetch === 'undefined') {
    issues.push('fetch API不支持');
  }
  
  // 检查CustomEvent
  if (typeof CustomEvent === 'undefined') {
    issues.push('CustomEvent不支持');
  }
  
  return {
    compatible: issues.length === 0,
    issues
  };
};

export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = '';
  
  if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || '';
  }
  
  return {
    name: browserName,
    version: browserVersion,
    userAgent: ua
  };
};
