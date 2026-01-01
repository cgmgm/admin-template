<template>
    <div class="container layout-pd">
        <Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData" @valueChange="valueChange">
            <template #orBut>
                <el-button type="primary" plain @click="handleBack.add" v-auth="'新增机器人'">
                    新增机器人
                </el-button>
                <!-- <el-button type="success" plain @click="handleBack.batchImport" v-auth="'批量导入'">
                    批量导入
                </el-button>
                <el-button type="info" plain @click="handleBack.export" v-auth="'导出配置'">
                    导出配置
                </el-button> -->
            </template>
        </Table>
    </div>
</template>

<script setup lang="tsx" name="telegramBotList">
import { defineAsyncComponent, reactive, shallowRef } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createActionColumn } from '@/components/table/template';
import type { TableData } from '@/components/table/types';
import { getTelegramBots as getList, delTelegramBot, updateTelegramBotStatus, getBotStatusText, botStatusOptions, exportTelegramBots, setWebhook, unsetWebhook } from '@/api/telegramBot';
import { ElMessageBox, ElMessage, ElSwitch } from 'element-plus';
import Dialog from './dialog.vue';
import ImportDialog from './import-dialog.vue';

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
        ElMessageBox.confirm('是否确认删除该机器人配置?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            delTelegramBot({ id: e.id }).then(() => {
                getTableData(queryParams);
                ElMessage.success('删除成功');
            });
        });
    },
    setWebhook: (e: any) => {
        ElMessageBox.confirm(`是否为机器人 ${e.bot_name} 启动 Webhook?`, '确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
        }).then(() => {
            setWebhook({ bot_name: e.bot_name }).then((res: any) => {
                ElMessage.success('Webhook 启动成功');
            })
        });
    },
    unsetWebhook: (e: any) => {
        ElMessageBox.confirm(`是否为机器人 ${e.bot_name} 停止 Webhook?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            unsetWebhook({ bot_name: e.bot_name }).then((res: any) => {
                ElMessage.success('Webhook 停止成功');
            })
        });
    },
    batchImport: () => {
        openImportDialog();
    },
    export: () => {
        exportTelegramBots({}).then((res: any) => {
            if (res.code === 200) {
                // 下载 JSON 文件
                const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `telegram_bots_${new Date().getTime()}.json`;
                link.click();
                window.URL.revokeObjectURL(url);
                ElMessage.success('导出成功');
            }
        });
    }
}

const actionBack = (item: any, row: any) => {
    handleBack[item.key as keyof typeof handleBack]?.(row);
}

// 格式化状态显示
const formatStatus = (status: number) => {
    return getBotStatusText(status);
};

// 状态切换
const handleStatusChange = async (row: any) => {
    try {
        await updateTelegramBotStatus({ id: row.id, status: row.status });
        ElMessage.success('状态更新成功');
        getTableData(queryParams);
    } catch (error) {
        ElMessage.error('状态更新失败');
        row.status = row.status === 1 ? 0 : 1;
    }
};

const state = reactive<{ tableData: TableData }>({
    tableData: createTableConfig({
        columns: [
            createColumn('机器人标识', 'bot_name'),
            createColumn('平台名称', 'platform_name'),
            createColumn('机器人用户名', 'name'),
            createColumn('版本号', 'version'),
            createColumn('主站ID', 'master_id'),
            createColumn('客服属性', 'service_attr'),
            {
                ...createColumn('状态', 'status'),
                render: (row: any) => {
                    return (
                        <ElSwitch
                            v-model={row.status}
                            active-value={1}
                            inactive-value={0}
                            onChange={() => handleStatusChange(row)}
                        />
                    );
                }
            },
            createColumn('创建时间', 'created_at', { width: 160 }),
            createActionColumn([
                { key: 'edit', text: '修改', onClick: actionBack, auth: '修改机器人', icon: 'Edit' },
                { key: 'setWebhook', text: '启动Webhook', onClick: actionBack, auth: '启动Webhook', icon: 'VideoPlay', type: 'success' },
                { key: 'unsetWebhook', text: '停止Webhook', onClick: actionBack, auth: '停止Webhook', icon: 'VideoPause', type: 'warning' },
                { key: 'delete', text: '删除', onClick: actionBack, auth: '删除机器人', icon: 'Delete', poptext: '是否确认删除？' }
            ]),
        ],
        search: [
            createSearchItem('关键词', 'keyword', 'input', {
                placeholder: '请输入机器人标识/平台名称/用户名'
            }),
            createSearchItem('状态', 'status', 'select', {
                placeholder: '请选择状态',
                options: [
                    { label: '全部', value: '' },
                    ...botStatusOptions
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
    (window as any).$dialog(row ? '编辑机器人' : '添加机器人', Dialog, { type, data: row })
        .$on('success', () => {
            getTableData(queryParams);
        });
};

const openImportDialog = () => {
    (window as any).$dialog('批量导入机器人', ImportDialog, {})
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
        console.error('获取机器人列表失败:', error);
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
