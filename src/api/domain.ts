import { post } from '@/api/index';

// 域名管理
export const getDomains = (data?: any) => post('domains', data);

export const getAllDomains = (data?: any) => post('domain/all', data);

export const getDomainDetail = (data?: any) => post('domains/show', data);

export const saveDomain = (data?: any) => post('domains/store', data);

export const delDomain = (data?: any) => post('domains/destroy', data);

// 投诉管理
export const getComplaints = (data?: any) => post('complaints', data);

export const getComplaintDetail = (data?: any) => post('complaints/show', data);

export const saveComplaint = (data?: any) => post('complaints/store', data);

export const delComplaint = (data?: any) => post('complaints/destroy', data);

export const updateComplaintStatus = (data?: any) => post('complaints/updateStatus', data);

// 状态选项
export const domainStatusOptions = [
    { label: '禁用', value: 0 },
    { label: '启用', value: 1 }
];

export const complaintStatusOptions = [
    { label: '待处理', value: 0 },
    { label: '处理中', value: 1 },
    { label: '已解决', value: 2 },
    { label: '已关闭', value: 3 }
];

// 状态文本转换
export const getDomainStatusText = (status: number) => {
    const option = domainStatusOptions.find(item => item.value === status);
    return option ? option.label : '未知';
};

export const getComplaintStatusText = (status: number) => {
    const option = complaintStatusOptions.find(item => item.value === status);
    return option ? option.label : '未知';
}; 