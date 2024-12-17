<template>
	<div class="table-demo-padding layout-padding-view layout-padding-auto">
		<TableSearch v-if="props.search.length > 0" :search="props.search" @search="onSearch">
			<template #orBut>
				<slot name="orBut"></slot>
			</template>
		</TableSearch>
		<div class="table-container" @contextmenu.prevent>
			<el-table :data="data" :border="tableConfig.isBorder" v-bind="$attrs" row-key="id" stripe
				style="width: 100%" v-loading="tableConfig.loading" @selection-change="onSelectionChange"
				@header-contextmenu="handleHeaderContextMenu">
				<el-table-column type="selection" :reserve-selection="true" width="44" v-if="tableConfig.isSelection" />
				<el-table-column type="index" label="序号" width="60" v-if="tableConfig.isSerialNo" />
				<el-table-column v-for="col in visibleColumns" :key="col.prop" v-bind="col" show-overflow-tooltip>
					<template #default="scope">
						<template v-if="col.formatter">
							<component :is="col.formatter(scope.row)" />
						</template>
						<template v-else-if="col.type === 'image'">
							<el-image :style="{ width: `${col.width || 50}px`, height: `${col.height || 50}px` }"
								:src="scope.row[col.prop]" :zoom-rate="1.2" :preview-src-list="[scope.row[col.prop]]"
								preview-teleported fit="cover" />
						</template>
						<template v-else-if="col.type === 'input'">
							<el-input v-model="scope.row[col.prop]" :placeholder="col.placeholder"
								@change="(val: any) => handleValueChange(scope.row, col.prop, val, 'input')" />
						</template>
						<template v-else-if="col.type === 'switch'">
							<el-switch :model-value="scope.row[col.prop] === true || scope.row[col.prop] === 'true'"
								@update:model-value="(val) => handleValueChange(scope.row, col.prop, val, 'switch')"
								:active-value="col.activeValue ?? true" :inactive-value="col.inactiveValue ?? false"
								:active-text="col.activeText" :inactive-text="col.inactiveText" />
						</template>
						<template v-else-if="col.type === 'radio'">
							<el-radio-group v-model="scope.row[col.prop]"
								@change="(val: any) => handleValueChange(scope.row, col.prop, val, 'radio')">
								<el-radio v-for="opt in col.options" :key="opt.value" :label="opt.value">
									{{ opt.label }}
								</el-radio>
							</el-radio-group>
						</template>
						<template v-else-if="col.type === 'select'">
							<el-select v-model="scope.row[col.prop]" :placeholder="col.placeholder"
								@change="(val: any) => handleValueChange(scope.row, col.prop, val, 'select')">
								<el-option v-for="opt in col.options" :key="opt.value" :label="opt.label"
									:value="opt.value" />
							</el-select>
						</template>
						<template v-else>
							{{ scope.row[col.prop] }}
						</template>
					</template>
				</el-table-column>
			</el-table>
			<div class="table-footer mt15">
				<el-pagination v-model:current-page="state.page.pageNum" v-model:page-size="state.page.pageSize"
					:pager-count="5" :page-sizes="[20, 50, 100]" :total="tableConfig.total"
					layout="total, sizes, prev, pager, next, jumper" background @size-change="onHandleSizeChange"
					@current-change="onHandleCurrentChange">
				</el-pagination>
				<div class="table-footer-tool">
					<SvgIcon name="iconfont icon-dayin" :size="19" title="打印" @click="onPrintTable" />
					<!-- <SvgIcon name="iconfont icon-yunxiazai_o" :size="22" title="导出" @click="onImportTable" /> -->
					<SvgIcon name="iconfont icon-shuaxin" :size="22" title="刷新" @click="onRefreshTable" />
				</div>
			</div>

			<!-- 设置面板 -->
			<div v-if="settingsVisible" class="settings-panel" :style="settingsPanelStyle">
				<div class="tool-box">
					<el-tooltip content="拖动进行排序" placement="top-start">
						<SvgIcon name="fa fa-question-circle-o" :size="17" class="ml11" color="#909399" />
					</el-tooltip>
					<el-checkbox v-model="state.checkListAll" :indeterminate="state.checkListIndeterminate"
						class="ml10 mr1" label="列显示" @change="onCheckAllChange" />
					<el-checkbox v-model="state.isSerialNo" class="ml12 mr1" label="序号" @change="onConfigChange" />
					<el-checkbox v-model="state.isSelection" class="ml12 mr1" label="多选" @change="onConfigChange" />
				</div>
				<el-scrollbar>
					<div ref="toolSetRef" class="tool-sortable">
						<div v-for="col in columns" :key="col.prop" :data-key="col.prop" class="tool-sortable-item">
							<i class="fa fa-arrows-alt handle cursor-pointer"></i>
							<el-checkbox v-model="col.isCheck" size="default" class="ml12 mr8" :label="col.label"
								@change="(val) => onCheckChange(val, col)" />
						</div>
					</div>
				</el-scrollbar>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="netxTable">
