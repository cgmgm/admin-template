<template>
    <div class="system-dict-data-dialog-container">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-row :gutter="35">
                <el-col :span="12">
                    <el-form-item label="字典编码" prop="code">
                        <el-input v-model="form.code" placeholder="请输入字典编码" :disabled="!!form.id" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="字典标签" prop="name">
                        <el-input v-model="form.name" placeholder="请输入字典标签" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="字典键值" prop="value">
                        <el-input v-model="form.value" placeholder="请输入字典键值" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="显示排序" prop="sort">
                        <el-input-number v-model="form.sort" :min="0" :max="999" controls-position="right" />
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
                    <el-form-item label="备注" prop="remark">
                        <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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

<script setup lang="ts" name="systemDictDataDialog">
import { ref, reactive, onMounted, inject } from 'vue';
import { ElMessage } from 'element-plus';
import { getDictDetail, saveDictItem, getDictItems } from '@/api/system';

const dialogInstance = inject('dialogInstance');

const props = defineProps({
    id: {
        type: [Number, String],
        default: undefined
    },
    dictId: {
        type: [Number, String],
        required: true
    }
});

const formRef = ref();
const loading = ref(false);

// 表单校验规则
const rules = reactive({
    code: [{ required: true, message: '请输入字典编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
    value: [{ required: true, message: '请输入字典键值', trigger: 'blur' }],
    sort: [{ required: true, message: '请输入显示排序', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
});

// 表单数据
const form = reactive({
    id: undefined,
    dict_id: undefined,
    code: '',
    name: '',
    value: '',
    sort: 0,
    status: 1,
    remark: ''
});

// 初始化表单数据
const initForm = (data?: any) => {
    form.dict_id = props.dictId;
    if (data) {
        Object.assign(form, data);
    }
};

// 获取字典项详情
const getDetail = async (items: any[], id: number | string) => {
    const item = items.find(item => item.id === Number(id));
    if (item) {
        initForm(item);
    } else {
        ElMessage.error('获取字典项详情失败');
        onCancel();
    }
};

// 获取字典和字典项
const getDictData = async () => {
    loading.value = true;
    try {
        // 获取字典详情，包含字典项列表
        const res = await getDictDetail({ id: props.dictId });
        if (props.id) {
            // 编辑模式，查找对应字典项
            await getDetail(res.data.items || [], props.id);
        } else {
            // 新增模式
            initForm();
        }
    } catch (error) {
        console.error('获取字典数据失败', error);
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
                // 更新字典项
                await saveDictItem(submitData);
                ElMessage.success('操作成功');
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
    getDictData();
});
</script>

<style scoped lang="scss">
.system-dict-data-dialog-container {
    width: 700px;
    max-width: 100%;
}
</style>