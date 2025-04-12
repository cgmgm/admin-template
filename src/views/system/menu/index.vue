<template>
	<div class="container layout-pd">
		<Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData" @valueChange="valueChange"
			:tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
			<template #orBut>
				<el-button type="primary" plain @click="handleBack.add" v-auth="'sys:menu:add'">
					新增
				</el-button>
			</template>
		</Table>
	</div>
</template>

<script setup lang="tsx" name="systemmenu">
import { defineAsyncComponent, reactive } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createActionColumn } from '@/components/table/template';
import type { TableData } from '@/components/table/types';
import { getMenus as getList, delMenu } from '@/api/system';
import { ElMessageBox, ElMessage } from 'element-plus';
import { i18n } from '@/i18n';
import Dialog from './dialog.vue';
// 引入组件
const Table = defineAsyncComponent(() => import('@/components/table/index.vue'));

const handleBack = {
	add: (e?: any) => {
		openDialog('add', e);
	},
	edit: (e: any) => {
		openDialog('edit', e);
	},
	handleDelete: (e?: any) => {
		ElMessageBox.confirm('是否确认删除该数据项?', '警告', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			delMenu({ id: e.id }).then(() => {
				getTableData(queryParams);
				ElMessage.success('删除成功');
			});
		});
	},
}

const actionBack = (item: any, row: any) => {
	handleBack[item.key as keyof typeof handleBack]?.(row);
}

const state = reactive<{ tableData: TableData }>({
	tableData: createTableConfig({
		columns: [
			createColumn('菜单名称', 'menuName', {
				width: 180,
				template(row) {
					const key = 'message.router.' + row.name;
					return <div>{i18n.global.te(key) ? i18n.global.t(key) : row.name}</div>
				},
			}),
			createColumn('排序', 'sort', { width: 80 }),
			createColumn('路由地址', 'path'),
			createColumn('组件路径', 'component'),
			createColumn('创建时间', 'created_at'),
			createActionColumn([
				{ key: 'add', text: '新增', onClick: actionBack, auth: 'saveMenu', icon: 'Upload' },
				{ key: 'edit', text: '修改', onClick: actionBack, auth: 'saveMenu', icon: 'Edit' },
				{ key: 'handleDelete', text: '删除', onClick: actionBack, auth: 'delMenu', icon: 'Delete', poptext: '是否确认删除？' }
			]),
		],
		search: [
			createSearchItem('菜单名称', 'menuName', 'input', {
				placeholder: '请输入菜单名称'
			}),
			createSearchItem('状态', 'status', 'select', {
				placeholder: '菜单状态',
				optionKey: 'sys_normal_disable'
			}),
		]
	}),
});

const valueChange = (row: any, prop: string, value: any, type: string) => {
	console.log(row, prop, value, type);
}

let queryParams = {} as any;

const openDialog = (type?: string, row?: any) => {
	(window as any).$dialog(row ? '编辑' : '添加', Dialog, { type, data: row, routesList: state.tableData.data })
		.$on('success', () => {
			getTableData(queryParams);
		});
};

const getTableData = async (params: any) => {
	queryParams = params;
	state.tableData.config.loading = true;
	const res = await getList(params);
	state.tableData.data = res.data;
	state.tableData.config.loading = false;
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
