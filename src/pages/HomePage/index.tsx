/**
 * 主页面
 * 整合自我介绍、关注模块、占星服务等所有功能模块
 */
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { siteConfigAtom } from '../../stores/configStore';
import IntroSection from '../../components/IntroSection';
import FollowSection from '../../components/FollowSection';
import AstrologySection from '../../components/AstrologySection';
import { Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { checkBrowserCompatibility, getBrowserInfo } from '../../utils/browserCheck';

const HomePage: React.FC = () => {
  const [config, setConfig] = useAtom(siteConfigAtom);
  const location = useLocation();

  // 🚀 添加浏览器兼容性检查
  useEffect(() => {
    const browserInfo = getBrowserInfo();
    console.log('浏览器信息:', browserInfo);
    
    const compatibility = checkBrowserCompatibility();
    console.log('兼容性检查结果:', compatibility);
    
    if (!compatibility.compatible) {
      console.error('❌ 浏览器兼容性问题:', compatibility.issues);
      toast.error(`浏览器兼容性问题: ${compatibility.issues.join(', ')}`, {
        duration: 8000
      });
    }
    
    // 🚀 添加全局错误处理
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('🚨 全局错误:', event.error);
      console.error('📍 错误位置:', event.filename, event.lineno, event.colno);
      toast.error(`系统错误: ${event.message}`);
    };
    
    window.addEventListener('error', handleGlobalError);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // 动态设置页面标题
  useEffect(() => {
    document.title = config.intro.name;
  }, [config.intro.name]);

  // 检查URL中是否有导入配置的参数
  useEffect(() => {
    try {
      const hash = window.location.hash;
      console.log('当前 hash:', hash); // 添加调试日志
      
      // 检查是否是配置导入页面
      if (hash.includes('#/config-import')) {
        const urlParams = new URLSearchParams(hash.split('?')[1] || '');
        const importData = urlParams.get('data');
        
        console.log('导入数据:', importData); // 添加调试日志
        
        if (importData) {
          try {
            const configData = JSON.parse(decodeURIComponent(importData));
            console.log('解析的配置数据:', configData); // 添加调试日志
            
            // 验证配置数据格式
            if (configData.intro && configData.follow && configData.astrology) {
              setConfig(configData);
              toast.success('配置导入成功！\n注意：头像需要在配置页面重新上传');
              
              // 导入成功后跳转到首页
              window.location.hash = '#/';
            } else {
              toast.error('配置数据格式不正确');
            }
          } catch (parseError) {
            console.error('配置解析错误:', parseError);
            toast.error('配置数据解析失败，请检查链接是否完整');
          }
        } else {
          toast.error('未找到配置数据');
        }
      }
    } catch (error) {
      console.error('URL 解析错误:', error);
      toast.error('链接解析失败');
    }
  }, [setConfig]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100/60 via-orange-50/80 to-amber-100/60">
      <div className="max-w-md mx-auto px-4 py-5">
        {/* 配置按钮 */}
        <div className="fixed top-4 right-4 z-50">
          <Link
            to="/config"
            className="bg-white/90 backdrop-blur-sm shadow-lg shadow-orange-200/60 rounded-full p-2.5 hover:shadow-xl hover:bg-white transition-all duration-300 border border-orange-200/60"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </Link>
        </div>
        
        {/* 自我介绍 */}
        <IntroSection />
        
        {/* 关注模块 */}
        <FollowSection />
        
        {/* 占星服务 */}
        <AstrologySection />
        
        {/* 底部装饰 */}
        <div className="text-center mt-5 py-3">
          <p className="text-xs text-gray-400">
            ✨ 用心分享，真诚交流 ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;