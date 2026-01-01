<template>
    <div class="container layout-pd">
        <Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData"></Table>
    </div>
</template>

<script setup lang="tsx" name="telegramPush">
import { defineAsyncComponent, reactive, ref } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createActionColumn } from '@/components/table/template';
import type { TableData } from '@/components/table/types';
import { userStatusOptions } from '@/api/telegramPush';
import { getAllTelegramBots, getTelegramBotUsers } from '@/api/telegramBot';
import { ElMessageBox, ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import commonFunction from '@/utils/commonFunction';
// 引入组件
const Table = defineAsyncComponent(() => import('@/components/table/index.vue'));

const currentBotName = ref('');
const { copyText } = commonFunction();

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

// 初始化加载机器人列表
loadBotList();

const handleBack = {
};


const state = reactive<{ tableData: TableData }>({
    tableData: createTableConfig({
        columns: [
            createColumn('ID', 'id', { width: 80 }),
            createColumn('机器人', 'bot_name'),
            createColumn('用户ID', 'user_id', {
                template: (row: any) => {
                    return <span class="c" onClick={() => copyText(row.user_id)}>{row.user_id}</span>;
                }
            }),
            createColumn('用户名', 'username'),
            createColumn('姓名', 'first_name'),
            createColumn('姓氏', 'last_name'),
            createColumn('活跃状态', 'is_active', {
                template: (row: any) => {
                    const typeMap: Record<string, string> = {
                        '1': '活跃',
                        '0': '不活跃'
                    };
                    return <span>{typeMap[row.is_active] || ''}</span>;
                }
            }),
            createColumn('禁用截止时间', 'blocked_at', {
                template: (row: any) => {
                    if (row.blocked_at) {
                        // 加7天
                        return <span>{dayjs(row.blocked_at).add(7, 'day').format('YYYY-MM-DD HH:mm:ss')}</span>;
                    }
                    return <span>--</span>;
                }
            }),
        ],
        search: [
            createSearchItem('机器人', 'bot_name', 'select', {
                placeholder: '请选择机器人',
                options: [
                    { label: '全部', value: '' }
                ]
            }),
            createSearchItem('状态', 'is_active', 'select', {
                placeholder: '请选择状态',
                options: [
                    { label: '全部', value: '' },
                    ...userStatusOptions
                ]
            }),
        ],
        config: {
            isSerialNo: true,
        }
    }),
});

let queryParams = {} as any;

const getTableData = async (params: any) => {
    queryParams = params;
    state.tableData.config.loading = true;
    try {
        const res = await getTelegramBotUsers(params);
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
