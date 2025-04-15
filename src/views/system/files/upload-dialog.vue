<template>
    <div class="upload-dialog-container">
        <el-tabs v-model="activeTab">
            <el-tab-pane label="文件上传" name="upload">
                <upload ref="fileUploadRef" :action="uploadAction" :multiple="true" :auto-upload="false" :max-size="50"
                    @success="onUploadSuccess" />
                <div class="action-buttons">
                    <el-button @click="$emit('cancel')">取消</el-button>
                    <el-button type="primary" @click="submitUpload">
                        确认上传
                    </el-button>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { ElMessage } from 'element-plus';

const upload = defineAsyncComponent(() => import('@/components/upload/index.vue'));

// 定义事件
const emit = defineEmits(['success', 'cancel']);

// 标签页控制
const activeTab = ref('upload');
const fileUploadRef = ref<any>(null);

// 获取上传地址
const uploadAction = import.meta.env.VITE_APP_BASE_API + '/admin/files/upload';

// 提交上传
const submitUpload = () => {
    if (fileUploadRef.value) {
        fileUploadRef.value.submit();
    }
};

// 上传成功回调
const onUploadSuccess = (files: any) => {
    emit('success', files);
    ElMessage.success('上传成功');
};

// 文件已存在回调
const onFileExists = (file: any) => {
    emit('success', [file]);
    ElMessage.success('已使用现有文件');
};

// 上传新文件回调
const onUploadFile = (file: File) => {
    if (fileUploadRef.value) {
        fileUploadRef.value.addFile(file);
        activeTab.value = 'upload';
    }
};
</script>

<style scoped>
.upload-dialog-container {
    padding: 20px;
}

.action-buttons {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>