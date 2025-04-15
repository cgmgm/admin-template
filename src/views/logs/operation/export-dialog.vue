<template>
    <el-dialog title="文件导出(可关闭后台下载)" v-model="visible" :close-on-click-modal="false" :close-on-press-escape="false"
        width="500px">
        <div class="export-dialog">
            <div class="export-message">
                <div class="message-text">
                    <p>{{ downloadStatus }}</p>
                    <p class="sub-text">{{ downloadSubStatus }}</p>
                </div>
            </div>
            <div class="export-progress" v-if="showProgress">
                <el-progress :percentage="progressPercentage" :format="progressFormat" :status="progressStatus" />
            </div>
            <div class="export-progress" v-if="downloadFailed">
                <el-alert title="下载失败，请尝试以下方式：" type="error" :closable="false" />
            </div>
            <div class="export-tip" v-if="downloadFailed">
                <p>{{ errorMessage }}</p>
            </div>
            <div class="export-actions">
                <template v-if="downloadSuccess">
                    <el-button type="primary" @click="closeDialog">完成</el-button>
                </template>
                <template v-else-if="downloadFailed">
                    <el-button-group>
                        <el-button type="primary" @click="retryDownload">重试</el-button>
                        <el-button @click="closeDialog">关闭</el-button>
                    </el-button-group>
                </template>
                <template v-else>
                    <el-button @click="closeDialog">取消</el-button>
                </template>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { FileDownloader } from '@/utils/FileDownloader';

const router = useRouter();

const props = defineProps({
    exportUrl: {
        type: String,
        required: true
    },
    params: {
        type: Object,
        default: () => ({})
    },
    method: {
        type: String,
        default: 'POST'
    }
});

const emit = defineEmits(['close']);

const visible = ref(true);
const downloadFailed = ref(false);
const downloadSuccess = ref(false);
const downloadInProgress = ref(false);
const progressValue = ref(0);
const showProgress = ref(false);
const errorMessage = ref('');
let downloader: { abort: () => void } | null = null;

// 下载状态文本
const downloadStatus = computed(() => {
    if (downloadSuccess.value) return '导出完成';
    if (downloadFailed.value) return '导出失败';
    if (downloadInProgress.value) return '正在导出中...';
    return '准备导出...';
});

// 下载子状态文本
const downloadSubStatus = computed(() => {
    if (downloadSuccess.value) return '文件已成功下载到您的设备';
    if (downloadFailed.value) return '导出失败，请重试';
    if (downloadInProgress.value) return '请耐心等待，不要关闭窗口';
    return '系统正在准备文件...';
});

// 进度条百分比
const progressPercentage = computed(() => {
    return Math.min(Math.max(0, progressValue.value), 100);
});

// 进度条状态
const progressStatus = computed(() => {
    if (downloadSuccess.value) return 'success';
    if (downloadFailed.value) return 'exception';
    return '';
});

// 进度条格式化
const progressFormat = (percentage: number) => {
    if (downloadSuccess.value) return '完成';
    if (downloadFailed.value) return '失败';
    return `${percentage}%`;
};

// 处理认证错误
const handleAuthError = () => {
    ElMessage.error('认证失败，请重新登录');

    // 跳转到登录页
    setTimeout(() => {
        router.push('/login');
    }, 1500);
};

// 下载文件
const downloadFile = () => {
    if (!props.exportUrl) return;

    downloadInProgress.value = true;
    showProgress.value = true;
    errorMessage.value = '';
    document.title = `准备导出... - 操作日志`;

    // 使用FileDownloader导出
    downloader = FileDownloader.download(props.exportUrl, {
        method: props.method as 'GET' | 'POST',
        params: { ...props.params, export: 1 },
        onProgress: (progress) => {
            // 更新进度条
            if (progress.lengthComputable || progress.percentage > 0) {
                progressValue.value = progress.percentage >= 0 ? progress.percentage : 50;
                document.title = `导出中(${progressValue.value}%) - 操作日志`;
            }
        },
        onSuccess: (blob, filename) => {
            // 下载成功处理
            downloadSuccess.value = true;
            downloadInProgress.value = false;
            document.title = '操作日志';
            ElMessage.success('文件导出成功，已下载到您的设备');

            // 3秒后自动关闭对话框
            setTimeout(() => {
                closeDialog();
            }, 3000);
        },
        onError: (error) => {
            // 下载失败处理
            downloadFailed.value = true;
            downloadInProgress.value = false;
            document.title = '操作日志';

            const errorMsg = error.message || '导出失败';
            errorMessage.value = errorMsg;

            // 检查是否是认证错误
            if (errorMsg.includes('Token') || errorMsg.includes('认证') || errorMsg.includes('401')) {
                handleAuthError();
            } else {
                ElMessage.error(errorMsg);
            }

            console.error('下载失败:', error);
        }
    });
};

// 重试下载
const retryDownload = () => {
    downloadFailed.value = false;
    downloadSuccess.value = false;
    progressValue.value = 0;
    errorMessage.value = '';
    downloadFile();
};

// 关闭对话框
const closeDialog = () => {
    visible.value = false;

    // 当对话框关闭后，如果下载仍在进行中，显示一个浮动消息提示用户
    if (downloadInProgress.value) {
        ElMessage.info('文件正在下载中，您可以继续其他操作');
    }

    emit('close');
};

// 取消下载
const cancelDownload = () => {
    if (downloader) {
        downloader.abort();
        downloader = null;
    }
};

// 组件挂载后自动下载
onMounted(() => {
    downloadFile();
});

// 组件卸载前清理
onUnmounted(() => {
    // 恢复原始标题
    document.title = '操作日志';

    // 如果下载还在进行，取消它
    cancelDownload();
});
</script>

<style scoped>
.export-dialog {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.export-message {
    display: flex;
    align-items: center;
    gap: 15px;
}

.export-icon {
    font-size: 24px;
    color: #409eff;
    animation: rotating 2s linear infinite;
}

.message-text {
    flex: 1;
}

.message-text p {
    margin: 0;
    line-height: 1.5;
}

.sub-text {
    font-size: 12px;
    color: #909399;
}

.export-progress {
    margin: 10px 0;
}

.export-tip {
    border-top: 1px dashed #e6e6e6;
    padding-top: 10px;
    font-size: 13px;
    color: #909399;
}

.export-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
}

@keyframes rotating {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>

<style>
/* 全局样式，用于通知中的进度条 */
.download-progress-bar {
    height: 6px;
    background-color: #e6e6e6;
    border-radius: 3px;
    overflow: hidden;
    margin: 8px 0;
}

.progress-inner {
    height: 100%;
    background-color: #409eff;
    transition: width 0.3s;
}

.progress-text {
    font-size: 12px;
    color: #909399;
    text-align: right;
}

.el-notification__content {
    text-align: left;
    margin: 0;
}

.el-progress__text {
    min-width: auto;
}
</style>