<template>
    <div class="file-upload-container">
        <!-- 上传区域 -->
        <div class="upload-area" :class="{ 'is-dragover': isDragover, 'is-disabled': disabled }"
            @dragover.prevent="onDragover" @dragleave.prevent="onDragleave" @drop.prevent="onDrop"
            @click="triggerFileInput">
            <div v-if="!uploadList.length || multiple" class="upload-placeholder">
                <el-icon class="upload-icon">
                    <Upload />
                </el-icon>
                <div class="upload-text">
                    <p>将文件拖到此处，或<em>点击上传</em></p>
                    <p class="upload-hint">{{ placeholder || `支持单个或多个文件，每个文件不超过${maxSize}MB` }}</p>
                </div>
            </div>

            <!-- 隐藏的文件输入 -->
            <input ref="fileInput" type="file" class="file-input" :multiple="multiple" :accept="accept"
                @change="onFileInputChange">
        </div>

        <!-- 文件列表 -->
        <div v-if="uploadList.length > 0" class="upload-list">
            <div v-for="(item, index) in uploadList" :key="index" class="upload-item"
                :class="{ 'is-error': item.status === 'error' }">
                <!-- 文件图标 -->
                <div class="upload-item-icon">
                    <el-icon v-if="item.type === 'image'">
                        <Picture />
                    </el-icon>
                    <el-icon v-else-if="item.type === 'video'">
                        <VideoCamera />
                    </el-icon>
                    <el-icon v-else-if="item.type === 'document'">
                        <Document />
                    </el-icon>
                    <el-icon v-else>
                        <Files />
                    </el-icon>
                </div>

                <!-- 文件信息 -->
                <div class="upload-item-content">
                    <div class="upload-item-name">{{ item.name }}</div>
                    <div class="upload-item-status">
                        <div v-if="item.status === 'uploading'" class="upload-progress">
                            <el-progress :percentage="item.percentage" :format="formatPercentage" :stroke-width="4" />
                        </div>
                        <div v-else-if="item.status === 'success'" class="upload-success">
                            <el-tag type="success" size="small">上传成功</el-tag>
                            <span class="file-size">{{ item.formattedSize }}</span>
                        </div>
                        <div v-else-if="item.status === 'error'" class="upload-error">
                            <el-tag type="danger" size="small">上传失败</el-tag>
                            <span class="error-message">{{ item.message }}</span>
                        </div>
                        <div v-else class="upload-pending">
                            <el-tag type="info" size="small">等待上传</el-tag>
                            <span class="file-size">{{ item.formattedSize }}</span>
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="upload-item-actions">
                    <el-button v-if="item.status === 'success'" type="text" size="small" @click.stop="onPreview(item)">
                        <el-icon>
                            <View />
                        </el-icon>
                    </el-button>
                    <el-button v-if="item.status === 'pending'" type="text" size="small" @click.stop="uploadFile(item)">
                        <el-icon>
                            <Upload />
                        </el-icon>
                    </el-button>
                    <el-button v-if="item.status === 'error'" type="text" size="small" @click.stop="retryUpload(item)">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                    </el-button>
                    <el-button type="text" size="small" @click.stop="removeFile(index)">
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 文件预览对话框 -->
        <el-dialog v-model="previewVisible" title="文件预览" width="70%" top="5vh" :before-close="closePreview">
            <div class="preview-container">
                <!-- 图片预览 -->
                <div v-if="currentPreview && currentPreview.type === 'image'" class="image-preview">
                    <img :src="currentPreview.url" :alt="currentPreview.name">
                </div>

                <!-- 视频预览 -->
                <div v-else-if="currentPreview && currentPreview.type === 'video'" class="video-preview">
                    <video controls :src="currentPreview.url"></video>
                </div>

                <!-- 文档预览（仅显示链接） -->
                <div v-else-if="currentPreview" class="document-preview">
                    <p>无法直接预览此类型文件，请点击下载:</p>
                    <el-button type="primary" @click="downloadFile(currentPreview)">
                        下载 {{ currentPreview.name }}
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="FileUpload">
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Upload, Picture, Document, Files, View, Delete, Refresh, VideoCamera } from '@element-plus/icons-vue';
import FileUploader from '@/utils/FileUploader';