import { reactive, computed, nextTick, ref, VNode, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { ElMessage } from 'element-plus';
import printJs from 'print-js';
import table2excel from 'js-table2excel';
import Sortable from 'sortablejs';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '@/stores/themeConfig';
import '@/theme/tableTool.scss';
import { useRoute } from 'vue-router';
import { auths } from '@/utils/authFunction';

// 搜索
const TableSearch = defineAsyncComponent(() => import('./search.vue'));

// 修改列的类型接口
interface TableColumn {
	prop: string;
	label: string;
	minWidth?: number | string;
	width?: number | string;
	type?: 'image' | 'input' | 'switch' | 'radio' | 'select' | 'text';
	formatter?: (row: any) => VNode | string;
	height?: number;
	activeValue?: boolean | string | number;
	inactiveValue?: boolean | string | number;
	activeText?: string;
	inactiveText?: string;
	placeholder?: string;
	options?: Array<{
		label: string;
		value: any;
	}>;
	[key: string]: any;
}

// props 定义
const props = defineProps({
	data: {
		type: Array<EmptyObjectType>,
		default: () => [],
	},
	columns: {
		type: Array<TableColumn>,
		default: () => [],
		required: true
	},
	modelValue: {
		type: Array<TableColumn>,
		default: undefined
	},
	config: {
		type: Object,
		default: () => ({}),
	},
	printName: {
		type: String,
		default: '',
	},
	// 添加搜索配置
	search: {
		type: Array<TableSearchType>,
		default: () => [],
	},
	// 添加分页参数配置
	param: {
		type: Object,
		default: () => ({
			pageNum: 1,
			pageSize: 50,
		}),
	},
	// 初始化时是否自动加载
	autoLoad: {
		type: Boolean,
		default: true
	}
});

// 修改 emit 定义，添加 fetch 事件
const emit = defineEmits([
	'pageChange',
	'sortHeader',
	'update:modelValue',
	'valueChange',
	'columnsChange',
	'search',
	'fetch'  // 添加统一的数据获取事件
]);

// 添加路由实例
const route = useRoute();

// 添加缓存相关的工具函数
const getStorageKey = () => {
	return `table_columns_${route.path}`;
};

const saveColumnsToStorage = (columns: TableColumn[]) => {
	try {
		const key = getStorageKey();
		// 保存列的顺序和显示状态
		const columnsToSave = columns.map(col => ({
			prop: col.prop,
			isCheck: col.isCheck,
			label: col.label
		}));
		localStorage.setItem(key, JSON.stringify(columnsToSave));
	} catch (error) {
		console.warn('Failed to save columns order:', error);
	}
};

const getColumnsFromStorage = (): TableColumn[] | null => {
	try {
		const key = getStorageKey();
		const stored = localStorage.getItem(key);
		return stored ? JSON.parse(stored) : null;
	} catch (error) {
		console.warn('Failed to get columns order:', error);
		return null;
	}
};

// 加响应式状态来存储列顺序
const columnOrder = ref<string[]>([]);

// 修改计算属性处理列配置
const columns = computed({
	get: () => {
		const source = props.modelValue ?? props.columns;
		// 获取缓存的列顺序
		const storedColumns = getColumnsFromStorage();

		// 如果有缓存，需要处理新增字段
		if (storedColumns) {
			// 找出新增的列
			const newColumns = source.filter(col =>
				!storedColumns.some(stored => stored.prop === col.prop)
			);

			// 合并缓存的列和新增的列
			let mergedColumns = [
				// 保持缓存列的顺序，但只保留仍然存在的列
				...storedColumns.filter(stored =>
					source.some(col => col.prop === stored.prop)
				).map(stored => {
					// 找到对应的原始列配置
					const current = source.find(s => s.prop === stored.prop);
					return {
						...current, // 保留原始列的所有配置
						isCheck: state.checkedColumns.includes(stored.prop) // 使用响应式状态
					};
				}),
				// 添加新增的列到末尾，默认显示
				...newColumns.map(col => ({
					...col,
					isCheck: true
				}))
			];

			if (columnOrder.value.length > 0) {
				mergedColumns = columnOrder.value
					.map(prop => mergedColumns.find(col => col.prop === prop))
					.filter(Boolean) as TableColumn[];
			}

			return mergedColumns.filter((col: any) => (col.auth ? auths(col.auth) : true));
		}

		// 没有缓存时���原始顺序
		return source.map(col => ({
			...col,
			align: col.align || 'left',
			showOverflowTooltip: col.showOverflowTooltip ?? true,
			isCheck: state.checkedColumns.includes(col.prop) // 使用响应式状态
		})).filter((col: any) => (col.auth ? auths(col.auth) : true));
	},
	set: (newColumns) => {
		saveColumnsToStorage(newColumns);
		emit('update:modelValue', newColumns);
	}
});

// 处理值变化的函数
const handleValueChange = (row: any, prop: string, value: any, type: string) => {
	emit('valueChange', {
		row,
		prop,
		value,
		type
	});
};

// 定义变量容
const toolSetRef = ref();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const state = reactive({
	page: {
		pageNum: props.param?.pageNum || 1,
		pageSize: props.param?.pageSize || 50,
	},
	searchParams: {}, // 存储搜索参数
	selectlist: [] as EmptyObjectType[],
	checkListAll: true,
	checkListIndeterminate: false,
	contextMenuVisible: false,
	contextMenuTarget: null as HTMLElement | null,
	checkedColumns: [] as string[],
	isSerialNo: false,
	isSelection: false,
});

// 添加 ref 用于控制设置面板
const settingsVisible = ref(false);
const settingsPanelStyle = ref({
	left: '0px',
	top: '0px'
});

// 初始化设置配置状态
onMounted(() => {
	const storedColumns = getColumnsFromStorage();
	if (storedColumns) {
		// 初始化选中状态
		state.checkedColumns = storedColumns
			.filter(col => col.isCheck)
			.map(col => col.prop);

		// 更新列配置
		const newColumns = props.columns.map(col => {
			const stored = storedColumns.find(s => s.prop === col.prop);
			return {
				...col,
				isCheck: stored ? stored.isCheck : true
			};
		});

		// 更新全选状态
		const checkedCount = state.checkedColumns.length;
		state.checkListAll = checkedCount === newColumns.length;
		state.checkListIndeterminate = checkedCount > 0 && checkedCount < newColumns.length;

		emit('update:modelValue', newColumns);
	} else {
		// 没有缓存时，所有列都选中
		state.checkedColumns = props.columns.map(col => col.prop);
	}

	state.isSerialNo = props.config?.isSerialNo ?? false;
	state.isSelection = props.config?.isSelection ?? false;
	document.addEventListener('click', closeContextMenu);
	document.addEventListener('click', closePanel);
	// 如果自动加载，则触发数据获取
	if (props.autoLoad) {
		emit('fetch');
	}
});

// 修改计算可见列的逻辑
const visibleColumns = computed(() => {
	return columns.value.filter((col: any) => state.checkedColumns.includes(col.prop));
});

// 修改处理表头右键点击的函数
const handleHeaderContextMenu = (column: any, event: MouseEvent) => {
	// 阻止默认右键菜单
	if (event) {
		event.preventDefault();
		event.stopPropagation();
	}

	// 设置面板位置并显示
	settingsPanelStyle.value = {
		left: `${event.clientX}px`,
		top: `${event.clientY}px`
	};

	// 显示面板并初始化 Sortable
	settingsVisible.value = true;
	nextTick(() => {
		initSortable();
	});
};

// 修改全选处理函数
const onCheckAllChange = (val: boolean) => {
	// 更新选中状态
	state.checkedColumns = val ? columns.value.map(col => col.prop) : [];
	state.checkListIndeterminate = false;

	// 更新列配置并保存到缓存
	const newColumns = columns.value.map(col => ({
		...col,
		isCheck: val
	}));

	// 保存到缓存并触发更新
	saveColumnsToStorage(newColumns);
	emit('update:modelValue', newColumns);

	// 强制更新可见列
	nextTick(() => {
		state.checkedColumns = newColumns
			.filter(col => col.isCheck)
			.map(col => col.prop);
	});
};

// 修改单个选择处理函数
const onCheckChange = (val: boolean, col: TableColumn) => {
	// 更新选中状态
	if (val) {
		if (!state.checkedColumns.includes(col.prop)) {
			state.checkedColumns.push(col.prop);
		}
	} else {
		state.checkedColumns = state.checkedColumns.filter(prop => prop !== col.prop);
	}

	// 更新列配置并保存到缓存
	const newColumns = columns.value.map(item => ({
		...item,
		isCheck: state.checkedColumns.includes(item.prop)
	}));

	// 保存到缓存并触发更新
	saveColumnsToStorage(newColumns);
	emit('update:modelValue', newColumns);

	// 更新全选状态
	const checkedCount = state.checkedColumns.length;
	state.checkListAll = checkedCount === columns.value.length;
	state.checkListIndeterminate = checkedCount > 0 && checkedCount < columns.value.length;

	// 强制更新可见列
	nextTick(() => {
		state.checkedColumns = newColumns
			.filter(col => col.isCheck)
			.map(col => col.prop);
	});
};

// 表格多选改变时，用于导出
const onSelectionChange = (val: EmptyObjectType[]) => {
	state.selectlist = val;
};
// 分页改变
const onHandleSizeChange = (val: number) => {
	state.page.pageSize = val;
	fetchData();
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
	state.page.pageNum = val;
	fetchData();
};
// 搜索时，分页还原成默认
const pageReset = () => {
	state.page.pageNum = props.param?.pageNum || 1;
	state.page.pageSize = props.param?.pageSize || 50;
	state.searchParams = {}; // 清空搜索参数
	fetchData();
};
// 打印
const onPrintTable = () => {
	// https://printjs.crabbly.com/#documentation
	// 定义打印
	let tableTh = '';
	let tableTrTd = '';
	let tableTd: any = {};
	// 表头
	props.columns.forEach((v) => {
		tableTh += `<th class="table-th">${v.label}</th>`;
	});
	// 表格内容
	props.data.forEach((val, key) => {
		if (!tableTd[key]) tableTd[key] = [];
		props.columns.forEach((v) => {
			if (v.type === 'text') {
				tableTd[key].push(`<td class="table-th table-center">${val[v.prop]}</td>`);
			} else if (v.type === 'image') {
				tableTd[key].push(`<td class="table-th table-center"><img src="${val[v.prop]}" style="width:${v.width}px;height:${v.height}px;"/></td>`);
			}
		});
		tableTrTd += `<tr>${tableTd[key].join('')}</tr>`;
	});
	// 打印
	printJs({
		printable: `<div style=display:flex;flex-direction:column;text-align:center><h3>${props.printName}</h3></div><table border=1 cellspacing=0><tr>${tableTh}${tableTrTd}</table>`,
		type: 'raw-html',
		css: ['//at.alicdn.com/t/c/font_2298093_rnp72ifj3ba.css', '//unpkg.com/element-plus/dist/index.css'],
		style: `@media print{.mb15{margin-bottom:15px;}.el-button--small i.iconfont{font-size: 12px !important;margin-right: 5px;}}; .table-th{word-break: break-all;white-space: pre-wrap;}.table-center{text-align: center;}`,
	});
};
// 导出
const onImportTable = () => {
	if (state.selectlist.length <= 0) return ElMessage.warning('请先选择要导出的数据');
	table2excel(props.columns, state.selectlist, `${themeConfig.value.globalTitle} ${new Date().toLocaleString()}`);
};
// 刷新
const onRefreshTable = () => {
	fetchData();
};
// 设置
const onSetTable = () => {
	settingsVisible.value = true;
	// 等待 DOM 更新后初始化 Sortable
	nextTick(() => {
		initSortable();
	});
};

// 修改 Sortable 初始化函数
const initSortable = () => {
	if (!toolSetRef.value) return;

	// 销毁已存在的实例
	if (toolSetRef.value.sortable) {
		toolSetRef.value.sortable.destroy();
	}

	// 创建新实例
	const sortable = Sortable.create(toolSetRef.value, {
		handle: '.handle',
		dataIdAttr: 'data-key',
		animation: 150,
		onEnd: (evt) => {
			const newOrder = sortable.toArray();
			// 更新列顺序
			columnOrder.value = newOrder;

			// 根据新顺序重新排列列
			const newColumns = newOrder
				.map(prop => columns.value.find(col => col.prop === prop))
				.filter(Boolean) as TableColumn[];

			// 保存新的列顺序和状态
			saveColumnsToStorage(newColumns);
			emit('update:modelValue', newColumns);
			emit('sortHeader', newColumns);

			// 强制更新可见列
			state.checkedColumns = newColumns
				.filter(col => col.isCheck)
				.map(col => col.prop);
		},
	});

	// 保存实例引用
	toolSetRef.value.sortable = sortable;
};

// 添加点击其他地方关闭菜单的理
const closeContextMenu = (e: MouseEvent) => {
	// 如果点击的是菜单内部，不关闭
	const target = e.target as HTMLElement;
	if (target.closest('.context-menu-content')) return;

	state.contextMenuVisible = false;
};

// 添加点击外部关闭面板
const closePanel = (e: MouseEvent) => {
	const target = e.target as HTMLElement;
	if (!target.closest('.settings-panel')) {
		settingsVisible.value = false;
	}
};

// 在组件卸载时移除事件监听
onUnmounted(() => {
	// 销毁 Sortable 实例
	if (toolSetRef.value?.sortable) {
		toolSetRef.value.sortable.destroy();
	}
	document.removeEventListener('click', closeContextMenu);
	document.removeEventListener('click', closePanel);
});

// 修改配置相关的计算属性
const tableConfig = computed({
	get: () => ({
		...props.config,
		isSerialNo: state.isSerialNo,
		isSelection: state.isSelection
	}),
	set: (newConfig) => {
		emit('update:config', newConfig);
	}
});

// 修改配置变化处理函数
const onConfigChange = () => {
	// 更新配置
	tableConfig.value = {
		...props.config,
		isSerialNo: state.isSerialNo,
		isSelection: state.isSelection
	};
};

// 修改搜索处理函数
const onSearch = (params: any) => {
	// 重置分页
	state.page.pageNum = 1;
	// 保存搜索参数
	state.searchParams = params;
	// 触发数据获取
	fetchData();
};

// 添加统一的数据获取函数
const fetchData = () => {
	emit('fetch', {
		...state.searchParams,
		pageNum: state.page.pageNum,
		pageSize: state.page.pageSize
	});
};

// 暴露变量
defineExpose({
	pageReset,
});
</script>

<style scoped lang="scss">
.table-demo-padding {
	display: flex;
	flex-direction: column;
	gap: 15px; // 添加间距


	.table-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;

		.el-table {
			flex: 1;
		}

		.table-footer {
			display: flex;

			.table-footer-tool {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: flex-end;

				i {
					margin-right: 10px;
					cursor: pointer;
					color: var(--el-text-color-regular);

					&:last-of-type {
						margin-right: 0;
					}
				}
			}
		}

		:deep(.header-context-menu) {
			padding: 8px;
			box-shadow: var(--el-box-shadow-light);
			background: var(--el-bg-color);
			border: 1px solid var(--el-border-color-lighter);
			border-radius: var(--el-border-radius-base);

			.context-menu-content {
				.menu-header {
					padding: 4px 0;
				}

				.menu-list {
					max-height: 300px;
					overflow-y: auto;

					.column-item {
						display: block;
						white-space: nowrap;

						&:first-child {
							margin-top: 0;
						}

						&:hover {
							background-color: var(--el-color-primary-light-9);
						}
					}
				}
			}

		}
	}
}

