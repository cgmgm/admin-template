<template>
    <div class="add-info-container">
        <el-form ref="formRef" :model="state.form" :rules="state.rules" label-width="120px" class="mt35 mb35">
            <el-row :gutter="35">
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
                    <el-form-item label="采样点名称" prop="name">
                        <el-input v-model="state.form.name" placeholder="请输入应检尽检核酸采样点名称" clearable />
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
                    <el-form-item label="详细地址" prop="address">
                        <el-input v-model="state.form.address" placeholder="请输入详细地址" clearable />
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
                    <el-form-item label="联系电话" prop="phone">
                        <el-input v-model="state.form.phone" placeholder="请输入联系电话" clearable />
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
                    <el-form-item label="开放时间" prop="time">
                        <el-input v-model="state.form.time" placeholder="请输入开放时间" clearable />
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
                    <el-form-item label="图片描述" prop="image">
                        <el-upload class="avatar-uploader" :show-file-list="false" :before-upload="onBeforeUpload"
                            :on-success="onUploadSuccess">
                            <img v-if="state.form.image" :src="state.form.image" class="avatar" />
                            <el-icon v-else class="avatar-uploader-icon">
                                <Plus />
                            </el-icon>
                        </el-upload>
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
                    <el-form-item label="是否支持" prop="isSupport">
                        <el-switch v-model="state.form.isSupport" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item>
                <el-button type="primary" @click="onSubmit(formRef)">提交</el-button>
                <el-button @click="cancel">返回</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts" name="makeTableDemoAddInfo">
import { reactive, ref, inject } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 定义变量内容
const formRef = ref<FormInstance>();
const dialogInstance = inject('dialogInstance');
const state = reactive({
    form: {
        name: '',
        address: '',
        phone: '',
        time: '',
        image: '',
        isSupport: false,
    },
    rules: {
        name: [{ required: true, message: '请输入采样点名称', trigger: 'blur' }],
        address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
        phone: [
            { required: true, message: '请输入联系电话', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        time: [{ required: true, message: '请输入开放时间', trigger: 'blur' }],
    } as FormRules,
});

// 图片上传前的验证
const onBeforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
        ElMessage.error('上传图片只能是图片格式!');
        return false;
    }
    if (!isLt2M) {
        ElMessage.error('上传图片大小不能超过 2MB!');
        return false;
    }
    return true;
};

// 图片上传成功的回调
const onUploadSuccess = (response: any) => {
    state.form.image = response.url; // 假设后端返回的数据中包含 url 字段
};

// 表单提交
const onSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate((valid: boolean) => {
        if (valid) {
            console.log('submit!', state.form);
            ElMessage.success('提交成功！');
            // 可以发射任意自定义事件
            (dialogInstance as any)?.$emit('success', state.form);
            // 发射完成后关闭
            cancel();
        }
    });
};

// 返回列表页
const cancel = () => {
    (dialogInstance as any)?.$close();
};
</script>

<style scoped lang="scss">
.add-info-container {
    padding: 15px;
    width: 800px;

    .avatar-uploader {
        :deep(.el-upload) {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);

            &:hover {
                border-color: var(--el-color-primary);
            }
        }
    }

    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 100px;
        height: 100px;
        text-align: center;
        line-height: 100px;
    }

    .avatar {
        width: 100px;
        height: 100px;
        display: block;
    }
}
</style>
