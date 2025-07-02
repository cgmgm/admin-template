<template>
    <div class="container layout-pd">
        <Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData" @valueChange="valueChange">
            <template #orBut>
                <el-button type="primary" plain @click="handleBack.add" v-auth="'保存投诉'">
                    新增投诉
                </el-button>
            </template>
        </Table>
    </div>
</template>

<script setup lang="tsx" name="feedbackList">
import { defineAsyncComponent, reactive } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createActionColumn } from '@/components/table/template';
import type { TableData } from '@/components/table/types';
import {
    getComplaints as getList,
    delComplaint,
    updateComplaintStatus,
    getComplaintStatusText,
    complaintStatusOptions,
    getAllDomains
} from '@/api/domain';
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
        ElMessageBox.confirm('是否确认删除该投诉记录?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            delComplaint({ id: e.id }).then(() => {
                getTableData(queryParams);
                ElMessage.success('删除成功');
            });
        });
    },
    updateStatus: (e: any) => {
        ElMessageBox.confirm('是否确认更新投诉状态?', '确认操作', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
        }).then(() => {
            // 简单的状态切换逻辑：待处理->处理中->已解决->已关闭->待处理
            const nextStatus = (e.status + 1) % 4;
            updateComplaintStatus({ id: e.id, status: nextStatus }).then(() => {
                getTableData(queryParams);
                ElMessage.success('状态更新成功');
            });
        });
    },
}

const actionBack = (item: any, row: any) => {
    handleBack[item.key as keyof typeof handleBack]?.(row);
}

// 格式化状态显示
const formatStatus = (status: number) => {
    const statusText = getComplaintStatusText(status);
    let className = '';
    switch (status) {
        case 0: className = 'status-pending'; break;  // 待处理
        case 1: className = 'status-processing'; break;  // 处理中
        case 2: className = 'status-resolved'; break;  // 已解决
        case 3: className = 'status-closed'; break;  // 已关闭
    }
    return <span class={className}>{statusText}</span>;
};

// 格式化投诉内容显示（截断长文本）
const formatContent = (content: string) => {
    if (!content) return '-';
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
};

// 格式化域名显示
const formatDomain = (row: any) => {
    return row.domain ? row.domain.domain : '-';
};

const state = reactive<{
    tableData: TableData,
    domainOptions: any[]
}>({
    tableData: createTableConfig({
        columns: [
            createColumn('投诉者邮箱', 'email'),
            createColumn('投诉者姓名', 'name'),
            createColumn('联系电话', 'phone'),
            {
                ...createColumn('关联域名', 'domain'),
                formatter: (row: any) => formatDomain(row)
            },
            {
                ...createColumn('投诉内容', 'content'),
                formatter: (row: any) => formatContent(row.content),
                minWidth: 200
            },
            {
                ...createColumn('状态', 'status'),
                formatter: (row: any) => formatStatus(row.status)
            },
            createColumn('创建时间', 'created_at'),
            createActionColumn([
                { key: 'edit', text: '修改', onClick: actionBack, auth: '保存投诉', icon: 'Edit' },
                { key: 'updateStatus', text: '更新状态', onClick: actionBack, auth: '更新投诉状态', icon: 'Refresh' },
                { key: 'delete', text: '删除', onClick: actionBack, auth: '删除投诉', icon: 'Delete', poptext: '是否确认删除？' }
            ]),
        ],
        search: [
            createSearchItem('关键词', 'keyword', 'input', {
                placeholder: '请输入邮箱、姓名或投诉内容'
            }),
            createSearchItem('状态', 'status', 'select', {
                placeholder: '请选择状态',
                options: [
                    { label: '全部', value: '' },
                    ...complaintStatusOptions
                ]
            }),
            // createSearchItem('关联域名', 'domain_id', 'select', {
            //     placeholder: '请选择域名',
            //     options: [
            //         { label: '全部', value: '' }
            //     ]
            // }),
            createSearchItem('关联域名', 'domain', 'input', {
                placeholder: '请输入域名'
            }),
        ],
        config: {
            isSerialNo: true,
        }
    }),
    domainOptions: []
});

const valueChange = (row: any, prop: string, value: any, type: string) => {
    console.log(row, prop, value, type);
}

let queryParams = {} as any;

// 获取域名选项用于搜索
const getDomainOptions = async () => {
    try {
        const res = await getAllDomains();
        state.domainOptions = res.data || [];
        // 更新搜索项的选项
        const domainSearchItem = state.tableData.search.find(item => item.prop === 'domain_id');
        if (domainSearchItem && domainSearchItem.config?.options) {
            domainSearchItem.config.options = [
                { label: '全部', value: '' },
                ...state.domainOptions.map(item => ({
                    label: item.domain,
                    value: item.id
                }))
            ];
        }
    } catch (error) {
        console.error('获取域名选项失败:', error);
    }
};

const openDialog = (type?: string, row?: any) => {
    (window as any).$dialog(row ? '编辑投诉' : '添加投诉', Dialog, { type, data: row })
        .$on('success', () => {
            getTableData(queryParams);
        });
};

const getTableData = async (params: any) => {
    queryParams = params;
    state.tableData.config.loading = true;
    try {
        const res = await getList(params);
        state.tableData.data = res.data.list;
        state.tableData.config.total = res.data.total;
    } catch (error) {
        console.error('获取投诉列表失败:', error);
    } finally {
        state.tableData.config.loading = false;
    }
};

// 组件挂载时获取域名选项
getDomainOptions();
</script>

<style scoped lang="scss">
.container {
    height: 100%;
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;
}

// 状态样式
:deep(.status-pending) {
    color: #e6a23c;
    font-weight: 500;
}

:deep(.status-processing) {
    color: #409eff;
    font-weight: 500;
}

:deep(.status-resolved) {
    color: #67c23a;
    font-weight: 500;
}

:deep(.status-closed) {
    color: #909399;
    font-weight: 500;
}
</style>
