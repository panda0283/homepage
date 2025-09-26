/**
 * 自我介绍模块
 * 展示个人信息、头像、标题和描述
 */
import React from 'react';
import { useAtom } from 'jotai';
import { siteConfigAtom } from '../../stores/configStore';
import { Star, Sparkles } from 'lucide-react';

const IntroSection: React.FC = () => {
  const [config] = useAtom(siteConfigAtom);
  
  return (
    <div className="relative text-center space-y-3 mb-5">
      {/* 背景装饰 - 跟提交按钮完全相同的橙色渐变 */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 rounded-2xl -z-10"></div>
      <div className="relative p-4">
        {/* 头像 - 稍微大一些 */}
        <div className="relative mx-auto w-16 h-16 mb-3">
          <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-black/10">
            {config.intro.avatar ? (
              <img 
                src={config.intro.avatar} 
                alt={config.intro.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              config.intro.name.slice(0, 2)
            )}
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-orange-600" />
          </div>
        </div>
        
        {/* 标题和描述 - 优化白色文字的对比度 */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-white drop-shadow-sm">
            {config.intro.name}
          </h1>
          <p className="text-sm font-medium text-white/90 drop-shadow-sm">
            {config.intro.title}
          </p>
          <p className="text-xs text-white/80 max-w-sm mx-auto leading-relaxed drop-shadow-sm">
            {config.intro.description}
          </p>
        </div>
        
        {/* 装饰元素 - 调整为更清晰的白色 */}
        <div className="flex justify-center space-x-1 mt-2">
          <Star className="w-2.5 h-2.5 text-white/70 fill-current drop-shadow-sm" />
          <Star className="w-2 h-2 text-white/60 fill-current drop-shadow-sm" />
          <Star className="w-2.5 h-2.5 text-white/70 fill-current drop-shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export default IntroSection;