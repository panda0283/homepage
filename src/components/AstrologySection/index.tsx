/**
 * 占星服务模块
 * 收集用户出生信息，提供星盘解读服务
 */
import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { siteConfigAtom, addAstrologyRequestAtom } from '../../stores/configStore';
import { Star, Calendar, MapPin, Mail, Coffee, AlertCircle, MessageCircle } from 'lucide-react'; // 🚀 新增图标
import toast from 'react-hot-toast';
import { cityData, getPopularCities, getDistricts } from './cityData';
import { sendEmailNotification } from '../../utils/emailService';

// 🚀 调试权限控制 - 只有特定用户能看到调试信息
const canSeeDebugInfo = () => {
  // 检查是否是您本人（可以通过特定的用户标识、IP、或者本地存储标记）
  // 这里使用简单的方式：检查本地存储中是否有debug权限标记
  return localStorage.getItem('astrology-debug-enabled') === 'true';
};

// 🚀 添加调试状态显示组件
const DebugPanel: React.FC<{ visible: boolean; logs: string[] }> = ({ visible, logs }) => {
  if (!visible || !canSeeDebugInfo()) return null; // 🚀 权限控制
  
  return (
    <div className="fixed top-4 left-4 z-50 bg-black/90 text-green-400 p-3 rounded-lg text-xs font-mono max-w-sm max-h-40 overflow-auto">
      <div className="text-green-300 font-bold mb-1">🔍 调试信息:</div>
      {logs.map((log, index) => (
        <div key={index} className="mb-1">{log}</div>
      ))}
    </div>
  );
};

