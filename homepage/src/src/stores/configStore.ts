import { atom } from 'jotai';

// 默认配置
const defaultConfig = {
  intro: {
    name: '占星师小助手',
    title: '专业星盘解读',
    description: '用星星的语言，解读你的人生密码。专注星盘分析，为你提供专业的占星服务。',
    avatar: undefined
  },
  follow: {
    xiaohongbook: {
      dramaLink: 'https://www.xiaohongshu.com/user/profile/5f3b3b3b0000000001006b6b',
      aiLink: 'https://www.xiaohongshu.com/user/profile/5f3b3b3b0000000001006b6b'
    },
    email: 'example@email.com',
    wechat: 'your_wechat_id'
  },
  astrology: {
    title: '星盘解读服务',
    description: '提供专业的星盘分析，帮助你了解自己的性格特点、人生方向和潜在机遇。',
    serviceDescription: '我会根据您的出生信息制作专属星盘，分析您的性格特质、人生方向、感情运势等，并提供详细的解读报告。',
    disclaimer: '本服务仅供娱乐参考，请理性对待占星结果。如有重大人生决策，建议咨询专业人士。',
    tipAmount: '随喜打赏，金额不限'
  }
};

// 配置原子
export const siteConfigAtom = atom(defaultConfig);

// 占星请求原子
export const astrologyRequestsAtom = atom([]);

// 添加占星请求
export const addAstrologyRequestAtom = atom(
  null,
  (get, set, request) => {
    const currentRequests = get(astrologyRequestsAtom);
    const newRequests = [...currentRequests, request];
    set(astrologyRequestsAtom, newRequests);
    
    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('astrology-requests', JSON.stringify(newRequests));
    }
    
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('astrology-requests-updated'));
    window.dispatchEvent(new CustomEvent('new-astrology-request', { detail: request }));
  }
);

// 获取占星请求
export const fetchAstrologyRequestsAtom = atom(
  null,
  (get, set) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('astrology-requests');
      if (stored) {
        try {
          const requests = JSON.parse(stored);
          set(astrologyRequestsAtom, requests);
        } catch (error) {
          console.error('Failed to parse stored requests:', error);
        }
      }
    }
  }
);
