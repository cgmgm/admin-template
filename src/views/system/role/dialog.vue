<template>
	<div class="system-role-dialog-container">
		<el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
			<el-form-item label="角色名称" prop="name">
				<el-input v-model="form.name" placeholder="请输入角色名称" />
			</el-form-item>
			<el-form-item label="角色编码" prop="code">
				<el-input v-model="form.code" placeholder="请输入角色编码" />
			</el-form-item>
			<el-form-item label="描述" prop="description">
				<el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
			</el-form-item>
			<el-form-item label="菜单权限">
				<el-tree ref="treeRef" :data="menuList" show-checkbox node-key="id"
					:props="{ label: 'title', children: 'children' }" :default-checked-keys="checkedKeys" />
			</el-form-item>
			<el-form-item>
				<el-button @click="onCancel">取 消</el-button>
				<el-button type="primary" @click="onSubmit" :loading="loading">确 定</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts" name="systemRoleDialog">
import { ref, reactive, onMounted, inject } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { saveRole } from '@/api/system';
import { ElMessage } from 'element-plus';
import { useRoutesList } from '@/stores/routesList';
import { storeToRefs } from 'pinia';
import pinia from '@/stores/index';
import { i18n } from '@/i18n';
const stores = useRoutesList(pinia);
const { routesList } = storeToRefs(stores);


const handleRoutesList = (arr: any) => {
	arr.forEach((item: any) => {
		const key = item.meta?.title;
		item.title = i18n.global.te(key) ? i18n.global.t(key) : item.meta?.title;
		if (item.children && item.children.length > 0) {
			item.children = handleRoutesList(item.children);
		}
	});
	return arr;
}
// 获取菜单列表
const getMenus = async () => {
	try {
		menuList.value = handleRoutesList(routesList.value).filter((item: any) => item.id);
	} catch (error) {
		console.error(error);
	}
};
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
const treeRef = ref();
const loading = ref(false);
const menuList = ref<any[]>([]);
const checkedKeys = ref<number[]>([]);

// 表单校验规则
const rules = reactive<FormRules>({
	name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
	code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
});

// 表单数据
const form = reactive({
	id: '',
	name: '',
	code: '',
	description: '',
	menu_ids: [] as number[]
});

// 初始化表单数据
const initForm = (data?: any) => {
	if (data) {
		Object.assign(form, data);
		// 把父级菜单的id选中去了
		const d = data.menus.filter((item: any) => !data.menus.some((i: any) => i.parent_id === item.id));
		checkedKeys.value = d.map((item: any) => item.id);
	}
};

// 提交表单
const onSubmit = async () => {
	if (!formRef.value) return;
	await formRef.value.validate(async (valid) => {
		if (valid) {
			loading.value = true;
			try {
				// 获取选中的菜单ID
				form.menu_ids = treeRef.value.getCheckedKeys();
				await saveRole(form);
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
	getMenus();
	initForm(props.data);
});
</script>

<style scoped lang="scss">
.system-role-dialog-container {
	width: 600px;
	max-width: 100%;
}
</style>
