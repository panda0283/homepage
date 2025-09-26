/**
 * 关注模块
 * 展示小红书链接、邮箱、微信等联系方式
 */
import React from 'react';
import { useAtom } from 'jotai';
import { siteConfigAtom } from '../../stores/configStore';
import { ExternalLink, Mail, MessageCircle, Heart, Sparkles } from 'lucide-react';

const FollowSection: React.FC = () => {
  const [config] = useAtom(siteConfigAtom);
  
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-orange-100/50 p-5 mb-5 border border-orange-100/50 overflow-hidden relative">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/30 to-amber-100/30 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-50/40 to-orange-100/40 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
            关注我
          </h2>
          <p className="text-xs text-gray-500">
            在小红书与我互动，或通过其他方式联系
          </p>
        </div>
        
        <div className="space-y-4">
          {/* 小红书账号 - 差异化配色 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 小红书短剧账号 - 红色系，符合小红书品牌 */}
            <a 
              href={config.follow.xiaohongbook.dramaLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                // 确保在新标签页打开，防止在当前页面跳转
                e.preventDefault();
                window.open(config.follow.xiaohongbook.dramaLink, '_blank', 'noopener,noreferrer');
              }}
              className="group relative bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 rounded-xl p-3 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-red-200/50 hover:shadow-red-300/60 hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-2">
                    <Heart className="w-4 h-4 text-white fill-current" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">短剧分享</h3>
                    <p className="text-xs text-white/90">小红书</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
              </div>
            </a>
            
            {/* 小红书AI账号 - 蓝紫色系，体现AI科技感 */}
            <a 
              href={config.follow.xiaohongbook.aiLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                // 确保在新标签页打开，防止在当前页面跳转
                e.preventDefault();
                window.open(config.follow.xiaohongbook.aiLink, '_blank', 'noopener,noreferrer');
              }}
              className="group relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl p-3 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-blue-200/50 hover:shadow-blue-300/60 hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-2">
                    <Sparkles className="w-4 h-4 text-white fill-current" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">AI分享</h3>
                    <p className="text-xs text-white/90">小红书</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
              </div>
            </a>
          </div>
          
          {/* 联系信息 - 重新设计为卡片式 */}
          <div className="bg-gradient-to-br from-orange-50/80 via-white to-amber-50/80 rounded-xl p-4 border border-orange-100/50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">联系方式</h3>
            <div className="space-y-3">
              {/* 邮箱卡片 */}
              <div className="group bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-orange-100/30 hover:border-orange-200/50 hover:bg-white transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 font-medium">个人邮箱</p>
                    <p className="text-sm text-gray-800 font-semibold truncate">{config.follow.email}</p>
                  </div>
                </div>
              </div>
              
              {/* 微信卡片 */}
              <div className="group bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-orange-100/30 hover:border-orange-200/50 hover:bg-white transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 font-medium">微信号</p>
                    <p className="text-sm text-gray-800 font-semibold truncate">{config.follow.wechat}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowSection;