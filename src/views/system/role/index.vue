<template>
	<div class="container layout-pd">
		<Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData" @valueChange="valueChange">
			<template #orBut>
				<el-button type="primary" plain @click="handleBack.add" v-auth="'sys:role:add'">
					新增
				</el-button>
			</template>
		</Table>
	</div>
</template>

<script setup lang="tsx" name="systemrole">
import { defineAsyncComponent, reactive } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createActionColumn } from '@/components/table/template';
import type { TableData } from '@/components/table/types';
import { getRoles as getList, delRole } from '@/api/system';
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
	delete: (e?: any) => {
		ElMessageBox.confirm('是否确认删除该数据项?', '警告', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(() => {
			delRole({ id: e.id }).then(() => {
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
			createColumn('角色名称', 'name'),
			// createColumn('角色编码', 'code'),
			createColumn('描述', 'description'),
			createColumn('创建时间', 'created_at'),
			createActionColumn([
				{ key: 'edit', text: '修改', onClick: actionBack, auth: '保存角色', icon: 'Edit' },
				{ key: 'delete', text: '删除', onClick: actionBack, auth: '删除角色', icon: 'Delete', poptext: '是否确认删除？' }
			]),
		],
		search: [
			createSearchItem('角色名称', 'roleName', 'input', {
				placeholder: '请输入角色名称'
			}),
			createSearchItem('角色编码', 'roleCode', 'input', {
				placeholder: '请输入角色编码'
			}),
		],
		config: {
			isSerialNo: true,
		}
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
	state.tableData.data = res.data.list;
	state.tableData.config.total = res.data.total;
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