// 定义文件项类型
interface UploadFile {
    file: File;
    name: string;
    size: number;
    formattedSize: string;
    type: 'image' | 'video' | 'document' | 'other';
    status: 'pending' | 'uploading' | 'success' | 'error';
    percentage: number;
    message?: string;
    response?: any;
    url?: string;
    uploader?: { abort: () => void };
}

// 组件属性
const props = defineProps({
    // 上传URL
    action: {
        type: String,
        default: ''
    },
    // 请求头
    headers: {
        type: Object,
        default: () => ({})
    },
    // 是否允许多选
    multiple: {
        type: Boolean,
        default: false
    },
    // 接受的文件类型
    accept: {
        type: String,
        default: ''
    },
    // 是否自动上传
    autoUpload: {
        type: Boolean,
        default: true
    },
    // 自定义上传路径
    path: {
        type: String,
        default: ''
    },
    // 是否公开访问
    isPublic: {
        type: Boolean,
        default: true
    },
    // 文件大小限制(MB)
    maxSize: {
        type: Number,
        default: 20
    },
    // 是否禁用
    disabled: {
        type: Boolean,
        default: false
    },
    // 最大文件数量
    limit: {
        type: Number,
        default: 10
    },
    // 提示文字
    placeholder: {
        type: String,
        default: ''
    },
    // 提示文字
    tip: {
        type: String,
        default: ''
    },
    // 是否检查文件是否已存在
    checkExists: {
        type: Boolean,
        default: true
    },
    // 默认文件列表
    defaultFileList: {
        type: Array as () => any[],
        default: () => []
    },
    // 自定义上传前检查
    beforeUpload: {
        type: Function,
        default: null
    },
    // 列表类型
    listType: {
        type: String,
        default: 'text'
    }
});

// 事件
const emit = defineEmits([
    'success',    // 上传成功
    'error',      // 上传失败
    'remove',     // 移除文件
    'preview',    // 预览文件
    'exceed',     // 超出文件数量限制
    'exceed-size',// 超出文件大小限制
    'all-success',// 所有文件上传成功
    'change'      // 文件列表变更
]);

// 响应式状态
const fileInput = ref<HTMLInputElement | null>(null);
const isDragover = ref(false);
const uploadList = ref<UploadFile[]>([]);
const isMultiple = computed(() => props.multiple);
const previewVisible = ref(false);
const currentPreview = ref<UploadFile | null>(null);

// 初始化默认文件列表
onMounted(() => {
    if (props.defaultFileList && props.defaultFileList.length > 0) {
        props.defaultFileList.forEach(file => {
            uploadList.value.push({
                file: new File([], file.name),
                name: file.name,
                size: file.size || 0,
                formattedSize: FileUploader.formatFileSize(file.size || 0),
                type: file.type || 'other',
                status: 'success',
                percentage: 100,
                url: file.url,
                response: file
            });
        });

        emit('change', uploadList.value);
    }
});

// 当上传列表变化时触发change事件
watch(uploadList, (newVal) => {
    emit('change', newVal);
}, { deep: true });

// 触发文件选择
const triggerFileInput = () => {
    if (props.disabled) return;
    fileInput.value?.click();
};

// 拖拽事件处理
const onDragover = () => {
    if (props.disabled) return;
    isDragover.value = true;
};

const onDragleave = () => {
    isDragover.value = false;
};

const onDrop = (e: DragEvent) => {
    if (props.disabled) return;
    isDragover.value = false;

    const files = e.dataTransfer?.files;
    if (files) {
        handleFiles(files);
    }
};

// 文件选择处理
const onFileInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
        handleFiles(target.files);
    }
    // 重置input，使其能够选择相同文件
    target.value = '';
};

