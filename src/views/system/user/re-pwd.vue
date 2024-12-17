<template>
    <div class="add-info-container">
        <el-form ref="formRef" :model="state.form" :rules="state.rules" label-width="120px">
            <el-row :gutter="35">
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="state.form.username" placeholder="请输入用户名" :disabled="true" />
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item label="用户昵称" prop="nickname">
                        <el-input v-model="state.form.nickname" placeholder="请输入用户昵称" :disabled="true" />
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <el-form-item label="新密码" prop="password">
                        <el-input v-model="state.form.password" placeholder="请输入新密码" type="password" autocomplete="off"
                            style="width: 300px" />
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <el-form-item label="确认新密码" prop="repassword">
                        <el-input v-model="state.form.repassword" placeholder="请输入确认新密码" type="password"
                            autocomplete="off" style="width: 300px" />
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <el-form-item class="mt20">
                        <el-button @click="cancel">取 消</el-button>
                        <el-button type="primary" @click="onSubmit(formRef)" :loading="state.loading">提交</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, inject, computed, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { getUserInfo, resetpwd } from '@/api'
import { ElMessage } from 'element-plus';
import { handleTree } from '@/utils';
import { md5 } from "js-md5";
import { useCat } from '@/mixins/useStore';
const { depts, getRole, getMerchanRole, getMerchan } = useCat();
// 定义变量内容
const formRef = ref<FormInstance>();
const dialogInstance = inject('dialogInstance');

const props = defineProps({
    id: {
        type: Number,
        default: undefined,
    },
});
const state = reactive({
    form: {
        userId: props.id, // 用戶ID
        username: '', // 用戶名称
        nickname: '', // 用戶昵称
        password: '', // 用户密码
        repassword: '', // 备注
    },
    loading: false,
    rules: {
        username: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
        nickname: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
        password: [
            { required: true, message: '用户密码不能为空', trigger: 'blur' },
            { pattern: /^[a-zA-Z0-9]{6,16}$/, message: '用户密码长度应在6到16个字符之间', trigger: 'blur' }
        ],
        repassword: [
            { required: true, message: '确认新密码不能为空', trigger: 'blur' },
            {
                required: true, validator: (rule, value, callback) => {
                    if (state.form.password !== value) {
                        callback(new Error("两次输入的密码不一致"));
                    } else {
                        callback();
                    }
                }, trigger: "blur",
            },
        ],
    } as FormRules,
});
// 转为树状结构
onMounted(async () => {
    state.loading = true;
    if (props.id) {
        const { data } = await getUserInfo({ id: props.id });
        state.form = data;
    }
    state.loading = false;
})

// 表单提交
const onSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate(async (valid: boolean) => {
        if (valid) {
            if (!state.form.userId) {
                ElMessage.success('操作异常');
                return cancel();
            }
            state.loading = true;
            const password = md5(state.form.password);
            const repassword = md5(state.form.repassword)
            await resetpwd({ ...state.form, password, repassword });
            state.loading = false;
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

}
</style>