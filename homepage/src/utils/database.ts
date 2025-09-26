/**
 * 免费数据库服务
 * 使用 Supabase 免费数据库存储占星请求
 */
import { createClient } from '@supabase/supabase-js';

// Supabase 免费配置（需要注册）
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface DbAstrologyRequest {
  id?: number;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  email: string;
  created_at?: string;
}

export const saveAstrologyRequest = async (data: Omit<DbAstrologyRequest, 'id' | 'created_at'>) => {
  try {
    const { data: result, error } = await supabase
      .from('astrology_requests')
      .insert([data])
      .select();
    
    if (error) throw error;
    
    console.log('数据已保存到数据库:', result);
    return result;
  } catch (error) {
    console.error('数据库保存失败:', error);
    throw error;
  }
};

export const getAllAstrologyRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('astrology_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('获取数据失败:', error);
    return [];
  }
};
