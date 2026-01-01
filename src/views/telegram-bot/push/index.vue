<template>
    <div class="container layout-pd">
        <!-- 用户统计卡片 -->
        <el-row :gutter="20" style="margin-bottom: 20px;" v-if="currentBotName">
            <el-col :span="8">
                <el-card shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>总用户数</span>
                        </div>
                    </template>
                    <div class="stat-number">{{ userStats.total_users || 0 }}</div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>7天新用户</span>
                        </div>
                    </template>
                    <div class="stat-number">{{ userStats.new_users_7d || 0 }}</div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-card shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <span>30天新用户</span>
                        </div>
                    </template>
                    <div class="stat-number">{{ userStats.new_users_30d || 0 }}</div>
                </el-card>
            </el-col>
        </el-row>

        <Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData">
            <template #orBut>
                <el-button type="primary" plain @click="handleBack.add" v-auth="'创建推送任务'">
                    创建推送任务
                </el-button>
            </template>
        </Table>
    </div>
</template>

<script setup lang="tsx" name="telegramPush">
import { defineAsyncComponent, reactive, ref } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createActionColumn } from '@/components/table/template';
import type { TableData } from '@/components/table/types';
import { getPushTasks, deletePushTask, executePushTask, getUserStats, statusOptions } from '@/api/telegramPush';
import { getAllTelegramBots } from '@/api/telegramBot';
import { ElMessageBox, ElMessage } from 'element-plus';

// 引入组件
const Table = defineAsyncComponent(() => import('@/components/table/index.vue'));

const currentBotName = ref('');
const userStats = ref({
    total_users: 0,
    new_users_7d: 0,
    new_users_30d: 0
});

const botListOptions = ref<any[]>([]);

// 加载机器人列表
const loadBotList = async () => {
    try {
        const res = await getAllTelegramBots();
        botListOptions.value = (res.data || []).map((bot: any) => ({
            label: bot.platform_name,
            value: bot.bot_name
        }));
        // 更新搜索选项
        if (state.tableData.search && state.tableData.search[0]) {
            state.tableData.search[0].options = [
                { label: '全部', value: '' },
                ...botListOptions.value
            ];
        }
    } catch (error) {
        console.error('加载机器人列表失败:', error);
    }
};

// 加载用户统计
const loadUserStats = async (botName: string) => {
    if (!botName) {
        currentBotName.value = '';
        userStats.value = { total_users: 0, new_users_7d: 0, new_users_30d: 0 };
        return;
    }

    currentBotName.value = botName;
    try {
        const res = await getUserStats({ bot_name: botName });
        userStats.value = res.data;
    } catch (error) {
        console.error('加载用户统计失败:', error);
    }
};

// 初始化加载机器人列表
loadBotList();

const handleBack = {
    add: (e?: any) => {
        openDialog('add', e);
    },
    view: (e: any) => {
        openDialog('view', e);
    },
    edit: (e: any) => {
        openDialog('edit', e);
    },
    delete: (e?: any) => {
        ElMessageBox.confirm('确定要删除这个推送任务吗?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            deletePushTask({ id: e.id }).then(() => {
                getTableData(queryParams);
                ElMessage.success('删除成功');
            });
        });
    },
    execute: (e: any) => {
        ElMessageBox.confirm(`确定要立即执行推送任务"${e.task_name}"吗?`, '确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
        }).then(() => {
            executePushTask({ id: e.id }).then((res: any) => {
                ElMessage.success('任务执行成功');
                getTableData(queryParams);
            }).catch((error) => {
                ElMessage.error('执行失败: ' + (error.message || '未知错误'));
            });
        });
    },
    logs: (e: any) => {
        openLogDialog(e);
    }
};

const actionBack = (item: any, row: any) => {
    handleBack[item.key as keyof typeof handleBack]?.(row);
};

