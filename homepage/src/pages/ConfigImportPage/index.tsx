/**
 * 配置导入页面
 * 专门处理通过分享链接导入配置的页面
 */
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { siteConfigAtom } from '../../stores/configStore';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ConfigImportPage: React.FC = () => {
  const [, setConfig] = useAtom(siteConfigAtom);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const importConfig = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const importData = urlParams.get('data');
        
        console.log('导入页面 - 当前location:', location);
        console.log('导入页面 - search参数:', location.search);
        console.log('导入页面 - 导入数据:', importData);
        
        if (!importData) {
          toast.error('未找到配置数据');
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        const configData = JSON.parse(decodeURIComponent(importData));
        console.log('导入页面 - 解析的配置:', configData);
        
        // 验证配置数据格式
        if (configData.intro && configData.follow && configData.astrology) {
          setConfig(configData);
          toast.success('配置导入成功！');
          setTimeout(() => navigate('/'), 1500);
        } else {
          toast.error('配置数据格式不正确');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error('配置导入失败:', error);
        toast.error('配置导入失败，数据格式错误');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    importConfig();
  }, [location, setConfig, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">正在导入配置...</h2>
        <p className="text-gray-600">请稍候，正在处理您的配置信息</p>
      </div>
    </div>
  );
};

export default ConfigImportPage;
