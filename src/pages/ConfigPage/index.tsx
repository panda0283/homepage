/**
 * 配置页面
 * 允许用户自定义网站的所有内容，包括个人信息、联系方式等
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { siteConfigAtom, astrologyRequestsAtom, fetchAstrologyRequestsAtom } from '../../stores/configStore';
import { ArrowLeft, Save, Download, User, Link as LinkIcon, Star, Mail, Upload, X, QrCode, FileText, Smartphone, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateEmailJSConfig } from '../../utils/emailjsValidator';

const ConfigPage: React.FC = () => {
  const [config, setConfig] = useAtom(siteConfigAtom);
  const [requests, setRequests] = useAtom(astrologyRequestsAtom);
  const [, fetchRequests] = useAtom(fetchAstrologyRequestsAtom); // 🚀 新增
  const [expandedSections, setExpandedSections] = useState<string[]>(['intro']);
  const [showQRCode, setShowQRCode] = useState(false);
  
  // 动态设置页面标题
  useEffect(() => {
    document.title = `${config.intro.name} - 配置`;
  }, [config.intro.name]);

  // 🚀 新增：定期从数据库获取数据
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchRequests();
        console.log('✅ 已从数据库同步最新数据');
      } catch (error) {
        console.error('❌ 数据库同步失败');
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 10000); // 每10秒同步一次
    
    return () => clearInterval(interval);
  }, [fetchRequests]);
  
  // 监听占星请求更新事件
  useEffect(() => {
    const handleRequestsUpdate = () => {
      console.log('收到占星请求更新事件');
      fetchRequests(); // 🚀 改为从数据库获取
    };

    window.addEventListener('astrology-requests-updated', handleRequestsUpdate);
    window.addEventListener('new-astrology-request', handleRequestsUpdate);

    return () => {
      window.removeEventListener('astrology-requests-updated', handleRequestsUpdate);
      window.removeEventListener('new-astrology-request', handleRequestsUpdate);
    };
  }, [fetchRequests]);
  
  const handleSave = () => {
    toast.success('配置已保存');
  };
  
  // 导出占星请求
  const handleExportRequests = () => {
    console.log('导出占星请求数据:', requests);
    console.log('请求总数:', requests.length);
    
    if (requests.length === 0) {
      toast.error('暂无占星请求数据');
      return;
    }
    
    const dataStr = JSON.stringify(requests, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astrology-requests-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`占星请求数据已导出，共 ${requests.length} 条记录`);
  };
  
  // 清空占星请求
  const handleClearRequests = () => {
    if (requests.length === 0) {
      toast.error('暂无数据需要清空');
      return;
    }
    
    if (window.confirm(`确定要清空所有 ${requests.length} 条占星请求吗？此操作不可恢复！`)) {
      setRequests([]);
      toast.success('占星请求已清空');
    }
  };
  
  // 切换折叠面板
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  
  // 生成分享链接
  const generateShareLink = () => {
    try {
      // 创建一个不包含头像的配置副本，减少数据大小
      const configForShare = {
        ...config,
        intro: {
          ...config.intro,
          avatar: undefined // 移除头像数据以减少URL长度
        }
      };
      
      const configData = encodeURIComponent(JSON.stringify(configForShare));
      const baseUrl = window.location.origin + window.location.pathname;
      // 修复：直接在 hash 后添加参数，不使用 /?
      const shareLink = `${baseUrl}#/config-import?data=${configData}`;
      
      // 检查 URL 长度
      if (shareLink.length > 2000) {
        toast.error('配置数据过大，建议使用文件导出功能');
        return '';
      }
      
      return shareLink;
    } catch (error) {
      toast.error('生成分享链接失败');
      return '';
    }
  };

  // 复制分享链接
  const handleCopyShareLink = () => {
    const shareLink = generateShareLink();
    if (!shareLink) return;
    
    navigator.clipboard.writeText(shareLink).then(() => {
      toast.success('分享链接已复制到剪贴板\n注意：头像需要单独上传');
    }).catch(() => {
      // 降级方案：手动复制
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('分享链接已复制到剪贴板\n注意：头像需要单独上传');
    });
  };

  // 导出配置
  const handleExportConfig = () => {
    const configData = {
      config,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };
    const dataStr = JSON.stringify(configData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `site-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('配置文件已导出');
  };

  // 导入配置
  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('请选择JSON格式的配置文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        // 验证配置文件格式
        if (jsonData.config && jsonData.config.intro && jsonData.config.follow && jsonData.config.astrology) {
          setConfig(jsonData.config);
          toast.success('配置导入成功！');
        } else {
          toast.error('配置文件格式不正确');
        }
      } catch (error) {
        toast.error('配置文件解析失败');
      }
    };
    reader.readAsText(file);
    
    // 重置 input
    e.target.value = '';
  };

  // 生成二维码数据
  const generateQRCodeData = () => {
    return generateShareLink();
  };
  
  // 头像上传处理
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }
    
    // 检查文件大小（限制为 2MB）
    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setConfig({
        ...config,
        intro: { ...config.intro, avatar: base64String }
      });
      toast.success('头像上传成功');
    };
    reader.readAsDataURL(file);
  };
  
  // 移除头像
  const handleRemoveAvatar = () => {
    setConfig({
      ...config,
      intro: { ...config.intro, avatar: undefined }
    });
    toast.success('头像已移除');
  };
  
  const sections = [
    { 
      id: 'intro', 
      title: '自我介绍', 
      icon: User,
      description: '设置姓名、标题、描述和头像'
    },
    { 
      id: 'follow', 
      title: '关注模块', 
      icon: LinkIcon,
      description: '配置小红书链接和联系方式'
    },
    { 
      id: 'astrology', 
      title: '占星服务', 
      icon: Star,
      description: '设置占星服务相关信息'
    },
    { 
      id: 'sync', 
      title: '配置同步', 
      icon: Smartphone,
      description: '在不同设备间同步配置'
    },
    { 
      id: 'requests', 
      title: '占星请求', 
      icon: Mail,
      description: `管理用户的占星请求 (${requests.length}条)`
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回首页
            </Link>
            <h1 className="text-lg font-bold text-gray-800">网站配置</h1>
            <button
              onClick={handleSave}
              className="flex items-center px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              <Save className="w-4 h-4 mr-1" />
              保存
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-4 py-5">
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            
            return (
              <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                {/* 折叠面板头部 */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                >
                  <div className="flex items-center flex-1 text-left">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{section.title}</h3>
                      <p className="text-xs text-gray-500">{section.description}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {/* 折叠面板内容 */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    {section.id === 'intro' && (
                      <div className="space-y-4 pt-4">
                        {/* 头像上传区域 */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            头像
                          </label>
                          
                          <div className="flex items-center space-x-4">
                            {/* 头像预览 */}
                            <div className="relative">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                                {config.intro.avatar ? (
                                  <img 
                                    src={config.intro.avatar} 
                                    alt="头像预览"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  config.intro.name.slice(0, 2)
                                )}
                              </div>
                              
                              {/* 移除头像按钮 */}
                              {config.intro.avatar && (
                                <button
                                  onClick={handleRemoveAvatar}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            
                            {/* 上传按钮 */}
                            <div className="flex-1">
                              <label className="inline-flex items-center px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer text-sm">
                                <Upload className="w-4 h-4 mr-2" />
                                {config.intro.avatar ? '更换' : '上传'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleAvatarUpload}
                                  className="hidden"
                                />
                              </label>
                              <p className="text-xs text-gray-500 mt-1">
                                支持 JPG、PNG，不超过 2MB
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              姓名
                            </label>
                            <input
                              type="text"
                              value={config.intro.name}
                              onChange={(e) => setConfig({
                                ...config,
                                intro: { ...config.intro, name: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              标题
                            </label>
                            <input
                              type="text"
                              value={config.intro.title}
                              onChange={(e) => setConfig({
                                ...config,
                                intro: { ...config.intro, title: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              个人描述
                            </label>
                            <textarea
                              value={config.intro.description}
                              onChange={(e) => setConfig({
                                ...config,
                                intro: { ...config.intro, description: e.target.value }
                              })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {section.id === 'follow' && (
                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            小红书短剧链接
                          </label>
                          <input
                            type="url"
                            value={config.follow.xiaohongbook.dramaLink}
                            onChange={(e) => setConfig({
                              ...config,
                              follow: {
                                ...config.follow,
                                xiaohongbook: {
                                  ...config.follow.xiaohongbook,
                                  dramaLink: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            小红书AI分享链接
                          </label>
                          <input
                            type="url"
                            value={config.follow.xiaohongbook.aiLink}
                            onChange={(e) => setConfig({
                              ...config,
                              follow: {
                                ...config.follow,
                                xiaohongbook: {
                                  ...config.follow.xiaohongbook,
                                  aiLink: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              邮箱
                            </label>
                            <input
                              type="email"
                              value={config.follow.email}
                              onChange={(e) => setConfig({
                                ...config,
                                follow: { ...config.follow, email: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              微信号
                            </label>
                            <input
                              type="text"
                              value={config.follow.wechat}
                              onChange={(e) => setConfig({
                                ...config,
                                follow: { ...config.follow, wechat: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {section.id === 'astrology' && (
                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            服务描述
                          </label>
                          <textarea
                            value={config.astrology.serviceDescription}
                            onChange={(e) => setConfig({
                              ...config,
                              astrology: { ...config.astrology, serviceDescription: e.target.value }
                            })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            免责声明
                          </label>
                          <textarea
                            value={config.astrology.disclaimer}
                            onChange={(e) => setConfig({
                              ...config,
                              astrology: { ...config.astrology, disclaimer: e.target.value }
                            })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            打赏金额描述
                          </label>
                          <input
                            type="text"
                            value={config.astrology.tipAmount}
                            onChange={(e) => setConfig({
                              ...config,
                              astrology: { ...config.astrology, tipAmount: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {section.id === 'sync' && (
                      <div className="space-y-4 pt-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <h4 className="text-sm font-medium text-blue-800 mb-1">为什么需要同步？</h4>
                          <p className="text-xs text-blue-700">
                            配置数据存储在浏览器本地，电脑和手机是不同设备，数据不会自动同步。使用以下功能可以在不同设备间同步配置。
                          </p>
                        </div>

                        <div className="space-y-4">
                          {/* 设为默认配置 */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-800">设为默认配置</h4>
                            
                            <button
                              onClick={() => {
                                // 生成代码
                                const configCode = `// 默认配置
const defaultConfig: SiteConfig = ${JSON.stringify(config, null, 2)};`;
                                
                                // 复制到剪贴板
                                navigator.clipboard.writeText(configCode).then(() => {
                                  toast.success('默认配置代码已复制！\n请将此代码替换到 /stores/configStore.ts 文件中的 defaultConfig');
                                }).catch(() => {
                                  // 降级方案：显示在控制台
                                  console.log('默认配置代码：');
                                  console.log(configCode);
                                  toast.success('默认配置代码已打印到控制台！\n按F12查看并复制到 configStore.ts');
                                });
                              }}
                              className="w-full flex items-center justify-center px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              生成默认配置代码
                            </button>
                            
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-xs text-yellow-800">
                                <strong>使用说明：</strong><br/>
                                1. 点击上方按钮复制配置代码<br/>
                                2. 将代码替换到 stores/configStore.ts 文件中<br/>
                                3. 重新部署网站即可固化配置
                              </p>
                            </div>
                          </div>

                          {/* 文件同步 */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-800">文件同步</h4>
                            
                            <div className="space-y-2">
                              <button
                                onClick={handleExportConfig}
                                className="w-full flex items-center justify-center px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                导出配置文件
                              </button>
                              
                              <label className="w-full flex items-center justify-center px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer text-sm">
                                <Upload className="w-4 h-4 mr-2" />
                                导入配置文件
                                <input
                                  type="file"
                                  accept=".json"
                                  onChange={handleImportConfig}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            
                            <p className="text-xs text-gray-500">
                              导出配置文件到电脑，然后在手机上打开网站导入文件即可同步配置
                            </p>
                          </div>

                          {/* 链接分享 */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-800">链接分享</h4>
                            
                            <div className="space-y-2">
                              <button
                                onClick={handleCopyShareLink}
                                className="w-full flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                              >
                                <LinkIcon className="w-4 h-4 mr-2" />
                                复制分享链接
                              </button>
                              
                              <button
                                onClick={() => setShowQRCode(!showQRCode)}
                                className="w-full flex items-center justify-center px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                              >
                                <QrCode className="w-4 h-4 mr-2" />
                                {showQRCode ? '隐藏' : '显示'}二维码
                              </button>
                            </div>
                            
                            <p className="text-xs text-gray-500">
                              生成包含配置的链接，在手机上打开链接即可自动导入配置
                            </p>
                          </div>
                        </div>

                        {/* 二维码显示 */}
                        {showQRCode && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                            <h5 className="text-sm font-medium text-gray-800 mb-3">扫码导入配置</h5>
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              <div className="text-xs text-gray-500 mb-2">请使用支持二维码的工具扫描以下链接：</div>
                              <div className="p-3 bg-gray-100 rounded border text-xs font-mono break-all">
                                {generateQRCodeData()}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                              💡 建议复制链接直接发送到手机，或使用微信扫一扫等工具
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {section.id === 'requests' && (
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-800">
                            占星请求管理 ({requests.length}条)
                          </h4>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                // 🚀 完整系统诊断
                                console.log('🔍 开始系统诊断...');
                                toast('正在诊断系统状态...', { icon: '🔍' });
                                
                                try {
                                  // 1. 检查本地存储
                                  const stored = localStorage.getItem('astrology-requests');
                                  const localCount = stored ? JSON.parse(stored).length : 0;
                                  console.log('📊 本地存储数据:', localCount, '条');
                                  
                                  // 2. 验证邮件配置
                                  const emailValid = await validateEmailJSConfig();
                                  console.log('📧 邮件配置状态:', emailValid ? '正常' : '异常');
                                  
                                  // 3. 测试本地存储写入
                                  const testData = {
                                    birthDate: '2000-01-01',
                                    birthTime: '12:00',
                                    birthLocation: '测试地点',
                                    email: 'test@example.com',
                                    timestamp: Date.now()
                                  };
                                  
                                  const testRequests = [...requests, testData];
                                  localStorage.setItem('astrology-requests', JSON.stringify(testRequests));
                                  console.log('✅ 本地存储写入测试通过');
                                  
                                  // 恢复原始数据
                                  localStorage.setItem('astrology-requests', JSON.stringify(requests));
                                  
                                  toast.success(`诊断完成！本地数据: ${localCount}条，邮件服务: ${emailValid ? '正常' : '需配置'}`);
                                  
                                } catch (error) {
                                  console.error('❌ 诊断失败:', error);
                                  toast.error('诊断失败，请查看控制台');
                                }
                              }}
                              className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 transition-colors"
                            >
                              🔍 系统诊断
                            </button>
                            <button
                              onClick={() => {
                                // 🚀 EmailJS 配置验证
                                console.log('开始验证EmailJS配置...');
                                validateEmailJSConfig().then(isValid => {
                                  if (isValid) {
                                    toast.success('✅ EmailJS配置验证通过');
                                  } else {
                                    toast.error('❌ EmailJS配置验证失败，请检查控制台');
                                  }
                                });
                              }}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                            >
                              📧 验证邮件配置
                            </button>
                            <button
                              onClick={() => {
                                // 强制刷新数据
                                const stored = localStorage.getItem('astrology-requests');
                                if (stored) {
                                  try {
                                    const parsed = JSON.parse(stored);
                                    setRequests(parsed);
                                    toast.success('数据已刷新');
                                  } catch (e) {
                                    toast.error('数据刷新失败');
                                  }
                                } else {
                                  toast.info('暂无数据');
                                }
                              }}
                              className="text-xs text-orange-600 hover:text-orange-700 underline px-2 py-1 rounded hover:bg-orange-50 transition-colors"
                            >
                              刷新数据
                            </button>
                          </div>
                        </div>
                        
                        {/* 实时数据监控 */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <h5 className="text-sm font-medium text-blue-800 mb-2">📊 数据监控</h5>
                          <div className="text-xs text-blue-700 space-y-1">
                            <p>• 当前请求总数: <strong className="text-lg">{requests.length}</strong></p>
                            <p>• 最后一条请求: {requests.length > 0 ? new Date(requests[requests.length-1]?.timestamp).toLocaleString() : '无'}</p>
                            <p>• 数据存储状态: <span className="text-green-600">✓ 已启用本地存储</span></p>
                            <p>• 实时更新: <span className="text-green-600">✓ 自动检测新请求</span></p>
                            <p>• 邮件通知: <span className="text-orange-600">🔧 需要验证配置</span></p>
                          </div>
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleExportRequests}
                            className="flex items-center justify-center px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            导出数据
                          </button>
                          <button
                            onClick={handleClearRequests}
                            className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            清空数据
                          </button>
                        </div>
                        
                        {/* 请求列表 */}
                        <div className="space-y-3">
                          {requests.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 text-sm">
                              <div className="mb-2">暂无占星请求</div>
                              <div className="text-xs text-gray-400">用户提交后会在这里显示</div>
                              <div className="text-xs text-orange-600 mt-2">💡 提示：数据存储在浏览器本地，请确保在同一设备查看</div>
                            </div>
                          ) : (
                            requests.map((request, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-600">出生信息</p>
                                    <p className="text-sm font-medium">{request.birthDate} {request.birthTime}</p>
                                    <p className="text-sm text-gray-700">{request.birthLocation}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600">联系邮箱</p>
                                    <p className="text-sm font-medium">{request.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600">提交时间</p>
                                    <p className="text-sm text-gray-700">
                                      {new Date(request.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;