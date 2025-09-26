export const sendEmailNotification = async (request: any) => {
  try {
    console.log('📧 邮件通知功能演示:', request);
    // 这里可以集成 EmailJS 或其他邮件服务
    // 当前版本仅作演示，实际使用时需要配置邮件服务
    return true;
  } catch (error) {
    console.error('邮件发送失败:', error);
    return false;
  }
};
