<template>
	<div class="system-dept-dialog-container">
		<el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
			<el-form-item label="上级部门">
				<el-tree-select v-model="form.parent_id" :data="deptList"
					:props="{ label: 'name', children: 'children', value: 'id' }" check-strictly placeholder="选择上级部门" />
			</el-form-item>
			<el-form-item label="部门名称" prop="name">
				<el-input v-model="form.name" placeholder="请输入部门名称" />
			</el-form-item>
			<el-form-item label="部门编码" prop="code">
				<el-input v-model="form.code" placeholder="请输入部门编码" />
			</el-form-item>
			<el-form-item label="负责人">
				<el-input v-model="form.leader" placeholder="请输入负责人" />
			</el-form-item>
			<el-form-item label="联系电话">
				<el-input v-model="form.phone" placeholder="请输入联系电话" />
			</el-form-item>
			<el-form-item label="邮箱">
				<el-input v-model="form.email" placeholder="请输入邮箱" />
			</el-form-item>
			<el-form-item label="显示排序" prop="sort">
				<el-input-number v-model="form.sort" controls-position="right" :min="0" />
			</el-form-item>
			<el-form-item label="部门状态">
				<el-radio-group v-model="form.status">
					<el-radio :label="1">正常</el-radio>
					<el-radio :label="0">停用</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item>
				<el-button @click="onCancel">取 消</el-button>
				<el-button type="primary" @click="onSubmit" :loading="loading">确 定</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts" name="systemDeptDialog">
import { ref, reactive, onMounted, inject } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { saveDepartment, getDepartments } from '@/api/system';
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

const formRef = ref<FormInstance>();
const loading = ref(false);
const deptList = ref<any[]>([]);

// 表单校验规则
const rules = reactive<FormRules>({
	name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
	code: [{ required: true, message: '请输入部门编码', trigger: 'blur' }],
	sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }]
});

// 表单数据
const form = reactive({
	id: '',
	parent_id: null,
	name: '',
	code: '',
	leader: '',
	phone: '',
	email: '',
	sort: 0,
	status: 1
});

// 初始化表单数据
const initForm = (data?: any) => {
	if (props.type === 'edit') {
		Object.assign(form, data);
	} else {
		if (data.id) {
			form.parent_id = data.id;
		}
	}
};

// 获取部门列表
const getDeptList = async () => {
	try {
		const res = await getDepartments({});
		deptList.value = res.data;
	} catch (error) {
		console.error(error);
	}
};

// 提交表单
const onSubmit = async () => {
	if (!formRef.value) return;
	await formRef.value.validate(async (valid) => {
		if (valid) {
			loading.value = true;
			try {
				await saveDepartment(form);
				ElMessage.success('保存成功');
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
	getDeptList();
	initForm(props.data);
});
</script>

<style scoped lang="scss">
.system-dept-dialog-container {
	width: 600px;
}
</style>
