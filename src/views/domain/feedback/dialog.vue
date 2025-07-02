<template>
    <div class="feedback-dialog-container">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="投诉者邮箱" prop="email">
                        <el-input v-model="form.email" placeholder="请输入投诉者邮箱" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="投诉者姓名" prop="name">
                        <el-input v-model="form.name" placeholder="请输入投诉者姓名" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="联系电话" prop="phone">
                        <el-input v-model="form.phone" placeholder="请输入联系电话" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="关联域名" prop="domain_id">
                        <el-select v-model="form.domain_id" placeholder="请选择域名" style="width: 100%">
                            <el-option v-for="item in domainOptions" :key="item.id" :label="item.domain"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="投诉内容" prop="content">
                <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入投诉内容" />
            </el-form-item>
            <el-form-item label="处理状态" prop="status">
                <el-radio-group v-model="form.status">
                    <el-radio :label="0">待处理</el-radio>
                    <el-radio :label="1">处理中</el-radio>
                    <el-radio :label="2">已解决</el-radio>
                    <el-radio :label="3">已关闭</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="其他信息">
                <el-row :gutter="10">
                    <el-col :span="8">
                        <el-input v-model="otherInfo.ip" placeholder="IP地址" />
                    </el-col>
                    <el-col :span="8">
                        <el-input v-model="otherInfo.browser" placeholder="浏览器" />
                    </el-col>
                    <el-col :span="8">
                        <el-input v-model="otherInfo.location" placeholder="地理位置" />
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item>
                <el-button @click="onCancel">取 消</el-button>
                <el-button type="primary" @click="onSubmit" :loading="loading">确 定</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts" name="feedbackDialog">
import { ref, reactive, onMounted, inject } from 'vue';
import { saveComplaint, getAllDomains } from '@/api/domain';
import { ElMessage } from 'element-plus';

const dialogInstance = inject('dialogInstance');

const props = defineProps({
    type: {
        type: String,
        default: 'add'
    },
    data: {
        type: Object,
        default: () => ({})
    }
});

const formRef = ref<any>();
const loading = ref(false);
const domainOptions = ref<any[]>([]);
const otherInfo = reactive({
    ip: '',
    browser: '',
    location: ''
});

// 邮箱格式验证
const validateEmail = (rule: any, value: string, callback: any) => {
    if (!value) {
        callback(new Error('请输入邮箱地址'));
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        callback(new Error('请输入有效的邮箱格式'));
        return;
    }
    callback();
};

// 手机号格式验证
const validatePhone = (rule: any, value: string, callback: any) => {
    if (value && !/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入有效的手机号码'));
        return;
    }
    callback();
};

// 表单校验规则
const rules = reactive<any>({
    email: [{ validator: validateEmail, trigger: 'blur' }],
    name: [{ required: true, message: '请输入投诉者姓名', trigger: 'blur' }],
    phone: [{ validator: validatePhone, trigger: 'blur' }],
    domain_id: [{ required: true, message: '请选择关联域名', trigger: 'change' }],
    content: [{ required: true, message: '请输入投诉内容', trigger: 'blur' }],
    status: [{ required: true, message: '请选择处理状态', trigger: 'change' }]
});

// 表单数据
const form = reactive({
    id: 0,
    domain_id: '',
    email: '',
    name: '',
    phone: '',
    content: '',
    other_info: {},
    status: 0
});

// 获取域名选项
const getDomainOptions = async () => {
    try {
        const res = await getAllDomains();
        domainOptions.value = res.data || [];
    } catch (error) {
        console.error('获取域名列表失败:', error);
    }
};

// 初始化表单数据
const initForm = (data?: any) => {
    if (data && data.id) {
        Object.assign(form, {
            id: data.id,
            domain_id: data.domain_id || '',
            email: data.email || '',
            name: data.name || '',
            phone: data.phone || '',
            content: data.content || '',
            status: data.status ?? 0
        });
        // 初始化其他信息
        if (data.other_info) {
            Object.assign(otherInfo, {
                ip: data.other_info.ip || '',
                browser: data.other_info.browser || '',
                location: data.other_info.location || ''
            });
        }
    } else {
        // 新增时重置表单
        Object.assign(form, {
            id: 0,
            domain_id: '',
            email: '',
            name: '',
            phone: '',
            content: '',
            other_info: {},
            status: 0
        });
        Object.assign(otherInfo, {
            ip: '',
            browser: '',
            location: ''
        });
    }
};

// 提交表单
const onSubmit = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            loading.value = true;
            try {
                // 组装其他信息
                form.other_info = {
                    ip: otherInfo.ip,
                    browser: otherInfo.browser,
                    location: otherInfo.location
                };
                await saveComplaint(form);
                ElMessage.success(form.id ? '投诉信息更新成功' : '投诉信息添加成功');
                (dialogInstance as any)?.$emit('success');
                onCancel();
            } catch (error) {
                console.error(error);
            } finally {
                loading.value = false;
            }
        }
    });
};

// 取消
const onCancel = () => {
    (dialogInstance as any)?.$close();
};

onMounted(() => {
    getDomainOptions();
    initForm(props.data);
});

</script>

<style scoped lang="scss">
.feedback-dialog-container {
    width: 700px;
    max-width: 100%;
}
</style>