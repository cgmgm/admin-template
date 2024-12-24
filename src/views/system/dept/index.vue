<template>
	<div class="container layout-pd">
		<Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData" @valueChange="valueChange">
			<template #orBut>
				<el-button type="primary" plain @click="handleBack.add" v-auth="'sys:dept:add'">
					新增
				</el-button>
			</template>
		</Table>
	</div>
</template>

<script setup lang="tsx" name="systemdept">
import { defineAsyncComponent, reactive } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createActionColumn } from '@/components/table/template';
import type { TableData } from '@/components/table/types';
import { getDepartments as getList, delDepartment } from '@/api/system';
import { ElMessageBox, ElMessage } from 'element-plus';
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
			delDepartment({ id: e.id }).then(() => {
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
			createColumn('部门名称', 'name'),
			createColumn('部门编码', 'code'),
			createColumn('负责人', 'leader'),
			createColumn('联系电话', 'phone'),
			createColumn('邮箱', 'email'),
			createColumn('排序', 'sort', { width: 80 }),
			createColumn('状态', 'status', {
				type: 'switch',
				activeValue: 1,
				inactiveValue: 0
			}),
			createColumn('创建时间', 'created_at'),
			createActionColumn([
				{ key: 'add', text: '新增', onClick: actionBack, auth: 'sys:dept:add', icon: 'Upload' },
				{ key: 'edit', text: '修改', onClick: actionBack, auth: 'sys:dept:edit', icon: 'Edit' },
				{ key: 'handleDelete', text: '删除', onClick: actionBack, auth: 'sys:dept:del', icon: 'Delete', poptext: '是否确认删除？' }
			]),
		],
		search: [
			createSearchItem('部门名称', 'name', 'input', {
				placeholder: '请输入部门名称'
			}),
			createSearchItem('部门编码', 'code', 'input', {
				placeholder: '请输入部门编码'
			}),
			createSearchItem('状态', 'status', 'select', {
				placeholder: '部门状态',
				optionKey: 'sys_normal_disable'
			}),
		],
	}),
});

const valueChange = (row: any, prop: string, value: any, type: string) => {
	console.log(row, prop, value, type);
}

let queryParams = {} as any;

const openDialog = (type?: string, row?: any) => {
	(window as any).$dialog(row ? '编辑' : '添加', Dialog, { type, data: row })
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
