<template>
    <div class="file-check-container">
        <!-- 文件选择区域 -->
        <div class="upload-area" :class="{ 'is-dragover': isDragover }" @dragover.prevent="onDragover"
            @dragleave.prevent="onDragleave" @drop.prevent="onDrop" @click="triggerFileInput">
            <div class="upload-placeholder">
                <el-icon class="upload-icon">
                    <Upload />
                </el-icon>
                <div class="upload-text">
                    <p>将文件拖到此处，或<em>点击选择</em>文件</p>
                    <p class="upload-hint">文件将进行MD5计算来检查是否已存在</p>
                </div>
            </div>

            <!-- 隐藏的文件输入 -->
            <input ref="fileInput" type="file" class="file-input" @change="onFileInputChange">
        </div>

        <!-- 检查结果 -->
        <div v-if="checkResult" class="check-result">
            <div class="result-header">
                <el-alert :title="checkResult.exists ? '文件已存在' : '文件不存在'"
                    :type="checkResult.exists ? 'success' : 'info'"
                    :description="checkResult.exists ? '系统中已有相同内容的文件，可直接使用' : '该文件在系统中不存在，需要上传'" show-icon />
            </div>

            <div v-if="checkResult.exists && checkResult.file" class="file-info">
                <el-descriptions title="已存在的文件信息" :column="1" border>
                    <el-descriptions-item label="文件名">{{ checkResult.file.name }}</el-descriptions-item>
                    <el-descriptions-item label="文件路径">{{ checkResult.file.path }}</el-descriptions-item>
                    <el-descriptions-item label="文件地址">
                        <el-link type="primary" :href="checkResult.file.url" target="_blank">{{ checkResult.file.url
                        }}</el-link>
                    </el-descriptions-item>
                    <el-descriptions-item label="文件类型">{{ checkResult.file.type }}</el-descriptions-item>
                    <el-descriptions-item label="文件扩展名">{{ checkResult.file.extension }}</el-descriptions-item>
                </el-descriptions>

                <div class="action-buttons">
                    <el-button type="primary" @click="useExistingFile">使用已存在的文件</el-button>
                    <el-button @click="resetCheck">重新检查</el-button>
                </div>
            </div>

            <div v-else-if="!checkResult.exists" class="upload-actions">
                <el-button type="primary" @click="uploadNewFile">上传新文件</el-button>
                <el-button @click="resetCheck">重新检查</el-button>
            </div>
        </div>

        <!-- 检查中状态 -->
        <div v-if="isChecking && !checkResult" class="checking-status">
            <el-skeleton :rows="5" animated />
            <div class="checking-text">
                <el-icon class="is-loading">
                    <Loading />
                </el-icon>
                正在计算文件哈希值并检查是否存在...
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Upload, Loading } from '@element-plus/icons-vue';
import { checkFileExists } from '@/api/files';

const emit = defineEmits(['file-exists', 'upload-file', 'reset']);

// 文件输入和拖放状态
const fileInput = ref<HTMLInputElement | null>(null);
const isDragover = ref(false);
const isChecking = ref(false);
const currentFile = ref<File | null>(null);
const checkResult = ref<{ exists: boolean; file?: any } | null>(null);

// 触发文件选择
const triggerFileInput = () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};

// 处理文件输入变化
const onFileInputChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        handleFile(input.files[0]);
    }
};

// 拖拽相关事件处理
const onDragover = () => {
    isDragover.value = true;
};

const onDragleave = () => {
    isDragover.value = false;
};

const onDrop = (event: DragEvent) => {
    isDragover.value = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        handleFile(event.dataTransfer.files[0]);
    }
};

// 处理选中的文件
const handleFile = async (file: File) => {
    currentFile.value = file;
    isChecking.value = true;
    checkResult.value = null;

    try {
        const response = await checkFileExists({ md5: await calculateFileMd5(file) });
        if (response.code === 200) {
            checkResult.value = response.data;
            if (response.data.exists) {
                emit('file-exists', response.data.file);
            }
        } else {
            ElMessage.error(response.message || '检查文件失败');
        }
    } catch (error) {
        ElMessage.error('检查文件失败');
        console.error(error);
    } finally {
        isChecking.value = false;
    }
};

// 计算文件MD5
const calculateFileMd5 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = async function () {
            try {
                const arrayBuffer = reader.result as ArrayBuffer;
                const hashBuffer = await crypto.subtle.digest('MD5', arrayBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                resolve(hashHex);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = function () {
            reject(new Error('读取文件失败'));
        };
    });
};

// 使用已存在的文件
const useExistingFile = () => {
    if (checkResult.value && checkResult.value.exists && checkResult.value.file) {
        emit('file-exists', checkResult.value.file);
    }
};

// 上传新文件
const uploadNewFile = () => {
    if (currentFile.value) {
        emit('upload-file', currentFile.value);
    }
};

// 重置检查
const resetCheck = () => {
    currentFile.value = null;
    checkResult.value = null;
    isChecking.value = false;
    if (fileInput.value) {
        fileInput.value.value = '';
    }
    emit('reset');
};
</script>

<style scoped>
.file-check-container {
    padding: 20px;
}

.upload-area {
    border: 2px dashed var(--el-border-color);
    border-radius: 6px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
}

.upload-area:hover,
.upload-area.is-dragover {
    border-color: var(--el-color-primary);
    background-color: rgba(var(--el-color-primary-rgb), 0.05);
}

.upload-icon {
    font-size: 48px;
    color: var(--el-text-color-secondary);
    margin-bottom: 10px;
}

.upload-text {
    color: var(--el-text-color-regular);
}

.upload-text em {
    color: var(--el-color-primary);
    font-style: normal;
    font-weight: bold;
}

.upload-hint {
    font-size: 12px;
    margin-top: 5px;
    color: var(--el-text-color-secondary);
}

.file-input {
    display: none;
}

.check-result {
    margin-top: 20px;
}

.file-info {
    margin-top: 20px;
}

.action-buttons,
.upload-actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 10px;
}

.checking-status {
    margin-top: 20px;
}

.checking-text {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    color: var(--el-text-color-secondary);
}

.checking-text .el-icon {
    margin-right: 8px;
}
</style>