import { post } from '@/api/index';
import request from '@/utils/request';

// Telegram Bot 管理
export const getTelegramBots = (data?: any) => post('telegram-bots', data);

export const getAllTelegramBots = (data?: any) => post('telegram-bots/all', data);

export const getTelegramBotGroups = (data?: any) => post('telegram-bots/groups', data);

export const getTelegramBotDetail = (data?: any) => post('telegram-bots/show', data);

export const saveTelegramBot = (data?: any) => post('telegram-bots/store', data);

export const delTelegramBot = (data?: any) => post('telegram-bots/destroy', data);

export const updateTelegramBotStatus = (data?: any) => post('telegram-bots/updateStatus', data);

export const batchImportTelegramBots = (data?: any) => post('telegram-bots/batchImport', data);

export const exportTelegramBots = (data?: any) => post('telegram-bots/export', data);

// Webhook 管理
export const setWebhook = (data?: any) => post('telegram-webhook/set', data);

export const unsetWebhook = (data?: any) => post('telegram-webhook/unset', data);

export const getWebhookInfo = (data?: any) => post('telegram-webhook/info', data);

export const getTelegramBotUsers = (data?: any) => post('telegram-bot-users', data);

// 获取可用的处理方法列表
export const getAvailableHandleMethods = () => {
    return [
        { label: '个人中心', value: 'userInfo' },
        { label: '切换语言', value: 'switchLanguage' },
        { label: '上分充值', value: 'recharge' },
        { label: '下分提现', value: 'withdrawal' },
    ];
};

// Webhook 管理 - 注意这些接口在 /api/telegram/ 路径下，不在 /admin/ 下
// 创建一个不带 /admin 前缀的请求实例
const apiRequest = (url: string) => {
    return request({
        url: url,
        method: 'get',
        baseURL: '/', // 使用根路径，让 Vite 代理处理
    });
};


// 状态选项
export const botStatusOptions = [
    { label: '禁用', value: 0 },
    { label: '启用', value: 1 }
];

// 状态文本转换
export const getBotStatusText = (status: number) => {
    const option = botStatusOptions.find(item => item.value === status);
    return option ? option.label : '未知';
};

// 默认特殊按钮配置
export const defaultSpecialButtons = {
    'wait_for_update': 'handleWaitForUpdate',
};