const AstrologySection: React.FC = () => {
  const [config] = useAtom(siteConfigAtom);
  const [, addRequest] = useAtom(addAstrologyRequestAtom);
  
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    birthCity: '',
    birthDistrict: '',
    email: '',
    message: '' // 🚀 新增：用户留言
  });
  
  // 🚀 添加城市和区县选项状态
  const [cities] = useState(getPopularCities());
  const [districts, setDistricts] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [showMessageField, setShowMessageField] = useState(false); // 🚀 新增：控制留言框显示

  // 🚀 添加调试日志函数
  const addDebugLog = (message: string) => {
    if (!canSeeDebugInfo()) return; // 🚀 权限控制
    
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [...prev.slice(-9), log]); // 保持最近10条
    console.log(log);
  };

  // 🚀 全局错误捕获 - 添加权限控制
  useEffect(() => {
    if (!canSeeDebugInfo()) return; // 🚀 只有有权限的用户才监听错误
    
    const handleError = (event: ErrorEvent) => {
      addDebugLog(`❌ 全局错误: ${event.message}`);
      addDebugLog(`📍 位置: ${event.filename}:${event.lineno}:${event.colno}`);
      toast.error(`系统错误: ${event.message}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addDebugLog(`❌ 未处理Promise错误: ${String(event.reason)}`);
      toast.error(`Promise错误: ${String(event.reason)}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 🚀 城市变化处理函数 - 简化版
  const handleCityChange = (city: string) => {
    setFormData(prev => ({ ...prev, birthCity: city, birthDistrict: '' }));
    const availableDistricts = getDistricts(city);
    setDistricts(availableDistricts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    addDebugLog('🚀 表单提交开始');
    setShowDebug(true);
    
    try {
      addDebugLog('🔍 开始验证表单数据');
      
      if (!formData.birthDate || !formData.birthTime || !formData.birthCity || !formData.birthDistrict || !formData.email) {
        addDebugLog('❌ 表单验证失败: 数据不完整');
        toast.error('请填写完整信息');
        return;
      }
      
      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        addDebugLog('❌ 邮箱格式验证失败');
        toast.error('请输入正确的邮箱格式');
        return;
      }
      
      addDebugLog('✅ 表单验证通过');
      setIsSubmitting(true);
      
      addDebugLog('💾 开始保存数据...');
      
      // 🚀 关键修复：添加try-catch保护每个步骤
      let saveSuccess = false;
      try {
        addRequest({
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthLocation: `${formData.birthCity}，${formData.birthDistrict}`,
          email: formData.email,
          message: formData.message || undefined, // 🚀 新增：保存留言
          timestamp: Date.now()
        });
        saveSuccess = true;
        addDebugLog('✅ 数据保存成功');
      } catch (saveError) {
        addDebugLog(`❌ 数据保存失败: ${String(saveError)}`);
        throw new Error(`数据保存失败: ${String(saveError)}`);
      }
      
      // 📧 第二步：尝试发送邮件通知（可选，失败也不影响主流程）
      let emailSuccess = false;
      try {
        addDebugLog('📧 开始发送邮件通知...');
        
        // 🚀 确保邮件发送函数被正确调用
        console.log('📧 调用sendEmailNotification函数...');
        emailSuccess = await sendEmailNotification({
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthLocation: `${formData.birthCity}，${formData.birthDistrict}`,
          email: formData.email,
          message: formData.message // 🚀 新增：传递留言内容
        });
        
        addDebugLog(`📧 邮件发送结果: ${emailSuccess ? '成功' : '失败'}`);
        
        if (emailSuccess) {
          console.log('✅ 邮件发送成功');
          addDebugLog('✅ 邮件通知已发送');
        } else {
          console.log('⚠️ 邮件发送失败，但不影响主流程');
          addDebugLog('⚠️ 邮件发送失败，数据已保存');
        }
      } catch (emailError) {
        console.error('❌ 邮件发送异常:', emailError);
        addDebugLog(`❌ 邮件发送异常: ${String(emailError)}`);
        // 邮件失败不影响主流程，继续执行
      }
      
      // 🎉 成功处理 - 根据邮件结果给出不同提示
      console.log('🎉 表单提交成功！');
      addDebugLog('🎉 提交成功！');
      
      if (emailSuccess) {
        toast.success('提交成功！邮件通知已发送，我会在周末为您解读星盘');
      } else {
        toast.success('提交成功！数据已记录，我会在周末为您解读星盘');
        toast('邮件通知发送失败，但您的请求已保存', {
          icon: '⚠️',
          duration: 4000
        });
      }
      
      // 清空表单
      setFormData({
        birthDate: '',
        birthTime: '',
        birthCity: '',
        birthDistrict: '',
        email: '',
        message: '' // 🚀 新增：清空留言
      });
      
      setShowMessageField(false); // 🚀 隐藏留言框
      
      addDebugLog('🧹 表单已清空');
      
    } catch (error) {
      addDebugLog(`❌ 提交过程失败: ${String(error)}`);
      addDebugLog(`📄 错误详情: ${error instanceof Error ? error.message : String(error)}`);
      
      // 详细的错误分类
      let userMessage = '提交失败，请重试';
      if (error instanceof Error) {
        if (error.message.includes('localStorage')) {
          userMessage = '浏览器存储失败，请检查浏览器设置';
        } else if (error.message.includes('network')) {
          userMessage = '网络连接失败，请检查网络';
        } else if (error.message.includes('timeout')) {
          userMessage = '请求超时，请稍后重试';
        }
      }
      
      toast.error(userMessage);
      addDebugLog(`💬 用户提示: ${userMessage}`);
      
    } finally {
      setIsSubmitting(false);
      addDebugLog('🏁 提交过程结束');
      
      // 5秒后隐藏调试面板
      setTimeout(() => setShowDebug(false), 5000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-orange-100/50 p-5 border border-orange-100/50 relative">
      {/* 🚀 调试面板 - 添加权限控制 */}
      <DebugPanel visible={showDebug} logs={debugLogs} />
      
      {/* 🚀 调试按钮 - 只有有权限的用户才显示 */}
      {canSeeDebugInfo() && (
        <button
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          className="absolute top-2 right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
          title="切换调试信息"
        >
          🐛
        </button>
      )}
      
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full mb-3 shadow-lg shadow-orange-200/50">
          <Star className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {config.astrology.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {config.astrology.description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              <Calendar className="w-3 h-3 inline mr-1" />
              出生日期（阳历）
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              <Calendar className="w-3 h-3 inline mr-1" />
              出生时间
            </label>
            <input
              type="time"
              value={formData.birthTime}
              onChange={(e) => handleInputChange('birthTime', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              <MapPin className="w-3 h-3 inline mr-1" />
              出生城市
            </label>
            <select
              value={formData.birthCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
            >
              <option value="" disabled>请选择城市</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              <MapPin className="w-3 h-3 inline mr-1" />
              出生区县
            </label>
            <select
              value={formData.birthDistrict}
              onChange={(e) => handleInputChange('birthDistrict', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
            >
              <option value="" disabled>请选择区县</option>
              {districts.map(district => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <Mail className="w-3 h-3 inline mr-1" />
            联系邮箱
          </label>
          <input
            type="email"
            placeholder="用于接收星盘解读结果"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* 🚀 新增：留言功能 - 可选的开放填空区 */}
        {showMessageField ? (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              <MessageCircle className="w-3 h-3 inline mr-1" />
              给我留言（可选）
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="请告诉我您想重点关注的领域，比如：事业发展、感情关系、健康状况等..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {formData.message.length}/500
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowMessageField(true)}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:text-orange-600 transition-all"
          >
            <MessageCircle className="w-3 h-3 inline mr-1" />
            给我留言（可选）💬
          </button>
        )}

        {/* 🚀 增强提交按钮，显示状态 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white py-2.5 px-6 rounded-lg font-medium hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200/50 text-sm relative overflow-hidden"
        >
          {isSubmitting ? (
            <>
              <span className="inline-flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                提交中...
              </span>
            </>
          ) : (
            '✨ 提交星盘需求'
          )}
        </button>
      </form>
      
      {/* 🚀 添加系统信息面板 - 添加权限控制 */}
      {canSeeDebugInfo() && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span>系统状态</span>
            <span className={`px-2 py-1 rounded text-xs ${
              typeof(Storage) !== "undefined" ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {typeof(Storage) !== "undefined" ? '✅ 存储正常' : '❌ 存储异常'}
            </span>
          </div>
          <div className="text-xs">
            <div>浏览器: {navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : '其他'}</div>
            <div>调试模式: {showDebug ? '开启' : '关闭'} (点击右上角🐛按钮)</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstrologySection;