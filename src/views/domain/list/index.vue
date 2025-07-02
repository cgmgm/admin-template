<template>
    <div class="container layout-pd">
        <Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData" @valueChange="valueChange">
            <template #orBut>
                <el-button type="primary" plain @click="handleBack.add" v-auth="'保存域名'">
                    新增域名
                </el-button>
            </template>
        </Table>
    </div>
</template>

<script setup lang="tsx" name="domainList">
import { defineAsyncComponent, reactive } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createActionColumn } from '@/components/table/template';
import type { TableData } from '@/components/table/types';
import { getDomains as getList, delDomain, getDomainStatusText, domainStatusOptions } from '@/api/domain';
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
        ElMessageBox.confirm('是否确认删除该域名?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            delDomain({ id: e.id }).then(() => {
                getTableData(queryParams);
                ElMessage.success('删除成功');
            });
        });
    },
}

const actionBack = (item: any, row: any) => {
    handleBack[item.key as keyof typeof handleBack]?.(row);
}

// 格式化关键词显示
const formatKeywords = (keywords: string[]) => {
    if (!keywords || !Array.isArray(keywords)) return '-';
    return keywords.join(', ');
};

// 格式化状态显示
const formatStatus = (status: number) => {
    return getDomainStatusText(status);
};

const state = reactive<{ tableData: TableData }>({
    tableData: createTableConfig({
        columns: [
            createColumn('域名', 'domain'),
            createColumn('模板名称', 'template_name'),
            {
                ...createColumn('关键词', 'keywords'),
                formatter: (row: any) => formatKeywords(row.keywords)
            },
            {
                ...createColumn('状态', 'status'),
                formatter: (row: any) => formatStatus(row.status)
            },
            createColumn('备注', 'remark'),
            createColumn('创建时间', 'created_at'),
            createActionColumn([
                { key: 'edit', text: '修改', onClick: actionBack, auth: '保存域名', icon: 'Edit' },
                { key: 'delete', text: '删除', onClick: actionBack, auth: '删除域名', icon: 'Delete', poptext: '是否确认删除？' }
            ]),
        ],
        search: [
            createSearchItem('域名', 'keyword', 'input', {
                placeholder: '请输入域名关键词'
            }),
            createSearchItem('状态', 'status', 'select', {
                placeholder: '请选择状态',
                options: [
                    { label: '全部', value: '' },
                    ...domainStatusOptions
                ]
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
    (window as any).$dialog(row ? '编辑域名' : '添加域名', Dialog, { type, data: row })
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
        console.error('获取域名列表失败:', error);
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
</style>
