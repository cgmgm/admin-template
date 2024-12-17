<template>
    <div class="add-info-container">
        <el-form ref="formRef" :model="state.form" :rules="state.rules" label-width="80px">
            <el-row :gutter="35">
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item label="用户昵称" prop="nickname">
                        <el-input v-model="state.form.nickname" placeholder="请输入用户昵称" />
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item label="归属部门" prop="deptId">
                        <el-cascader v-model="state.form.deptId" :options="treeData" :props="{
                            label: 'deptName',
                            value: 'deptId',
                            checkStrictly: true,
                            emitPath: false,
                        }" class="w100" clearable filterable placeholder="请选择归属部门"
                            :show-all-levels="false"></el-cascader>
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="state.form.username" placeholder="请输入用户名" :disabled="state.form.userId" />
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item v-if="state.form.userId == undefined" label="用户密码" prop="password">
                        <el-input v-model="state.form.password" placeholder="请输入用户密码" type="password" />
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item label="角色" prop="roleIds">
                        <el-select class="w100" v-model="state.form.roleIds" multiple collapse-tags="true"
                            placeholder="请选择">
                            <el-option v-for="item in state.roleOptions" :key="item.roleId" :label="item.roleName"
                                :value="item.roleId" :disabled="item.status == 1"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item label="商户角色" prop="merchantRoles">
                        <el-select class="w100" v-model="state.form.merchantRoles" multiple collapse-tags="true"
                            placeholder="请选择">
                            <el-option v-for="item in state.merchantRoleOptions" :key="item.roleId"
                                :label="item.roleName" :value="item.roleId" :disabled="item.status == 1"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-form-item label="所属商户" prop="merchantIds">
                        <el-select class="w100" v-model="state.form.merchantIds" multiple collapse-tags="true"
                            placeholder="请选择">
                            <el-option v-for="item in state.merchantOptions" :key="item.id"
                                :label="`${item.account}【${item.nickname}】`" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <el-form-item label="IP白名单" prop="whitelist">
                        <el-input v-model="state.form.whitelist" :rows="3" type="textarea"
                            placeholder="多个IP用换行分割，不输入表示不限制"></el-input>
                    </el-form-item>
                    <el-form-item label="备注" prop="remark">
                        <el-input v-model="state.form.remark" type="textarea" placeholder="请输入内容"></el-input>
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
import { getUserInfo, addUser } from '@/api'
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
        userId: undefined, // 用戶ID
        username: '', // 用戶名称
        nickname: '', // 用戶昵称
        deptId: '', // 部门ID
        password: '', // 用户密码
        remark: '', // 备注
        whitelist: '', // IP白名单
        roleIds: [],
        merchantRoles: [], // 商户系统角色
        merchantIds: [], // 商户
    },
    loading: false,
    // 角色选项
    roleOptions: <any>[],
    // 商户系统角色选项
    merchantRoleOptions: <any>[],
    // 商户选项
    merchantOptions: <any>[],
    rules: {
        username: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
        nickname: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
        password: [
            { required: true, message: '用户密码不能为空', trigger: 'blur' },
            { pattern: /^[a-zA-Z0-9]{6,16}$/, message: '用户密码长度应在6到16个字符之间', trigger: 'blur' }
        ],
        roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }],
    } as FormRules,
});
// 转为树状结构
const treeData = computed(() => handleTree(depts.value, 'deptId', 'parentId', 'children'))
onMounted(async () => {
    state.loading = true;
    const rows = await Promise.all([getRole(), getMerchanRole(), getMerchan()]);
    state.roleOptions = rows[0];
    state.merchantRoleOptions = rows[1];
    state.merchantOptions = rows[2];
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
            state.loading = true;
            const password = md5(state.form.password);
            await addUser({ ...state.form, password });
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