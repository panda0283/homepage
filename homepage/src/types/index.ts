/**
 * 全局类型定义
 * 定义配置信息、表单数据等类型接口
 */

export interface SiteConfig {
  // 自我介绍配置
  intro: {
    name: string;
    title: string;
    description: string;
    avatar?: string; // 头像URL（可选）
  };
  
  // 关注模块配置
  follow: {
    xiaohongbook: {
      dramaLink: string;
      aiLink: string;
    };
    email: string;
    wechat: string;
  };
  
  // 占星服务配置
  astrology: {
    serviceDescription: string;
    disclaimer: string;
    tipAmount: string;
  };
}

export interface AstrologyRequest {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  email: string;
  message?: string; // 🚀 新增：用户留言（可选）
  timestamp: number;
}