:deep(.el-divider--horizontal) {
	margin: 2px;
}

:deep(.el-checkbox.el-checkbox--large) {
	height: 25px;
}

:deep(.el-table--large .el-table__cell) {
	padding: 4px 0;

}

:deep(.el-table th.el-table__cell.is-leaf) {
	padding: 8px 0;
}

.context-menu-content {
	user-select: none; // 防止文本选择

	.menu-list {
		.column-item {
			padding: 0px 8px;
			border-radius: 4px;

			&:hover {
				background-color: var(--el-color-primary-light-9);
			}
		}
	}
}

.settings-panel {
	position: fixed;
	z-index: 2000;
	background: var(--el-bg-color);
	border: 1px solid var(--el-border-color-lighter);
	border-radius: var(--el-border-radius-base);
	box-shadow: var(--el-box-shadow-light);
	padding: 12px;
	width: 300px;

	.tool-box {
		margin-bottom: 8px;
	}

	.tool-sortable {
		max-height: 300px;
		overflow-y: auto;
	}

	.tool-sortable-item {
		display: flex;
		align-items: center;
		padding: 4px 8px;

		&:hover {
			background-color: var(--el-color-primary-light-9);
		}

		.handle {
			cursor: move;
			margin-right: 8px;
		}
	}
}
</style>
