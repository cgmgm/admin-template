<template>
	<div class="table-demo-container layout-padding">
		<div class="table-demo-padding layout-padding-view layout-padding-auto">
			<Table ref="tableRef" v-bind="state.tableData" class="table-demo" @fetch="getTableData">
				<template #orBut>
					<el-button size="default" type="primary" plain @click="addInfo">添加</el-button>
				</template>
			</Table>
		</div>
	</div>
</template>

<script setup lang="tsx" name="makeTableDemo">
import { defineAsyncComponent, reactive, ref } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createCurrency, createDeskList } from '@/components/table/template';
import type { TableData } from '@/components/table/types';

// 引入组件
const Table = defineAsyncComponent(() => import('@/components/table/index.vue'));
const AddInfo = defineAsyncComponent(() => import('@/views/make/tableDemo/addInfo.vue'));
const state = reactive<{ tableData: TableData }>({
	tableData: createTableConfig({
		columns: [
			createColumn('应检尽检核酸采样点名称', 'name', { type: 'text' }),
			createColumn('详细地址', 'address', { type: 'text' }),
			createColumn('采样点联系电话', 'phone', { type: 'text' }),
			createColumn('开放时间', 'time', { type: 'text' }),
			// createColumn('图片描述', 'image', { type: 'image' }),
			createColumn('滑块', 'isSupport', { type: 'switch' }),
		],
		search: [
			createSearchItem('采样点名称', 'name', 'input', {
				value: '莲塘别墅广场11',
				placeholder: '请输入应检尽检核酸采样点名称'
			}),
			createCurrency(1, true),
			createDeskList(1),
			createSearchItem('详细地址', 'address', 'input'),
			createSearchItem('联系电话', 'phone', 'input'),
			createSearchItem('开放时间', 'time', 'datetimerange'),
			createSearchItem('图片描述', 'image', 'input'),
			createSearchItem('核酸机构', 'mechanism', 'input'),
		]
	}),
});

// 初始化列表数据
const getTableData = () => {
	state.tableData.config.loading = true;
	state.tableData.data = [];
	for (let i = 0; i < 40; i++) {
		state.tableData.data.push({
			id: `123456789${i + 1}`,
			name: `莲塘别墅广场${i + 1}`,
			address: `中沧公寓中庭榕树下${i + 1}`,
			phone: `0592-6081259${i + 1}`,
			time: `6:00 ~ 24:00`,
			isSupport: `${i % 2 == 0}`,
			image: `https://img2.baidu.com/it/u=417454395,2713356475&fm=253&fmt=auto?w=200&h=200`,
		});
	}
	// 数据总数（模拟，真实从接口取）
	state.tableData.config.total = state.tableData.data.length;
	setTimeout(() => {
		state.tableData.config.loading = false;
	}, 500);
};

const addInfo = () => {
	window.$dialog('添加', AddInfo)
		.$on('success', (formData) => {
			getTableData();
		})
};

</script>

<style scoped lang="scss">
.table-demo-container {
	.table-demo-padding {
		padding: 15px;

		.table-demo {
			flex: 1;
			overflow: hidden;
		}
	}
}
</style>
