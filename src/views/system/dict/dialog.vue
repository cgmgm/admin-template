<template>
    <div class="system-dict-dialog-container">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-row :gutter="35">
                <el-col :span="24">
                    <el-form-item label="字典名称" prop="name">
                        <el-input v-model="form.name" placeholder="请输入字典名称" />
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="字典类型" prop="type">
                        <el-input v-model="form.type" placeholder="请输入字典类型，如sys_user_sex" :disabled="!!form.id" />
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="状态" prop="status">
                        <el-radio-group v-model="form.status">
                            <el-radio :label="1">启用</el-radio>
                            <el-radio :label="0">禁用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="描述" prop="description">
                        <el-input v-model="form.description" type="textarea" placeholder="请输入字典描述" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item>
                <el-button @click="onCancel">取 消</el-button>
                <el-button type="primary" @click="onSubmit" :loading="loading">确 定</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts" name="systemDictDialog">
import { ref, reactive, onMounted, inject } from 'vue';
import { ElMessage } from 'element-plus';
import { getDictDetail, saveDict } from '@/api/system';

const dialogInstance = inject('dialogInstance');

const props = defineProps({
    id: {
        type: [Number, String],
        default: undefined
    }
});

const formRef = ref();
const loading = ref(false);

// 表单校验规则
const rules = reactive({
    name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
    type: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
});

// 表单数据
const form = reactive({
    id: undefined,
    name: '',
    type: '',
    description: '',
    status: 1
});

// 初始化表单数据
const initForm = (data: any) => {
    if (data) {
        Object.assign(form, data);
    }
};

// 获取字典详情
const getDetail = async (id: number | string) => {
    loading.value = true;
    try {
        const res = await getDictDetail({ id });
        initForm(res.data);
    } catch (error) {
        console.error('获取字典详情失败', error);
    } finally {
        loading.value = false;
    }
};

// 提交表单
const onSubmit = async () => {
    if (!formRef.value) return;

    await formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            loading.value = true;
            try {
                const submitData = { ...form };
                await saveDict(submitData);
                (dialogInstance as any)?.$emit('success');
                onCancel();
            } catch (error) {
                console.error('保存失败', error);
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
    if (props.id) {
        getDetail(props.id);
    }
});
</script>

<style scoped lang="scss">
.system-dict-dialog-container {
    width: 600px;
    max-width: 100%;
}
</style>