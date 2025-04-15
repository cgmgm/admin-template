<template>
	<div class="table-search-container" v-if="props.search.length > 0">
		<el-form ref="tableSearchRef" :model="state.form" size="default" class="table-form">
			<el-row ref="searchRowRef" class="search-row">
				<el-col :xs="24" :sm="12" :md="6" :lg="4" :xl="4" class="mb5" v-for="(val, key) in search" :key="key"
					v-show="key < state.visibleCount || state.isToggle || state.form[val.prop]">
					<template v-if="val.type !== ''">
						<el-form-item :label="val.label" :prop="val.prop"
							:rules="[{ required: val.required, message: `${val.label}不能为空`, trigger: val.type === 'input' ? 'blur' : 'change' }]">
							<el-input v-model="state.form[val.prop]" :placeholder="val.placeholder" clearable
								v-if="val.type === 'input'" style="width: 100%" />
							<el-date-picker v-model="state.form[val.prop]" type="date" :placeholder="val.placeholder"
								v-else-if="val.type === 'date'" style="width: 100%" />
							<el-date-picker v-else-if="val.type === 'datetimerange'" v-model="state.form[val.prop]"
								type="daterange" range-separator="至" :start-placeholder="val.startPlaceholder || '开始时间'"
								:end-placeholder="val.endPlaceholder || '结束时间'" :shortcuts="dateRangeShortcuts"
								:default-time="defaultTime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%"
								:clearable="false" :editable="false" :popper-options="{
									modifiers: [{ name: 'computeStyles', options: { adaptive: false, enabled: false } }]
								}" />
							<el-select v-model="state.form[val.prop]" :placeholder="val.placeholder" clearable
								v-else-if="val.type === 'select'" style="width: 100%" :filterable="val.filterable">
								<el-option v-for="item in (dictList[val.optionKey] || val.options)" :key="item.value"
									:label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
					</template>
				</el-col>
				<el-form-item class="table-form-btn mb5" v-if="search.length > state.visibleCount"
					:label-width="search.length <= 1 ? '10px' : '5px'">
					<div class="table-form-btn-toggle ml10" @click="state.isToggle = !state.isToggle">
						<span>{{ state.isToggle ? '收起筛选' : '展开筛选' }}</span>
						<SvgIcon :name="state.isToggle ? 'ele-ArrowUp' : 'ele-ArrowDown'" />
					</div>
				</el-form-item>
				<el-form-item class="table-form-btn ml10" style="align-self: flex-start;">
					<div style="display: flex;gap:5px;">
						<el-button size="default" type="primary" @click="onSearch()">查询</el-button>
						<el-button size="default" type="info" @click="onReset()">重置</el-button>
						<slot name="orBut"></slot>
					</div>
				</el-form-item>
			</el-row>
		</el-form>
	</div>
</template>

<script setup lang="ts" name="makeTableDemoSearch">
import { reactive, ref, onMounted, computed, onUnmounted } from 'vue';
import type { FormInstance } from 'element-plus';
import dayjs from 'dayjs';
import { useCat } from '@/mixins/useStore'

const { dictData, depts, game, desk, initDict } = useCat();

/**
 * 将对象转换为包含 value 和 label 的数组
 * @param obj 要转换的对象
 * @returns 转换后的数组
 */
function toArr(obj: Record<string, string>): Array<{ value: string, label: string }> {
	return Object.entries(obj).map(([value, label]) => ({
		value,
		label
	}));
}
// 后台定义的字典
const dictList = computed(() => {
	return {
		sys_normal_disable: toArr(dictData.value.sys_normal_disable || {}),
		sys_role_type: toArr(dictData.value.sys_role_type || {}),
		sys_show_hide: toArr(dictData.value.sys_show_hide || {}),
		sys_menu_type: toArr(dictData.value.sys_menu_type || {}),
		sys_merchant_role_type: toArr(dictData.value.sys_merchant_role_type || {}),
		sys_yes_no: toArr(dictData.value.sys_yes_no || {}),
		sys_oper_type: toArr(dictData.value.sys_oper_type || {}),
		sys_common_status: toArr(dictData.value.sys_common_status || {}),
	}
})

// 定义父组件传过来的值
const props = defineProps({
	search: {
		type: Array<TableSearchType>,
		default: () => [],
	},
	autoLoad: {
		type: Boolean,
		default: true,
	},
});

// 定义子组件向父组件传值/事件
const emit = defineEmits(['search']);

// 定义变量内容
const tableSearchRef = ref<FormInstance>();
const searchRowRef = ref<HTMLElement>();
const state = reactive({
	form: {} as Record<string, any>,
	isToggle: false,
	visibleCount: 3 // 默认显示3个（考虑按钮占一个位置）
});