// 处理文件
const handleFiles = (fileList: FileList) => {
    // 检查文件数量是否超过限制
    if (!isMultiple.value && uploadList.value.length >= 1) {
        ElMessage.warning('只能上传一个文件，请先移除现有文件');
        return;
    }

    if (isMultiple.value && uploadList.value.length + fileList.length > props.limit) {
        emit('exceed', props.limit);
        ElMessage.warning(`最多只能上传${props.limit}个文件`);
        return;
    }

    // 将FileList转换为数组处理
    Array.from(fileList).forEach(file => {
        // 检查文件大小
        if (file.size > props.maxSize * 1024 * 1024) {
            emit('exceed-size', file, props.maxSize);
            ElMessage.warning(`文件 ${file.name} 大小超过限制，最大允许${props.maxSize}MB`);
            return;
        }

        // 如果有自定义上传前检查
        if (props.beforeUpload) {
            const result = props.beforeUpload(file);
            if (result === false) {
                return;
            }
        }

        // 添加到上传列表
        uploadList.value.push({
            file,
            name: file.name,
            size: file.size,
            formattedSize: FileUploader.formatFileSize(file.size),
            type: FileUploader.getFileType(file),
            status: 'pending',
            percentage: 0
        });

        let uploadFile = uploadList.value[uploadList.value.length - 1];

        // 自动上传
        if (props.autoUpload) {
            uploadFile.status = 'uploading';
            uploadFile.percentage = 0;

            // 检查文件是否已存在
            if (props.checkExists) {
                checkFileExists(uploadFile);
            } else {
                uploadFile.status = 'uploading';
                uploadFile.percentage = 0;
                uploadFile.message = '';
                uploadFile.uploader = FileUploader.upload(uploadFile.file, {
                    path: props.path,
                    is_public: props.isPublic,
                    onProgress: (progress) => {
                        uploadFile.percentage = progress.percentage;
                    },
                    onSuccess: (result) => {
                        handleUploadSuccess(uploadFile, result);
                    },
                    onError: (error) => {
                        handleUploadError(uploadFile, error);
                    }
                });
            }
        }
    });
};

// 检查文件是否已存在
const checkFileExists = async (uploadFile: UploadFile) => {
    uploadFile.status = 'uploading';
    // 文件不存在，开始上传
    uploadFile.percentage = 0;
    uploadFile.message = '';
    uploadFile.uploader = FileUploader.upload(uploadFile.file, {
        path: props.path,
        is_public: props.isPublic,
        onProgress: (progress) => {
            uploadFile.percentage = progress.percentage;
        },
        onSuccess: (result) => {
            handleUploadSuccess(uploadFile, result);
        },
        onError: (error) => {
            handleUploadError(uploadFile, error);
        }
    });
};

// 上传成功处理
const handleUploadSuccess = (uploadFile: UploadFile, result: any) => {
    uploadFile.percentage = 100;
    uploadFile.status = 'success';
    uploadFile.response = result.file;
    uploadFile.url = result.file.url;

    emit('success', result.file, uploadFile);
    checkAllSuccess();
};

// 上传失败处理
const handleUploadError = (uploadFile: UploadFile, error: Error) => {
    uploadFile.status = 'error';
    uploadFile.message = error.message;

    emit('error', uploadFile, error);
};

// 检查是否所有文件都上传成功
const checkAllSuccess = () => {
    const allSuccess = uploadList.value.every(item => item.status === 'success');
    if (allSuccess && uploadList.value.length > 0) {
        emit('all-success', uploadList.value);
    }
};

// 手动上传单个文件
const uploadFile = (item: UploadFile) => {
    if (item.status === 'pending') {
        item.status = 'uploading';
        item.percentage = 0;
        item.message = '';

        // 检查文件是否已存在
        if (props.checkExists) {
            checkFileExists(item);
        } else {
            item.uploader = FileUploader.upload(item.file, {
                path: props.path,
                is_public: props.isPublic,
                onProgress: (progress) => {
                    item.percentage = progress.percentage;
                },
                onSuccess: (result) => {
                    handleUploadSuccess(item, result);
                },
                onError: (error) => {
                    handleUploadError(item, error);
                }
            });
        }
    }
};

