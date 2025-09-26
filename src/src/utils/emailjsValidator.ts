export const validateEmailJSConfig = async () => {
  try {
    // 这里可以添加 EmailJS 配置验证逻辑
    console.log('📧 EmailJS 配置验证');
    return true;
  } catch (error) {
    console.error('EmailJS 配置验证失败:', error);
    return false;
  }
};
