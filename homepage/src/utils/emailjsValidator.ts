/**
 * EmailJS 配置验证工具
 * 帮助诊断邮件发送问题
 */
export const validateEmailJSConfig = () => {
  const requiredConfig = {
    serviceId: 'service_beewmyg',
    templateId: 'template_hmk8mw7',
    publicKey: 'BfKOthdIU9Hu-ojTi',
    toEmail: 'makeawish0283@gmail.com'
  };

  console.log('🔍 EmailJS 配置验证开始...');
  console.log('📋 当前配置:', requiredConfig);

  // 检查配置完整性
  const missing = Object.entries(requiredConfig)
    .filter(([key, value]) => !value || value === 'your_public_key')
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error('❌ 配置不完整，缺少:', missing);
    return false;
  }

  console.log('✅ 配置完整性检查通过');

  // 测试网络连接
  return testEmailJSConnection();
};

const testEmailJSConnection = async () => {
  try {
    console.log('🌐 测试EmailJS连接...');
    
    const testResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'service_beewmyg',
        template_id: 'template_hmk8mw7',
        user_id: 'BfKOthdIU9Hu-ojTi',
        template_params: {
          to_email: 'makeawish0283@gmail.com',
          from_email: 'test@example.com',
          birth_date: '2000-01-01',
          birth_time: '12:00',
          birth_location: '测试地点',
          submit_time: new Date().toLocaleString()
        }
      })
    });

    console.log('🌐 连接测试响应状态:', testResponse.status);
    
    if (testResponse.ok) {
      console.log('✅ EmailJS连接正常');
      return true;
    } else {
      const errorText = await testResponse.text();
      console.error('❌ EmailJS连接失败:', testResponse.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ 网络连接测试失败:', error);
    return false;
  }
};
