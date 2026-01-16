import { post } from '@/api/index';

// 获取推送任务列表
export const getPushTasks = (data: any) => post('telegram-push/tasks', data);

// 创建推送任务
export const createPushTask = (data: any) => post('telegram-push/tasks/store', data);

// 更新推送任务
export const updatePushTask = (data: any) => post('telegram-push/tasks/update', data);

// 删除推送任务
export const deletePushTask = (data: { id: number }) => post('telegram-push/tasks/delete', data);

// 查看推送任务详情
export const getPushTaskDetail = (data: { id: number }) => post('telegram-push/tasks/show', data);

// 立即执行推送任务
export const executePushTask = (data: { id: number }) => post('telegram-push/tasks/execute', data);

// 获取推送日志
export const getPushLogs = (data: any) => post('telegram-push/logs', data);

// 获取用户统计
export const getUserStats = (data: { bot_name: string }) => post('telegram-push/user-stats', data);

// 定时类型选项
export const scheduleTypes = [
    { label: '单次', value: 'once' },
    { label: '每日', value: 'daily' },
    { label: '每周', value: 'weekly' },
    { label: '自定义', value: 'custom' }
];

// 目标类型选项
export const targetTypes = [
    { label: '全部用户', value: 'all' },
    { label: '新用户', value: 'new' },
    { label: '老用户', value: 'old' },
    { label: '自定义', value: 'custom' },
    { label: '群组', value: 'group' }
];

// 状态选项
export const statusOptions = [
    { label: '禁用', value: 0 },
    { label: '启用', value: 1 },
    { label: '执行中', value: 2 }
];
// 状态选项
export const userStatusOptions = [
    { label: '活跃', value: 1 },
    { label: '不活跃', value: 0 }
];

// 星期选项
export const weekDays = [
    { label: '周一', value: 1 },
    { label: '周二', value: 2 },
    { label: '周三', value: 3 },
    { label: '周四', value: 4 },
    { label: '周五', value: 5 },
    { label: '周六', value: 6 },
    { label: '周日', value: 7 }
];