const state = reactive<{ tableData: TableData }>({
    tableData: createTableConfig({
        columns: [
            createColumn('ID', 'id', { width: 80 }),
            createColumn('任务名称', 'task_name', { width: 150 }),
            createColumn('机器人', 'bot_name', { width: 120 }),
            createColumn('推送内容', 'push_content', {
                template: (row: any) => {
                    return <div style="width:100%;white-space: nowrap;">{row.push_content}</div>;
                }
            }),
            createColumn('调度类型', 'schedule_type', {
                width: 100,
                template: (row: any) => {
                    const typeMap: Record<string, string> = {
                        'once': '单次',
                        'daily': '每日',
                        'weekly': '每周'
                    };
                    return <span>{typeMap[row.schedule_type] || '自定义'}</span>;
                }
            }),
            createColumn('执行时间', 'schedule_time', {
                width: 180,
                template: (row: any) => {
                    return <span>{row.schedule_type === 'once' ? row.schedule_date : row.schedule_time}</span>;
                }
            }),
            createColumn('下次执行', 'next_run_at', {
                width: 190,
                template: (row: any) => {
                    return <span>{row.schedule_type === 'once' ? row.schedule_date : row.next_run_at}</span>;
                }
            }),
            createColumn('目标用户', 'target_type', {
                width: 100,
                template: (row: any) => {
                    const targetMap: Record<string, string> = {
                        'all': '全部',
                        'new': '新用户',
                        'old': '老用户',
                        'custom': '自定义'
                    };
                    return <span>{targetMap[row.target_type] || '-'}</span>;
                }
            }),
            {
                ...createColumn('统计', 'total_sent', { width: 220 }),
                render: (row: any) => {
                    return `发送:${row.total_sent || 0} / 成功:${row.total_success || 0} / 失败:${row.total_failed || 0}`;
                }
            },
            {
                ...createColumn('状态', 'status', { width: 80 }),
                render: (row: any) => {
                    const statusMap: Record<number, string> = {
                        0: '禁用',
                        1: '启用',
                        2: '执行中'
                    };
                    return statusMap[row.status] || '-';
                }
            },
            createActionColumn([
                // { key: 'view', text: '查看', onClick: actionBack, auth: '查看任务详情', icon: 'View' },
                { key: 'edit', text: '编辑', onClick: actionBack, auth: '编辑推送任务', icon: 'Edit' },
                { key: 'execute', text: '立即执行', onClick: actionBack, auth: '立即执行任务', icon: 'VideoPlay', type: 'success' },
                { key: 'logs', text: '日志', onClick: actionBack, auth: '查看推送日志', icon: 'Document', type: 'warning' },
                { key: 'delete', text: '删除', onClick: actionBack, auth: '删除推送任务', icon: 'Delete', poptext: '是否确认删除？' }
            ]),
        ],
        search: [
            createSearchItem('机器人', 'bot_name', 'select', {
                placeholder: '请选择机器人',
                options: [
                    { label: '全部', value: '' }
                ],
                onChange: (value: string) => {
                    loadUserStats(value);
                }
            }),
            createSearchItem('状态', 'status', 'select', {
                placeholder: '请选择状态',
                options: [
                    { label: '全部', value: '' },
                    ...statusOptions
                ]
            }),
        ],
        config: {
            isSerialNo: true,
        }
    }),
});

let queryParams = {} as any;

const Dialog = defineAsyncComponent(() => import('./dialog.vue'));
const LogDialog = defineAsyncComponent(() => import('./log-dialog.vue'));

const openDialog = (type?: string, row?: any) => {
    (window as any).$dialog(row ? (type === 'view' ? '查看推送任务' : '编辑推送任务') : '创建推送任务', Dialog, { type, data: row })
        .$on('success', () => {
            getTableData(queryParams);
        });
};

const openLogDialog = (row: any) => {
    (window as any).$dialog('推送日志 - ' + row.task_name, LogDialog, { task: row });
};

const getTableData = async (params: any) => {
    queryParams = params;
    state.tableData.config.loading = true;
    try {
        const res = await getPushTasks(params);
        state.tableData.data = res.data.list;
        state.tableData.config.total = res.data.total;
    } catch (error) {
        console.error('获取推送任务列表失败:', error);
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

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
    }

    .stat-number {
        font-size: 32px;
        font-weight: bold;
        text-align: center;
        color: var(--el-color-primary);
        padding: 20px 0;
    }
}
</style>
