<template>
	<div class="container layout-pd">
		<el-row :gutter="20" class="w100 h100" style="flex:1;">
			<!--部门数据-->
			<el-col :span="4" :xs="24">
				<div style="height: 100%;background: var(--el-fill-color-blank);padding:5px;">
					<div class="head-container">
						<el-input v-model="deptName" placeholder="请输入部门名称" clearable :prefix-icon="Search"
							style="margin-bottom: 20px" />
					</div>
					<div class="head-container">
						<el-tree :data="treeData" :props="{ children: 'children', label: 'name' }" node-key="id"
							:expand-on-click-node="false" :filter-node-method="filterNode" ref="tree" default-expand-all
							@node-click="handleNodeClick" />
					</div>
				</div>
			</el-col>

			<el-col :span="20" :xs="24">
				<Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData" @selectionChange="selectionChange"
					@valueChange="valueChange">
					<template #orBut>
						<!-- 自定义按钮插槽 -->
						<el-button type="primary" plain @click="handleBack.add" v-auth="'保存用户'">
							新增
						</el-button>
					</template>
				</Table>
			</el-col>
		</el-row>
	</div>
</template>
<script setup lang="tsx" name="systemuser">
import { defineAsyncComponent, reactive, ref, computed, watch } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createActionColumn } from '@/components/table/template';
import type { TableData } from '@/components/table/types';
import { useCat } from '@/mixins/useStore'
import { ElMessage, ElMessageBox, ElImage, ElTag } from 'element-plus'
import { letterAvatar } from '@/utils/index';
import { handleTree } from '@/utils';
import { Search } from '@element-plus/icons-vue';
import dialog from './dialog.vue';
import rePwd from './re-pwd.vue';
import watchQrcord from './watch-qrcode.vue';
import { getAdmin as getList, delAdmin as del } from '@/api/system';
// 引入组件
const Table = defineAsyncComponent(() => import('@/components/table/index.vue'));
const { store } = useCat();

const handleBack = {
	add: () => {
		openDialog();
	},
	edit: (e: any) => {
		openDialog(e.id);
	},
	rePwd: (e: any) => {
		console.log(e);
		(window as any).$dialog('重置密码', rePwd, { id: e.id });
	},
	delete: (e?: any) => {
		del({ id: e.id }).then(() => {
			getTableData(queryParams);
			ElMessage.success('删除成功');
		});
	},
	showgacode: (e: any) => {
		(window as any).$dialog('谷歌二维码', watchQrcord, { data: e });
	},
}

const handleDelete = () => {
	const aId = selectList.value;
	ElMessageBox({
		message: '是否确认删除用户编号为"' + aId + '"的数据项?',
		title: '警告',
		showCancelButton: true,
		confirmButtonText: '确定',
		cancelButtonText: '取消',
	}).then(function () {
		return del({ id: aId }).then(() => {
			getTableData(queryParams);
			ElMessage.success('删除成功');
		});
	});
}
const actionBack = (item: any, row: any) => {
	handleBack[item.key as keyof typeof handleBack]?.(row);
}
// 转为树状结构
const treeData = computed(() => handleTree(store.depts, 'id', 'parent_id', 'children'))

// 过滤筛选
const tree = ref();
const deptName = ref('');
watch(
	() => deptName.value,
	(newValue) => {
		tree.value.filter(newValue);
	}
);
const selectList = ref();
const selectionChange = (val: any) => {
	selectList.value = val.map((item: any) => item.aId);
}
const state = reactive<{ tableData: TableData }>({
	tableData: createTableConfig({
		columns: [
			createColumn('用户编号', 'id', { width: 100 }),
			createColumn('用户名', 'username', { width: 150 }),
			createColumn('用户头像', 'avatar', {
				width: 100,
				template: row => {
					return <ElImage
						style={{ width: '50px', height: '50px', borderRadius: '50%' }}
						src={row.avatar || letterAvatar(row.username)}
					/>
				}
			}),
			createColumn('用户昵称', 'real_name', { width: 150 }),
			createColumn('归属部门', 'dept_name', { template: row => <span>{row.department?.name || '-'}</span> }),
			createColumn('角色', 'roles', {
				template: row => {
					return <span>{row.roles.map((item: any) => item.name).join(',')}</span>
				}
			}),
			createColumn('状态', 'status', { type: 'switch', activeValue: 0, inactiveValue: 1, activeText: '正常', inactiveText: '禁止' }),
			createColumn('谷歌验证码开关', 'parent_id', { type: 'switch', activeText: '开', inactiveText: '关' }),
			createColumn('创建时间', 'created_at'),
			createActionColumn([
				{ key: 'edit', text: '修改', onClick: actionBack, auth: '保存用户', icon: 'Edit' },
				{ key: 'rePwd', text: '重置密码', onClick: actionBack, auth: '保存用户', icon: 'Edit' },
				{ key: 'delete', text: '删除', onClick: actionBack, poptext: '是否确认删除？', auth: '删除用户', icon: 'Delete' },
				{ key: 'showgacode', text: '查看二维码', onClick: actionBack, icon: 'Edit' }
			]),

		],
		search: [
			// 在此定义搜索项
			createSearchItem('用户名', 'username', 'input', {
				placeholder: '用户名模糊查询'
			}),
			createSearchItem('用户昵称', 'nickname', 'input', {
				placeholder: '请输入用户昵称'
			}),
			createSearchItem('状态', 'status', 'select', {
				placeholder: '用户状态',
				optionKey: 'sys_normal_disable'
			}),
			createSearchItem('名称', 'name', 'datetimerange', { placeholder: '请输入名称' })
		],
		config: {
			isSelection: true
		}
	}),
});
const valueChange = (row: any, prop: string, value: any, type: string) => {
	console.log(row, prop, value, type)
}
let queryParams = {} as any;
// 节点单击事件
const handleNodeClick = (data: any) => {
	queryParams.dept_id = data.id;
	getTableData(queryParams);
	queryParams.dept_id = 0;
};
const openDialog = (id?: number) => {
	(window as any).$dialog(id ? '编辑' : '添加', dialog, { id })
		.$on('success', (e: any) => {
			getTableData(queryParams);
		})
};
// 获取表格数据
const getTableData = async (e: any) => {
	queryParams = e;
	state.tableData.config.loading = true;
	// 在此处添加获取数据的逻辑
	const row = await getList(e);
	state.tableData.data = row.data.list; // 设置实际数据
	state.tableData.config.total = row.data.total; // 设置数据总数
	state.tableData.config.loading = false;
};

// 筛选节点
const filterNode = (value: string, data: any) => {
	if (!value) return true;
	return data.deptName.indexOf(value) !== -1;
};

</script>

<style scoped lang="scss">
.container {
	height: 100%;
	overflow: hidden;
	flex: 1;
	display: flex;
	flex-direction: column;
}
</style>