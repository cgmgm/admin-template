<template>
	<div class="system-menu-dialog-container">
		<el-form ref="menuDialogFormRef" :model="state.ruleForm" size="default" label-width="80px">
			<el-row :gutter="35">
				<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
					<el-form-item label="上级菜单">
						<el-cascader :options="state.menuData"
							:props="{ checkStrictly: true, value: 'path', label: 'title' }" placeholder="请选择上级菜单"
							clearable class="w100" v-model="state.ruleForm.menuSuperior">
							<template #default="{ node, data }">
								<span>{{ data.title }}</span>
								<span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
							</template>
						</el-cascader>
					</el-form-item>
				</el-col>
				<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
					<el-form-item label="菜单类型">
						<el-radio-group v-model="state.ruleForm.type">
							<el-radio label="menu">菜单</el-radio>
							<el-radio label="button">按钮</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
				<template v-if="state.ruleForm.type === 'button'">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="权限名称">
							<el-input v-model="state.ruleForm.name" placeholder="路由中的 name 值" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="权限标识">
							<el-input v-model="state.ruleForm.path" placeholder="权限标识" clearable></el-input>
						</el-form-item>
					</el-col>
				</template>
				<template v-if="state.ruleForm.type === 'menu'">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="菜单名称">
							<el-input v-model="state.ruleForm.meta.title" placeholder="格式：message.router.xxx"
								clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="路由名称">
							<el-input v-model="state.ruleForm.name" placeholder="路由中的 name 值" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="路由路径">
							<el-input v-model="state.ruleForm.path" placeholder="路由中的 path 值" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="重定向">
							<el-input v-model="state.ruleForm.redirect" placeholder="请输入路由重定向" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="菜单图标">
							<IconSelector placeholder="请输入菜单图标" v-model="state.ruleForm.meta.icon" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="组件路径">
							<el-input v-model="state.ruleForm.component" placeholder="组件路径" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="链接地址">
							<el-input v-model="state.ruleForm.meta.isLink" placeholder="外链/内嵌时链接地址（http:xxx.com）"
								clearable :disabled="!state.ruleForm.isLink">
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="菜单排序">
							<el-input-number v-model="state.ruleForm.sort" controls-position="right" placeholder="请输入排序"
								class="w100" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="是否隐藏">
							<el-radio-group v-model="state.ruleForm.meta.isHide">
								<el-radio :label="true">隐藏</el-radio>
								<el-radio :label="false">不隐藏</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="页面缓存">
							<el-radio-group v-model="state.ruleForm.meta.isKeepAlive">
								<el-radio :label="true">缓存</el-radio>
								<el-radio :label="false">不缓存</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="是否固定">
							<el-radio-group v-model="state.ruleForm.meta.isAffix">
								<el-radio :label="true">固定</el-radio>
								<el-radio :label="false">不固定</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="是否外链">
							<el-radio-group v-model="state.ruleForm.isLink" :disabled="state.ruleForm.meta.isIframe">
								<el-radio :label="true">是</el-radio>
								<el-radio :label="false">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<el-form-item label="是否内嵌">
							<el-radio-group v-model="state.ruleForm.meta.isIframe" @change="onSelectIframeChange">
								<el-radio :label="true">是</el-radio>
								<el-radio :label="false">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
				</template>
				<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
					<el-form-item class="mt20">
						<el-button @click="onCancel">取 消</el-button>
						<el-button type="primary" @click="onSubmit" :loading="state.loading">提交</el-button>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script setup lang="ts" name="systemMenuDialog">
import { defineAsyncComponent, reactive, onMounted, ref, nextTick, inject } from 'vue';
import { i18n } from '@/i18n/index';
import { saveMenu } from '@/api/system';
import { ElMessage } from 'element-plus';
import { initBackEndControlRoutes } from '@/router/backEnd';
import { useRoutesList } from '@/stores/routesList';
import pinia from '@/stores/index';


const dialogInstance = inject('dialogInstance');

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);
const props = defineProps({
	data: {
		type: Object,
		default: {},
	},
	routesList: {
		type: Array,
		default: [],
	},
	type: {
		type: String,
		default: 'add',
	},
});
// 引入组件
const IconSelector = defineAsyncComponent(() => import('@/components/svgIcon/selector.vue'));

// 定义初始表单数据
const initialFormState = {
	menuSuperior: [] as any, // 上级菜单
	type: 'menu', // 菜单类型
	name: '', // 路由名称
	component: '', // 组件路径
	isLink: false, // 是否外链
	sort: 0, // 菜单排序
	path: '', // 路由路径
	redirect: '', // 路由重定向
	meta: {
		title: '', // 菜单名称
		icon: '', // 菜单图标
		isHide: false, // 是否隐藏
		isKeepAlive: true, // 是否缓存
		isAffix: false, // 是否固定
		isLink: '', // 外链/内嵌时链接地址
		isIframe: false, // 是否内嵌
	},
};