// 重试上传
const retryUpload = (item: UploadFile) => {
    item.status = 'uploading';
    item.percentage = 0;
    item.message = '';

    item.uploader = FileUploader.upload(item.file, {
        path: props.path,
        is_public: props.isPublic,
        onProgress: (progress) => {
            item.percentage = progress.percentage;
        },
        onSuccess: (result) => {
            handleUploadSuccess(item, result);
        },
        onError: (error) => {
            handleUploadError(item, error);
        }
    });
};

// 移除文件
const removeFile = (index: number) => {
    const file = uploadList.value[index];

    // 取消上传中的请求
    if (file.status === 'uploading' && file.uploader) {
        file.uploader.abort();
    }

    uploadList.value.splice(index, 1);
    emit('remove', file);
};

// 预览文件
const onPreview = (item: UploadFile) => {
    if (item.status === 'success' && item.url) {
        currentPreview.value = item;
        previewVisible.value = true;
        emit('preview', item);
    }
};

// 关闭预览
const closePreview = () => {
    previewVisible.value = false;
    currentPreview.value = null;
};

// 下载文件
const downloadFile = (file: UploadFile) => {
    if (file.url) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// 进度条格式化
const formatPercentage = (percentage: number): string => {
    return `${percentage}%`;
};

// 提供给父组件的方法
defineExpose({
    // 清空文件列表
    clearFiles: () => {
        uploadList.value = [];
    },
    // 上传所有文件
    submit: () => {
        uploadList.value.forEach(item => {
            if (item.status === 'pending') {
                uploadFile(item);
            }
        });
    },
    // 获取文件列表
    getFiles: () => {
        return uploadList.value;
    },
    // 获取成功上传的文件
    getSuccessFiles: () => {
        return uploadList.value.filter(item => item.status === 'success');
    }
});
</script>

<style scoped>
.file-upload-container {
    width: 100%;
}

.upload-area {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    margin-bottom: 10px;
    padding: 20px;
    text-align: center;
}

.upload-area:hover {
    border-color: #409eff;
}

.upload-area.is-dragover {
    border-color: #409eff;
    background-color: rgba(64, 158, 255, 0.06);
}

.upload-area.is-disabled {
    cursor: not-allowed;
    background-color: #f5f7fa;
    border-color: #e4e7ed;
}

.file-input {
    display: none;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.upload-icon {
    font-size: 28px;
    color: #8c939d;
    margin-bottom: 8px;
}

.upload-text {
    color: #606266;
    font-size: 14px;
    line-height: 1.5;
}

.upload-text em {
    color: #409eff;
    font-style: normal;
}

.upload-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
}

.upload-list {
    margin-top: 16px;
}

.upload-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    padding: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    transition: all 0.3s;
}

.upload-item:hover {
    background-color: #f5f7fa;
}

.upload-item.is-error {
    border-color: #f56c6c;
    background-color: rgba(245, 108, 108, 0.06);
}

.upload-item-icon {
    margin-right: 10px;
    font-size: 24px;
    color: #909399;
}

.upload-item-content {
    flex: 1;
    overflow: hidden;
}

.upload-item-name {
    font-size: 14px;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 5px;
}

.upload-item-status {
    font-size: 12px;
    color: #909399;
}

.upload-progress {
    width: 100%;
}

.upload-success,
.upload-pending,
.upload-error {
    display: flex;
    align-items: center;
}

.file-size,
.error-message {
    margin-left: 8px;
}

.error-message {
    color: #f56c6c;
}

.upload-item-actions {
    display: flex;
    align-items: center;
    font-size: 18px;
    color: #909399;
}

.preview-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.image-preview {
    max-width: 100%;
    max-height: 70vh;
    display: flex;
    justify-content: center;
}

.image-preview img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
}

.video-preview {
    width: 100%;
    max-height: 70vh;
    display: flex;
    justify-content: center;
}

.video-preview video {
    max-width: 100%;
    max-height: 70vh;
}

.document-preview {
    padding: 20px;
    text-align: center;
}
</style>