/**
 * 邮件通知服务
 * 使用第三方邮件服务发送占星请求通知
 */
interface EmailData {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  email: string;
  message?: string; // 🚀 新增：用户留言
}

export const sendEmailNotification = async (data: EmailData) => {
  const startTime = Date.now();
  
  try {
    console.log('🚀 开始发送邮件通知...');
    console.log('📧 收件人:', 'makeawish0283@gmail.com');
    console.log('📊 请求数据:', data);
    console.log('⏰ 开始时间:', new Date(startTime).toLocaleString());

    // 参数验证
    if (!data.email || !data.birthDate || !data.birthTime || !data.birthLocation) {
      throw new Error('邮件参数不完整');
    }

    // 🚀 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('提交者邮箱格式不正确');
    }

    if (!emailRegex.test('makeawish0283@gmail.com')) {
      throw new Error('收件人邮箱格式不正确');
    }

    // 🚀 关键修复：使用正确的EmailJS API格式
    const emailPayload = {
      service_id: 'service_beewmyg',      // ✅ EmailJS使用下划线
      template_id: 'template_hmk8mw7',    // ✅ template_id
      user_id: 'BfKOthdIU9Hu-ojTi',       // ✅ user_id (不是publicKey)
      template_params: {
        to_email: 'makeawish0283@gmail.com',
        from_email: data.email,
        birth_date: data.birthDate,
        birth_time: data.birthTime,
        birth_location: data.birthLocation,
        message: data.message || '无特殊留言', // 🚀 改成 message，和模板一致
        submit_time: new Date().toLocaleString()
      }
    };

    console.log('📋 EmailJS请求载荷:', emailPayload);

    // 🚀 添加请求超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error('❌ 邮件发送超时（10秒）');
    }, 10000);

    console.log('📤 正在发送请求到EmailJS...');
    console.log('🌐 请求URL: https://api.emailjs.com/api/v1.0/email/send');
    
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(emailPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log('📊 响应状态:', response.status);
    console.log('📊 响应头:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 邮件发送失败响应:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // 🚀 详细的错误分析
      let errorMessage = `邮件发送失败 (${response.status})`;
      if (response.status === 400) {
        errorMessage = '请求格式错误 - 请检查template参数';
      } else if (response.status === 401) {
        errorMessage = '认证失败 - 请检查user_id';
      } else if (response.status === 403) {
        errorMessage = '权限拒绝 - 请检查服务配置和模板权限';
      } else if (response.status === 404) {
        errorMessage = '服务未找到 - 请检查service_id';
      } else if (response.status === 422) {
        errorMessage = '参数验证失败 - 请检查template_params';
      }
      
      throw new Error(errorMessage);
    }

    const responseText = await response.text();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ 邮件发送成功！');
    console.log('📊 响应内容:', responseText);
    console.log('⏱️ 耗时:', duration + 'ms');
    
    return true;
    
  } catch (error) {
    console.error('❌ 邮件发送失败:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('❌ 请求超时');
      } else if (error.message.includes('Failed to fetch')) {
        console.error('❌ 网络连接失败');
      }
    }
    
    // 🚀 详细的错误日志
    console.log('=== 🚨 邮件发送失败详情 ===');
    console.log('📧 提交者邮箱:', data.email);
    console.log('📅 出生日期:', data.birthDate);
    console.log('🕐 出生时间:', data.birthTime);
    console.log('📍 出生地点:', data.birthLocation);
    console.log('💬 用户留言:', data.message || '无');
    console.log('⏰ 提交时间:', new Date().toLocaleString());
    console.log('💡 错误信息:', error instanceof Error ? error.message : String(error));
    console.log('==========================');
    
    return false;
  }
};