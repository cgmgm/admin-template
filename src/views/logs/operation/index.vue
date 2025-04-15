<template>
    <div class="container layout-pd">
        <Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData" @selectionChange="selectionChange"
            @valueChange="valueChange">
            <template #orBut>
                <el-button type="primary" plain @click="showExportDialog = true" v-auth="'sys:logs:export'">
                    导出
                </el-button>
            </template>
        </Table>

        <!-- 导出对话框 -->
        <export-dialog v-if="showExportDialog" :export-url="exportUrl" :params="exportParams"
            @close="showExportDialog = false" />
    </div>
</template>

<script setup lang="tsx" name="operationlog">
import { defineAsyncComponent, reactive, ref } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createActionColumn } from '@/components/table/template';
import type { TableData } from '@/components/table/types';
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOperationLogs, getOperationLogDetail } from '@/api/system';
import Detail from './detail.vue';
import ExportDialog from './export-dialog.vue';
import FileDownloader from '@/utils/FileDownloader';

// 引入组件
const Table = defineAsyncComponent(() => import('@/components/table/index.vue'));

// 状态定义
const selectList = ref<number[]>([]);
const showExportDialog = ref(false);
const exportUrl = ref('admin/logs/operation');
const exportParams = ref<Record<string, any>>({});

// 表格数据相关配置
const state = reactive<{ tableData: TableData }>({
    tableData: createTableConfig({
        columns: [
            createColumn('用户名', 'username', { width: 120 }),
            createColumn('操作模块', 'module', { width: 120 }),
            createColumn('操作类型', 'action', { width: 120 }),
            createColumn('请求方法', 'method', { width: 100 }),
            createColumn('请求URL', 'url'),
            createColumn('IP地址', 'ip', { width: 120 }),
            createColumn('状态码', 'status_code', {
                width: 100,
                template: row => {
                    const type = row.status_code === 200 ? 'success' : 'danger';
                    return <el-tag type={type}>{row.status_code}</el-tag>
                }
            }),
            createColumn('执行时间(ms)', 'execution_time', { width: 120 }),
            createColumn('操作时间', 'created_at', { width: 180 }),
            createActionColumn([
                { key: 'detail', text: '详情', onClick: handleDetail, icon: 'View' }
            ], { width: 100 }),
        ],
        search: [
            createSearchItem('用户名', 'username', 'input', {
                placeholder: '请输入用户名'
            }),
            createSearchItem('用户ID', 'user_id', 'input', {
                placeholder: '请输入用户ID'
            }),
            createSearchItem('操作模块', 'module', 'input', {
                placeholder: '请输入操作模块'
            }),
            createSearchItem('操作类型', 'action', 'input', {
                placeholder: '请输入操作类型'
            }),
            createSearchItem('状态码', 'status_code', 'input', {
                placeholder: '请输入状态码'
            }),
            createSearchItem('操作时间', 'date_range', 'datetimerange')
        ],
        config: {
            isSelection: true
        }
    }),
});

// 表格行选择变更事件
const selectionChange = (val: any) => {
    selectList.value = val.map((item: any) => item.id);
}

// 查看详情
function handleDetail(item: any, row: any) {
    (window as any).$dialog('操作日志详情', Detail, { id: row.id });
}
const tableRef = ref<any>(null);

// 值变更事件
const valueChange = (row: any, prop: string, value: any, type: string) => {
    console.log(row, prop, value, type);
}


// 获取表格数据
const getTableData = async (params: any) => {
    exportParams.value = params;
    state.tableData.config.loading = true;

    // 处理日期范围
    if (params.date_range) {
        params.start_date = params.date_range[0];
        params.end_date = params.date_range[1];
        delete params.date_range;
    }

    try {
        const response = await getOperationLogs({
            ...params,
        });

        state.tableData.data = response.data.items || [];
        state.tableData.config.total = response.data.total || 0;
    } catch (error) {
        console.error('获取操作日志失败', error);
    } finally {
        state.tableData.config.loading = false;
    }
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

pre {
    background-color: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
    max-height: 200px;
    overflow: auto;
    margin: 0;
    font-size: 12px;
}
</style>