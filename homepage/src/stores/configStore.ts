/**
 * 配置信息的全局状态管理
 * 使用 jotai 管理网站配置，支持本地存储持久化
 */
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { SiteConfig, AstrologyRequest } from '../types';
import { saveAstrologyRequest, getAllAstrologyRequests } from '../utils/database';

// 默认头像 - 使用渐变背景 + 熊猫emoji，确保所有人都能看到
const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8dGV4dCB4PSI1MCIgeT0iNjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPuWwj+WwjzwvdGV4dD4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmI3MTIzO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmNTk5MDc7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+`;

// 默认配置 - 已根据用户需求固化
const defaultConfig: SiteConfig = {
  intro: {
    name: 'panda',
    title: '',
    description: '产品经理 · 占星新手 · 短剧脑残粉',
    avatar: defaultAvatar // 使用默认头像，确保所有人都能看到
  },
  follow: {
    xiaohongbook: {
      dramaLink: 'https://xhslink.com/m/A1NTqxcQ7FM',
      aiLink: 'https://xhslink.com/m/8rqeElMBSgU'
    },
    email: 'makeawish0283@gmail.com', // ✅ 已更新为Gmail邮箱
    wechat: '18600468682'
  },
  astrology: {
    serviceDescription: '仅限本命盘',
    disclaimer: '新手上路，仅供参考，可以加微信进一步交流',
    tipAmount: '一杯咖啡☕️'
  }
};

// 网站配置状态
export const siteConfigAtom = atomWithStorage<SiteConfig>('site-config', defaultConfig);

// 占星请求列表状态 - 添加实时同步机制
export const astrologyRequestsAtom = atomWithStorage<AstrologyRequest[]>('astrology-requests', []);

// 监听存储变化，实现多标签页同步
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'astrology-requests') {
      console.log('检测到占星请求数据变化:', e.newValue);
      // 触发全局事件通知
      window.dispatchEvent(new CustomEvent('astrology-requests-updated'));
    }
  });
}

// 添加新的占星请求 - 终极稳定版本
export const addAstrologyRequestAtom = atom(
  null,
  async (get, set, newRequest: Omit<AstrologyRequest, 'timestamp'>) => {
    try {
      console.log('🚀 开始添加占星请求...');
      console.log('📊 请求数据:', newRequest);
      
      // 🚀 添加参数验证
      if (!newRequest.birthDate || !newRequest.birthTime || !newRequest.birthLocation || !newRequest.email) {
        throw new Error('请求数据不完整');
      }
      
      const requests = get(astrologyRequestsAtom);
      console.log('📈 当前请求数量:', requests.length);
      
      const requestWithTimestamp: AstrologyRequest = {
        ...newRequest,
        timestamp: Date.now()
      };
      
      console.log('⏰ 添加时间戳:', new Date(requestWithTimestamp.timestamp).toLocaleString());
      
      // 🚀 安全地处理状态更新
      let updatedRequests: AstrologyRequest[];
      try {
        updatedRequests = [...requests, requestWithTimestamp];
        console.log('📊 新请求数量:', updatedRequests.length);
      } catch (arrayError) {
        console.error('❌ 数组操作失败:', arrayError);
        throw new Error('数据处理失败');
      }
      
      // 🚀 安全地设置状态
      try {
        set(astrologyRequestsAtom, updatedRequests);
        console.log('✅ 状态更新成功');
      } catch (setError) {
        console.error('❌ 状态设置失败:', setError);
        throw new Error('状态更新失败');
      }
      
      // 🚀 安全地保存到localStorage
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('astrology-requests', JSON.stringify(updatedRequests));
          console.log('✅ 本地存储保存成功');
        } else {
          console.warn('⚠️ localStorage不可用');
        }
      } catch (storageError) {
        console.error('❌ 本地存储失败:', storageError);
        // 存储失败不影响主流程，继续执行
        console.log('⚠️ 继续执行，尽管本地存储失败');
      }
      
      // 🚀 发送事件通知（可选）
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('new-astrology-request', { 
            detail: requestWithTimestamp 
          }));
          console.log('📢 事件通知发送成功');
        }
      } catch (eventError) {
        console.error('⚠️ 事件发送失败（不影响主流程）:', eventError);
      }
      
      console.log('🎉 占星请求添加完成！');
      return true;
      
    } catch (error) {
      console.error('❌ 添加占星请求失败:', error);
      // 🚀 重要：重新抛出错误，让调用方知道
      throw error;
    }
  }
);

// 🚀 新增：从数据库获取所有请求
export const fetchAstrologyRequestsAtom = atom(
  null,
  async (get, set) => {
    try {
      const dbRequests = await getAllAstrologyRequests();
      console.log('从数据库获取到', dbRequests.length, '条请求');
      
      // 转换格式并更新状态
      const formattedRequests = dbRequests.map(item => ({
        birthDate: item.birth_date,
        birthTime: item.birth_time,
        birthLocation: item.birth_location,
        email: item.email,
        timestamp: new Date(item.created_at!).getTime()
      }));
      
      set(astrologyRequestsAtom, formattedRequests);
      return formattedRequests;
    } catch (error) {
      console.error('获取数据库数据失败:', error);
      return [];
    }
  }
);