// 根屏幕宽度设置显示数量
const setVisibleCountByScreen = () => {
	const width = window.innerWidth;

	if (width >= 1920) { // xl
		state.visibleCount = 5; // 24/4 = 6 - 1(按钮)
	} else if (width >= 1200) { // lg
		state.visibleCount = 3; // 24/6 = 4 - 1(按钮)
	} else if (width >= 992) { // md
		state.visibleCount = 2; // 24/8 = 3 - 1(按钮)
	} else if (width >= 768) { // sm
		state.visibleCount = 1; // 24/12 = 2 - 1(按钮)
	} else { // xs
		state.visibleCount = 1; // 一个也显示
	}
};

// 监听窗口大小变化
const handleResize = () => {
	setVisibleCountByScreen();
};

// 初始化 form 字段
const initFormField = () => {
	if (props.search.length <= 0) return false;
	props.search.forEach((v) => {
		if (v.type === 'datetimerange' && v.default) {
			state.form[v.prop] = [
				dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
				dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
			]
			return;

		}
		// 使用配置中的 value 作为默认值，如果没有则使用空字符串
		state.form[v.prop] = v.value ?? undefined;
	});
};

// 查询
const onSearch = () => {
	const formEl = tableSearchRef.value;
	if (!formEl) return;
	formEl.validate((valid: boolean) => {
		if (valid) {
			emit('search', state.form);
		} else {
			return false;
		}
	});
};

// 重置
const onReset = () => {
	const formEl = tableSearchRef.value;
	if (!formEl) return;
	formEl.resetFields();
	initFormField();
	emit('search', state.form);
};

// 添加日期时间范围的默认时间
const defaultTime = [
	new Date(2000, 1, 1, 0, 0, 0), // 开始时间 00:00:00
	new Date(2000, 1, 1, 23, 59, 59), // 结束时间 23:59:59
];

// 添加日期范围快捷选项
const dateRangeShortcuts = [
	{
		text: '今天',
		value: () => {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const end = new Date();
			end.setHours(23, 59, 59, 999);
			return [today, end];
		},
	},
	{
		text: '昨天',
		value: () => {
			const today = new Date();
			const yesterday = new Date(today.setDate(today.getDate() - 1));
			yesterday.setHours(0, 0, 0, 0);
			const end = new Date(yesterday);
			end.setHours(23, 59, 59, 999);
			return [yesterday, end];
		},
	},
	{
		text: '本周',
		value: () => {
			const today = new Date();
			const start = new Date(today);
			start.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
			start.setHours(0, 0, 0, 0);
			const end = new Date();
			end.setHours(23, 59, 59, 999);
			return [start, end];
		},
	},
	{
		text: '上周',
		value: () => {
			const today = new Date();
			const lastWeekStart = new Date(today);
			lastWeekStart.setDate(today.getDate() - today.getDay() - 6);
			lastWeekStart.setHours(0, 0, 0, 0);
			const lastWeekEnd = new Date(today);
			lastWeekEnd.setDate(today.getDate() - today.getDay());
			lastWeekEnd.setHours(23, 59, 59, 999);
			return [lastWeekStart, lastWeekEnd];
		},
	},
	{
		text: '本月',
		value: () => {
			const today = new Date();
			const start = new Date(today.getFullYear(), today.getMonth(), 1);
			start.setHours(0, 0, 0, 0);
			const end = new Date();
			end.setHours(23, 59, 59, 999);
			return [start, end];
		},
	},
	{
		text: '上月',
		value: () => {
			const today = new Date();
			const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
			start.setHours(0, 0, 0, 0);
			const end = new Date(today.getFullYear(), today.getMonth(), 0);
			end.setHours(23, 59, 59, 999);
			return [start, end];
		},
	},
];

onMounted(() => {
	initFormField();
	setVisibleCountByScreen();
	window.addEventListener('resize', handleResize);
	if (props.autoLoad) {
		onSearch();
	}
});

// 组件卸载时移除事件监听
onUnmounted(() => {
	window.removeEventListener('resize', handleResize);
});

defineExpose({
	resetForm: onReset,
	search: onSearch
})
</script>

<style scoped lang="scss">
.table-search-container {
	display: flex;

	:deep(.el-button+.el-button) {
		margin: 0;
	}

	:deep(.el-form-item:last-of-type) {
		margin-bottom: 0px !important;
	}

	.table-form {
		flex: 1;

		.search-row {
			width: 100%;

			:deep(.el-form-item__label) {
				padding-right: 5px;
				padding-left: 10px;
				width: auto !important;
				min-width: 60px;
			}

			:deep(.el-form-item) {
				margin-bottom: 0px !important;
			}
		}

		.table-form-btn-toggle {
			white-space: nowrap;
			user-select: none;
			display: flex;
			align-items: center;
			color: var(--el-color-primary);
			cursor: pointer;
		}
	}
}

// 添加日期范围选择器的样式
:deep(.el-date-editor.el-input__wrapper) {
	width: 100%;
}

:deep(.el-date-editor--datetimerange) {
	--el-date-editor-width: 100%;

	.el-range-input {
		cursor: pointer;
	}

	// 隐藏底部的确认按钮区域
	.el-picker-panel__footer {
		display: none;
	}
}
</style>
