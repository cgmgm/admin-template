<template>
    <div class="file-download-container">
        <!-- 下载按钮 -->
        <slot name="trigger">
            <el-button type="primary" :disabled="props.disabled || downloading" @click="startDownload"
                :loading="downloading">
                <el-icon v-if="!downloading">
                    <Download />
                </el-icon>
                {{ downloading ? props.downloadingText : props.buttonText }}
            </el-button>
        </slot>

        <!-- 提示文本 -->
        <div v-if="props.tip" class="download-tip">{{ props.tip }}</div>

        <!-- 进度条 -->
        <div v-if="props.showProgress && downloading" class="download-progress">
            <el-progress :percentage="progressValue" :format="percentageFormatter" :status="progressStatus">
            </el-progress>
            <div class="progress-text">{{ progressText }}</div>
        </div>

        <!-- 下载结果 -->
        <div v-if="props.showResult && !downloading && (downloadSuccess || downloadFailed)" class="download-result">
            <div v-if="downloadSuccess" class="success-message">
                <el-icon>
                    <CircleCheckFilled />
                </el-icon>
                {{ props.successMessage }}
            </div>
            <div v-if="downloadFailed" class="error-message">
                <el-icon>
                    <CircleCloseFilled />
                </el-icon>
                {{ errorMessage || '下载失败' }}
                <el-button type="primary" link @click="startDownload">重试</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="FileDownload">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Download, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue';
import FileDownloader from '@/utils/FileDownloader';

// 组件属性
const props = defineProps({
    // 下载URL
    url: {
        type: String,
        required: true
    },
    // 请求方法
    method: {
        type: String,
        default: 'GET'
    },
    // 请求参数
    params: {
        type: Object,
        default: () => ({})
    },
    // 请求体数据
    data: {
        type: Object,
        default: null
    },
    // 按钮文本
    buttonText: {
        type: String,
        default: '下载文件'
    },
    // 下载中文本
    downloadingText: {
        type: String,
        default: '下载中...'
    },
    // 是否显示进度条
    showProgress: {
        type: Boolean,
        default: true
    },
    // 是否显示结果
    showResult: {
        type: Boolean,
        default: true
    },
    // 是否禁用
    disabled: {
        type: Boolean,
        default: false
    },
    // 提示文本
    tip: {
        type: String,
        default: ''
    },
    // 成功消息
    successMessage: {
        type: String,
        default: '文件下载成功'
    }
});

// 事件
const emit = defineEmits([
    'start',     // 开始下载
    'progress',  // 下载进度
    'success',   // 下载成功
    'error',     // 下载失败
    'cancel'     // 取消下载
]);

// 响应式状态
const downloading = ref(false);
const progressValue = ref(0);
const downloadSuccess = ref(false);
const downloadFailed = ref(false);
const errorMessage = ref('');
let downloader: any = null;

// 格式化进度百分比
const percentageFormatter = (percentage: number) => {
    return `${percentage}%`;
};

// 计算属性
const progressStatus = computed(() => {
    if (downloadFailed.value) return 'exception';
    if (downloadSuccess.value) return 'success';
    return '';
});

const progressText = computed(() => {
    if (downloadFailed.value) return '下载失败';
    if (downloadSuccess.value) return '下载完成';
    return `下载中: ${progressValue.value}%`;
});

// 开始下载
const startDownload = () => {
    if (downloading.value || props.disabled) return;

    // 重置状态
    downloading.value = true;
    progressValue.value = 0;
    downloadSuccess.value = false;
    downloadFailed.value = false;
    errorMessage.value = '';

    emit('start');

    // 使用FileDownloader下载文件
    downloader = FileDownloader.download(props.url, {
        method: props.method as 'GET' | 'POST',
        params: props.params,
        data: props.data,
        onProgress: (progress) => {
            // 更新进度条
            if (progress.lengthComputable || progress.percentage > 0) {
                progressValue.value = progress.percentage >= 0 ? progress.percentage : 50;
                emit('progress', progress);
            }
        },
        onSuccess: (blob, filename) => {
            // 下载成功处理
            downloading.value = false;
            downloadSuccess.value = true;
            progressValue.value = 100;

            ElMessage.success(props.successMessage);
            emit('success', { blob, filename });
        },
        onError: (error) => {
            // 下载失败处理
            downloading.value = false;
            downloadFailed.value = true;
            errorMessage.value = error.message || '下载失败';

            ElMessage.error(errorMessage.value);
            emit('error', error);
        }
    });
};

// 取消下载
const cancelDownload = () => {
    if (!downloading.value || !downloader) return;

    downloader.abort();
    downloading.value = false;
    downloadFailed.value = true;
    errorMessage.value = '下载已取消';

    emit('cancel');
};

// 提供给父组件的方法
defineExpose({
    startDownload,
    cancelDownload,
    isDownloading: () => downloading.value
});
</script>

<style scoped>
.file-download-container {
    width: 100%;
}

.download-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
}

.download-progress {
    margin-top: 16px;
}

.progress-text {
    margin-top: 8px;
    font-size: 12px;
    color: #606266;
    text-align: center;
}

.download-result {
    margin-top: 16px;
}

.success-message {
    display: flex;
    align-items: center;
    color: #67c23a;
    font-size: 14px;
}

.error-message {
    display: flex;
    align-items: center;
    color: #f56c6c;
    font-size: 14px;
}

.success-message .el-icon,
.error-message .el-icon {
    margin-right: 8px;
    font-size: 16px;
}
</style>