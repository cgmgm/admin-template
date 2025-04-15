import { post, get } from '@/api/index';

// 获取文件列表
export const getFiles = (data?: any) => post('files', data);

// 获取文件详情
export const getFileDetail = (data?: any) => post('files/show', data);

// 检查文件是否存在
export const checkFileExists = (data?: any) => post('files/check', data);

// 删除文件
export const delFile = (data?: any) => post('files/delete', data);

// 上传文件
export const uploadFile = (data?: any) => post('files/upload', data);

// 文件类型选项
export const fileTypeOptions = [
    { label: '全部', value: '' },
    { label: '图片', value: 'image' },
    { label: '视频', value: 'video' },
    { label: '文档', value: 'document' },
    { label: '其他', value: 'other' }
];

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 