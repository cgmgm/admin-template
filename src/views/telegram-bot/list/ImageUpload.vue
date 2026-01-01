<template>
    <div class="image-upload-wrapper">
        <div v-if="modelValue" class="current-image">
            <el-image :src="getFullImageUrl(modelValue)" style="width: 150px; height: 150px;" fit="cover"
                :preview-src-list="[getFullImageUrl(modelValue)]" />
            <div class="image-actions">
                <el-button size="small" type="danger" @click="handleRemove">
                    删除图片
                </el-button>
            </div>
        </div>
        <FileUpload v-else :multiple="false" accept="image/*" :auto-upload="true" :max-size="5" :limit="1"
            placeholder="支持 JPG、PNG 格式，大小不超过 5MB" @success="handleSuccess" @error="handleError" />
    </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { ElMessage } from 'element-plus';

const FileUpload = defineAsyncComponent(() => import('@/components/upload/index.vue'));

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue']);

// 获取完整图片URL
const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return url;
};

// 上传成功回调
const handleSuccess = (file: any) => {
    if (file && file.url) {
        emit('update:modelValue', file.url);
        ElMessage.success('图片上传成功');
    }
};

// 上传失败回调
const handleError = (file: any, error: any) => {
    ElMessage.error('图片上传失败: ' + (error?.message || '未知错误'));
};

// 删除图片
const handleRemove = () => {
    emit('update:modelValue', '');
    ElMessage.success('图片已删除');
};
</script>

<style scoped lang="scss">
.image-upload-wrapper {
    .current-image {
        display: inline-block;

        .image-actions {
            margin-top: 10px;
            text-align: center;
        }
    }
}
</style>