// 定义变量内容
const menuDialogFormRef = ref();
const state = reactive({
	ruleForm: { ...initialFormState }, // 使用初始值的拷贝
	menuData: [] as any,
	loading: false,
});

// 添加一个通过 path 查找菜单 ID 的函数
const findMenuIdByPath = (path: string, menus: any[]): string | null => {
	for (const menu of menus) {
		if (menu.path === path) {
			return menu.id;
		}
		if (menu.children && menu.children.length > 0) {
			const id = findMenuIdByPath(path, menu.children);
			if (id) return id;
		}
	}
	return null;
};

// 获取 pinia 中的路由
const getMenuData = (routes: any) => {
	const arr: any[] = [];
	routes.map((val: any) => {
		const item = { ...val };
		item.title = i18n.global.t(item.meta?.title as string);
		arr.push(item);
		if (item.children && item.children.length > 0) {
			item.children = getMenuData(item.children);
		}
	});
	return arr;
};
const storesRoutesList = useRoutesList(pinia);
// 通过pid查找父级路径
const findParentPath = (parentId: number | string, arr: any[] = []): any[] => {
	if (!parentId) return arr;
	const parent = storesRoutesList.backEndRoutes.find((val: any) => val.id === parentId);
	if (parent) {
		arr.unshift(parent.path);
		return findParentPath(parent.parent_id, arr);
	}
	return arr;
}
// 打开弹窗
const openDialog = (type: string, row?: any) => {
	if (type === 'edit') {
		// 编辑模式时，只覆盖传入的字段，保留其他默认值
		Object.assign(state.ruleForm, row);
		// 如果 meta 为空，则赋值为初始值
		if (!state.ruleForm.meta) state.ruleForm.meta = initialFormState.meta;
		// 如果 meta 为字符串，则转换为对象
		if (typeof state.ruleForm.meta == 'string') state.ruleForm.meta = JSON.parse(state.ruleForm.meta);

		let menuSuperior: any[] = [];
		menuSuperior = findParentPath(row.parent_id);
		state.ruleForm.menuSuperior = menuSuperior;
	} else {
		if (row?.path) {
			let menuSuperior: any[] = [];
			let path = '';
			row.path.split('/').forEach((e: any) => {
				if (!e) return;
				path += '/' + e;
				menuSuperior.push(path);
			});
			state.ruleForm.menuSuperior = menuSuperior;
		}
	}
};
// 是否内嵌下拉改变
const onSelectIframeChange = () => {
	if (state.ruleForm.meta.isIframe) state.ruleForm.isLink = true;
	else state.ruleForm.isLink = false;
};
// 取消
const onCancel = () => {
	(dialogInstance as any)?.$close();
};
// 提交
const onSubmit = async () => {
	state.loading = true;
	// 获取最后一个路径对应的菜单 ID 作为 parent_id
	let parent_id = null;
	if (state.ruleForm.menuSuperior && state.ruleForm.menuSuperior.length > 0) {
		const parentPath = state.ruleForm.menuSuperior[state.ruleForm.menuSuperior.length - 1];
		parent_id = findMenuIdByPath(parentPath, state.menuData);
	}
	// 构建提交的数据
	const submitData = {
		...state.ruleForm,
		parent_id,
	};
	delete submitData.menuSuperior; // 删除 menuSuperior 字段
	if (state.ruleForm.type === 'button') {
		submitData.meta.isHide = true;
		submitData.meta.title = state.ruleForm.name;
	}
	try {
		// TODO: 调用保存接口
		const res = await saveMenu(submitData);
		initBackEndControlRoutes();
		onCancel(); // 关闭弹窗
		ElMessage.success('保存成功');
		(dialogInstance as any)?.$emit('success');
	} catch (error) {
		console.log(error);
	} finally {
		state.loading = false;
	}
};
const handleRoutesList = (arr: any) => {
	arr.forEach((item: any) => {
		if (typeof item.meta == 'string') item.meta = JSON.parse(item.meta);
		item.title = i18n.global.t(item.meta?.title as string);
		if (item.children && item.children.length > 0) {
			item.children = handleRoutesList(item.children);
		}
	});
	return arr;
}
// 页面加载时
onMounted(() => {
	state.menuData = handleRoutesList(JSON.parse(JSON.stringify(props.routesList)));
	openDialog(props.type, props.data);
});

// 暴露变量
defineExpose({
	openDialog,
});
</script>
<style scoped lang="scss">
.system-menu-dialog-container {
	width: 900px;
	max-width: 100%;
}
</style>
