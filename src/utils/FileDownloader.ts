import { Session } from '@/utils/storage';

/**
 * 文件下载工具，支持进度监控
 */
export class FileDownloader {
    /**
     * 下载文件
     * @param url 下载URL
     * @param options 配置项
     */
    static download(url: string, options: {
        method?: 'GET' | 'POST',
        params?: Record<string, any>,
        data?: any,
        onProgress?: (progress: {
            lengthComputable: boolean,
            loaded: number,
            total: number,
            percentage: number
        }) => void,
        onSuccess?: (blob: Blob, filename: string) => void,
        onError?: (error: Error) => void
    } = {}) {
        const {
            method = 'GET',
            params = {},
            data = null,
            onProgress = null,
            onSuccess = null,
            onError = null
        } = options;

        let headers = {};
        const token = Session.get('token');
        if (token) {
            headers = {
                'Authorization': `Bearer ${token}`
            };
        }

        // 构造URL与查询参数
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                queryParams.append(key, params[key].toString());
            }
        });
        const baseUrl = import.meta.env.VITE_APP_BASE_API || '';

        const finalUrl = `${baseUrl}${url}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        // 创建XHR请求
        const xhr = new XMLHttpRequest();

        // 一定要设置responseType为blob，这对于文件下载至关重要
        xhr.responseType = 'blob';

        // 打开连接
        xhr.open(method, finalUrl, true);

        // 设置请求头
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key as keyof typeof headers]);
        });

        // 设置进度模拟
        let progressInterval: any = null;
        let artificialProgress = 0;

        const startProgressSimulation = () => {
            if (progressInterval) clearInterval(progressInterval);

            progressInterval = setInterval(() => {
                if (artificialProgress < 60) {
                    artificialProgress += 5;
                } else if (artificialProgress < 75) {
                    artificialProgress += 1;
                } else if (artificialProgress < 90) {
                    artificialProgress += 0.5;
                }

                if (artificialProgress >= 90) {
                    clearInterval(progressInterval);
                }

                // 回调模拟进度
                if (onProgress) {
                    onProgress({
                        lengthComputable: true,
                        loaded: artificialProgress,
                        total: 100,
                        percentage: artificialProgress
                    });
                }
            }, 300);
        };

        // 监听加载进度
        if (onProgress) {
            // 开始模拟进度
            startProgressSimulation();

            xhr.onprogress = (event) => {
                console.log('下载进度:', {
                    lengthComputable: event.lengthComputable,
                    loaded: event.loaded,
                    total: event.total
                });

                // 如果有实际的进度信息，停止模拟
                if (event.lengthComputable && event.total > 0) {
                    if (progressInterval) {
                        clearInterval(progressInterval);
                        progressInterval = null;
                    }

                    // 即使lengthComputable为false，也传递加载进度
                    onProgress({
                        lengthComputable: event.lengthComputable,
                        loaded: event.loaded,
                        total: event.total,
                        percentage: event.lengthComputable ? Math.round((event.loaded / event.total) * 100) : -1
                    });
                }
            };
        }

        // 请求完成处理
        xhr.onload = function () {
            // 停止模拟进度
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }

            // 完成进度为100%
            if (onProgress) {
                onProgress({
                    lengthComputable: true,
                    loaded: 100,
                    total: 100,
                    percentage: 100
                });
            }

            if (xhr.status >= 200 && xhr.status < 300) {
                // 检查是否返回的是JSON错误
                try {
                    // 创建一个FileReader来读取Blob内容
                    const reader = new FileReader();
                    reader.onload = function () {
                        try {
                            // 尝试解析为JSON
                            const text = reader.result as string;
                            const jsonResult = JSON.parse(text);

                            // 检查是否有错误码
                            if (jsonResult.code !== undefined && jsonResult.code !== 0 && jsonResult.code !== 200) {
                                const errorMsg = jsonResult.message || '下载失败，服务器返回错误';
                                if (onError) {
                                    onError(new Error(errorMsg));
                                }
                                return;
                            }
                        } catch (e) {
                            // 解析失败，说明不是JSON，继续处理为文件下载
                            processFileDownload();
                        }
                    };
                    reader.readAsText(xhr.response.slice(0, 1000)); // 只读取前1000字节检查
                } catch (e) {
                    // 如果出错，继续处理为文件下载
                    processFileDownload();
                }

                function processFileDownload() {
                    // 请求成功
                    const blob = xhr.response;
                    // 获取文件名
                    let filename = '';
                    const disposition = xhr.getResponseHeader('Content-Disposition');

                    if (disposition && disposition.indexOf('attachment') !== -1) {
                        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        const matches = filenameRegex.exec(disposition);
                        if (matches != null && matches[1]) {
                            filename = matches[1].replace(/['"]/g, '');
                        }
                    }

                    if (!filename) {
                        // 如果无法从响应头获取文件名，生成一个随机文件名
                        filename = `download_${new Date().getTime()}.csv`;
                    }

                    // 创建下载链接
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                    if (onSuccess) {
                        onSuccess(blob, filename);
                    }
                }
            } else {
                // 请求失败
                if (onError) {
                    onError(new Error(`下载失败: ${xhr.status} ${xhr.statusText}`));
                }
            }
        };

        // 请求错误处理
        xhr.onerror = function () {
            // 停止模拟进度
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }

            if (onError) {
                onError(new Error('网络错误，下载失败'));
            }
        };

        // 发送请求
        xhr.send(data);

        // 返回abort方法，用于取消下载
        return {
            abort: () => {
                if (progressInterval) {
                    clearInterval(progressInterval);
                    progressInterval = null;
                }
                xhr.abort();
            }
        };
    }
}

export default FileDownloader; 