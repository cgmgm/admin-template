<template>
    <div class="domain-dialog-container">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="域名" prop="domain">
                <el-input v-model="form.domain" placeholder="请输入域名，如：example.com" />
            </el-form-item>
            <el-form-item label="关键词" prop="keywords">
                <el-select v-model="form.keywords" multiple filterable allow-create default-first-option
                    placeholder="请输入关键词，回车添加" style="width: 100%">
                    <el-option v-for="item in keywordOptions" :key="item" :label="item" :value="item" />
                </el-select>
            </el-form-item>
            <el-form-item label="模板名称" prop="template_name">
                <el-input v-model="form.template_name" placeholder="请输入模板名称" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-radio-group v-model="form.status">
                    <el-radio :label="1">启用</el-radio>
                    <el-radio :label="0">禁用</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
            <el-form-item>
                <el-button @click="onCancel">取 消</el-button>
                <el-button type="primary" @click="onSubmit" :loading="loading">确 定</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts" name="domainDialog">
import { ref, reactive, onMounted, inject } from 'vue';
import { saveDomain } from '@/api/domain';
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
const keywordOptions = ref<string[]>([]);

// 域名格式验证
const validateDomain = (rule: any, value: string, callback: any) => {
    if (!value) {
        callback(new Error('请输入域名'));
        return;
    }
    // 简单的域名格式验证
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(value)) {
        callback(new Error('请输入有效的域名格式'));
        return;
    }
    callback();
};

// 表单校验规则
const rules = reactive<any>({
    domain: [{ validator: validateDomain, trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
});

// 表单数据
const form = reactive({
    id: 0,
    domain: '',
    keywords: [] as string[],
    status: 1,
    remark: '',
    template_name: ''
});

// 初始化表单数据
const initForm = (data?: any) => {
    if (data && data.id) {
        Object.assign(form, {
            id: data.id,
            domain: data.domain || '',
            keywords: data.keywords || [],
            status: data.status ?? 1,
            remark: data.remark || '',
            template_name: data.template_name || ''
        });
        // 将已有关键词添加到选项中
        if (data.keywords && Array.isArray(data.keywords)) {
            keywordOptions.value = [...new Set([...keywordOptions.value, ...data.keywords])];
        }
    } else {
        // 新增时重置表单
        Object.assign(form, {
            id: 0,
            domain: '',
            keywords: [],
            status: 1,
            remark: '',
            template_name: ''
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
                await saveDomain(form);
                ElMessage.success(form.id ? '域名更新成功' : '域名添加成功');
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
    initForm(props.data);
    console.log(props.data, 'props.data');
});
console.log(props.data, 'props.data');
console.log(props.data, 'props.data');
console.log(props.data, 'props.data');
console.log(props.data, 'props.data');

</script>

<style scoped lang="scss">
.domain-dialog-container {
    width: 500px;
    max-width: 100%;
}
</style>