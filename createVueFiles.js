const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);
const dirPath = args[0];

if (!dirPath) {
    console.error('请提供目录路径，例如: node createVueFiles.js /sys/user');
    process.exit(1);
}

// 设置基础路径为 /src/views
const basePath = path.join(__dirname, 'src', 'views');

// 创建完整路径
const fullPath = path.join(basePath, dirPath);

// 创建目录
fs.mkdirSync(fullPath, { recursive: true });

// index.vue 的内容
const indexContent = `<template>
	<div class="container layout-pd">
		<Table ref="tableRef" v-bind="state.tableData" class="table-demo" @fetch="getTableData">
			<template #orBut>
				<!-- 自定义按钮插槽 -->
			</template>
		</Table>
	</div>
</template>

<script setup lang="ts" name="componentName">
import { defineAsyncComponent, reactive, ref } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createCurrency } from '@/components/table/template';
import type { TableData } from '@/components/table/types';

// 引入组件
const Table = defineAsyncComponent(() => import('@/components/table/index.vue'));
const AddInfo = defineAsyncComponent(() => import('./addInfo.vue'));

const state = reactive<{ tableData: TableData }>({
	tableData: createTableConfig({
		columns: [
			// 在此定义表格列
			// 例如：createColumn('标题', 'key', { type: 'text' }),
		],
		search: [
			// 在此定义搜索项
			// 例如：createCurrency(1, true),
		]
	}),
});
const addInfo = () => {
	window.$dialog('添加', AddInfo)
		.$on('success', (formData) => {
			getTableData();
		})
};

// 获取表格数据
const getTableData = () => {
	state.tableData.config.loading = true;
	// 在此处添加获取数据的逻辑

	state.tableData.data = []; // 设置实际数据
	state.tableData.config.total = 0; // 设置数据总数
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
</style>`;

// addInfo.vue 的内容
const addInfoContent = `<template>
    <div class="add-info-container">
        <el-form ref="formRef" :model="state.form" :rules="state.rules" label-width="120px" class="mt35 mb35">
            <el-row :gutter="35">
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
                    <el-form-item label="采样点名称" prop="name">
                        <el-input v-model="state.form.name" placeholder="请输入应检尽检核酸采样点名称" clearable />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item>
                <el-button type="primary" @click="onSubmit(formRef)">提交</el-button>
                <el-button @click="cancel">返回</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, inject } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';

// 定义变量内容
const formRef = ref<FormInstance>();
const dialogInstance = inject('dialogInstance');
const state = reactive({
    form: {
        name: '',
    },
    rules: {
        name: [{ required: true, message: '请输入采样点名称', trigger: 'blur' }],
    } as FormRules,
});


// 表单提交
const onSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate((valid: boolean) => {
        if (valid) {
            console.log('submit!', state.form);
            ElMessage.success('提交成功！');
            // 可以发射任意自定义事件
            (dialogInstance as any)?.$emit('success', state.form);
            // 发射完成后关闭
            cancel();
        }
    });
};

// 返回列表页
const cancel = () => {
    (dialogInstance as any)?.$close();
};
</script>

<style scoped lang="scss">
.add-info-container {
    padding: 15px;
    width: 800px;

}
</style>`;

// 创建文件
fs.writeFileSync(path.join(fullPath, 'index.vue'), indexContent);
fs.writeFileSync(path.join(fullPath, 'addInfo.vue'), addInfoContent);

console.log(`文件已成功创建在 ${fullPath} 目录下`);
