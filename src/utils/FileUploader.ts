import { Session } from '@/utils/storage';

/**
 * 文件上传工具，支持进度监控、文件检查和上传
 */
export class FileUploader {
    /**
     * 上传文件
     * @param file 要上传的文件对象
     * @param options 上传配置项
     */
    static upload(file: File, options: {
        path?: string,
        is_public?: boolean,
        onProgress?: (progress: {
            lengthComputable: boolean,
            loaded: number,
            total: number,
            percentage: number
        }) => void,
        onSuccess?: (result: any) => void,
        onError?: (error: Error) => void
    } = {}) {
        const {
            path,
            is_public = true,
            onProgress = null,
            onSuccess = null,
            onError = null
        } = options;

        // 创建FormData
        const formData = new FormData();
        formData.append('file', file);

        if (path !== undefined) {
            formData.append('path', path);
        }

        formData.append('is_public', is_public ? '1' : '0');

        // 获取token
        const token = Session.get('token');
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // 创建XHR请求
        const xhr = new XMLHttpRequest();
        const baseUrl = import.meta.env.VITE_APP_BASE_API || '';
        const url = `${baseUrl}/admin/files/upload`;

        // 打开连接
        xhr.open('POST', url, true);

        // 设置请求头
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
        });

        // 监听上传进度
        if (onProgress) {
            xhr.upload.onprogress = (event) => {
                onProgress({
                    lengthComputable: event.lengthComputable,
                    loaded: event.loaded,
                    total: event.total,
                    percentage: event.lengthComputable ? Math.round((event.loaded / event.total) * 100) : 0
                });
            };
        }

        // 请求完成处理
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.code === 200) {
                        if (onSuccess) {
                            console.log(response.data, 'response.data');
                            onSuccess(response.data);
                        }
                    } else {
                        if (onError) {
                            onError(new Error(response.message || '上传失败'));
                        }
                    }
                } catch (e) {
                    if (onError) {
                        onError(new Error('解析响应失败'));
                    }
                }
            } else {
                if (onError) {
                    onError(new Error(`上传失败: ${xhr.status} ${xhr.statusText}`));
                }
            }
        };

        // 请求错误处理
        xhr.onerror = function () {
            if (onError) {
                onError(new Error('网络错误，上传失败'));
            }
        };

        // 发送请求
        xhr.send(formData);

        // 返回abort方法，用于取消上传
        return {
            abort: () => xhr.abort()
        };
    }

    /**
     * 检查文件是否已存在（通过MD5）
     * @param file 要检查的文件
     * @param callback 回调函数
     */
    static checkExists(file: File): Promise<{ exists: boolean; file?: any }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);

            reader.onload = async function () {
                try {
                    const arrayBuffer = reader.result as ArrayBuffer;
                    // 使用SubtleCrypto计算MD5哈希值
                    const hashBuffer = await crypto.subtle.digest('MD5', arrayBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                    // 发送请求检查文件是否存在
                    const token = Session.get('token');
                    const baseUrl = import.meta.env.VITE_APP_BASE_API || '';

                    const response = await fetch(`${baseUrl}/admin/files/check`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ md5: hashHex })
                    });

                    const result = await response.json();
                    if (result.code === 200) {
                        resolve(result.data);
                    } else {
                        reject(new Error(result.message || '检查文件失败'));
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = function () {
                reject(new Error('读取文件失败'));
            };
        });
    }

    /**
     * 获取文件列表
     * @param params 查询参数
     */
    static getList(params: {
        page?: number;
        page_size?: number;
        type?: 'image' | 'video' | 'document' | 'other';
        extension?: string;
        a_id?: number;
        keyword?: string;
    } = {}): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const token = Session.get('token');
                const baseUrl = import.meta.env.VITE_APP_BASE_API || '';

                // 构建URL查询参数
                const queryParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, value.toString());
                    }
                });

                const url = `${baseUrl}/admin/files?${queryParams.toString()}`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();
                if (result.code === 200) {
                    resolve(result.data);
                } else {
                    reject(new Error(result.message || '获取文件列表失败'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 获取文件详情
     * @param id 文件ID
     */
    static getDetail(id: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const token = Session.get('token');
                const baseUrl = import.meta.env.VITE_APP_BASE_API || '';

                const response = await fetch(`${baseUrl}/admin/files/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();
                if (result.code === 200) {
                    resolve(result.data);
                } else {
                    reject(new Error(result.message || '获取文件详情失败'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 删除文件
     * @param id 文件ID
     */
    static delete(id: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const token = Session.get('token');
                const baseUrl = import.meta.env.VITE_APP_BASE_API || '';

                const response = await fetch(`${baseUrl}/admin/files/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();
                if (result.code === 200) {
                    resolve(result.data);
                } else {
                    reject(new Error(result.message || '删除文件失败'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 判断文件类型
     * @param file 文件对象
     */
    static getFileType(file: File): 'image' | 'video' | 'document' | 'other' {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        // 图片类型
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
            return 'image';
        }

        // 视频类型
        if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(extension)) {
            return 'video';
        }

        // 文档类型
        if (['txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].includes(extension)) {
            return 'document';
        }

        // 其他类型
        return 'other';
    }

    /**
     * 格式化文件大小
     * @param bytes 字节数
     */
    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

export default FileUploader; 