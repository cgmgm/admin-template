<template>
    <div class="log-container">
        <!-- 任务信息 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
            <template #header>
                <span>任务信息</span>
            </template>
            <el-descriptions :column="3" border>
                <el-descriptions-item label="任务名称">{{ task.task_name }}</el-descriptions-item>
                <el-descriptions-item label="机器人">{{ task.bot_name }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                    <el-tag v-if="task.status === 0" type="info">禁用</el-tag>
                    <el-tag v-else-if="task.status === 1" type="success">启用</el-tag>
                    <el-tag v-else type="warning">执行中</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="总发送">{{ task.total_sent || 0 }}</el-descriptions-item>
                <el-descriptions-item label="成功">
                    <el-text type="success">{{ task.total_success || 0 }}</el-text>
                </el-descriptions-item>
                <el-descriptions-item label="失败">
                    <el-text type="danger">{{ task.total_failed || 0 }}</el-text>
                </el-descriptions-item>
                <el-descriptions-item label="最后执行">{{ task.last_run_at || '-' }}</el-descriptions-item>
                <el-descriptions-item label="下次执行">{{ task.next_run_at || '-' }}</el-descriptions-item>
            </el-descriptions>
        </el-card>

        <!-- 筛选 -->
        <el-card shadow="never" style="margin-bottom: 20px;">
            <el-form inline>
                <el-form-item label="状态">
                    <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 150px;">
                        <el-option label="待发送" :value="0" />
                        <el-option label="成功" :value="1" />
                        <el-option label="失败" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 日志列表 -->
        <el-card shadow="never">
            <el-table :data="tableData" border v-loading="loading" max-height="400">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="user_id" label="用户ID" width="120" />
                <el-table-column prop="chat_id" label="Chat ID" width="120" />
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag v-if="row.status === 0" type="info">待发送</el-tag>
                        <el-tag v-else-if="row.status === 1" type="success">成功</el-tag>
                        <el-tag v-else type="danger">失败</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="错误信息" min-width="200">
                    <template #default="{ row }">
                        <el-text v-if="row.error_msg" type="danger" line-clamp="2">
                            {{ row.error_msg }}
                        </el-text>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column prop="retry_count" label="重试次数" width="100" />
                <el-table-column prop="sent_at" label="发送时间" width="160" />
                <el-table-column prop="created_at" label="创建时间" width="160" />
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.page_size"
                    :page-sizes="[15, 30, 50, 100]" :total="pagination.total"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts" name="pushLogDialog">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getPushLogs } from '@/api/telegramPush';

const props = defineProps({
    task: {
        type: Object,
        required: true
    }
});

const loading = ref(false);
const tableData = ref<any[]>([]);

const searchForm = reactive({
    status: ''
});

const pagination = reactive({
    page: 1,
    page_size: 15,
    total: 0
});

onMounted(() => {
    loadData();
});

// 加载数据
const loadData = async () => {
    loading.value = true;
    try {
        const res = await getPushLogs({
            task_id: props.task.id,
            page: pagination.page,
            page_size: pagination.page_size,
            status: searchForm.status
        });
        tableData.value = res.data.list || [];
        pagination.total = res.data.total || 0;
    } catch (error: any) {
        ElMessage.error(error.message || '加载数据失败');
    } finally {
        loading.value = false;
    }
};

// 搜索
const handleSearch = () => {
    pagination.page = 1;
    loadData();
};

// 重置
const handleReset = () => {
    searchForm.status = '';
    pagination.page = 1;
    loadData();
};

// 分页
const handleSizeChange = (size: number) => {
    pagination.page_size = size;
    loadData();
};

const handleCurrentChange = (page: number) => {
    pagination.page = page;
    loadData();
};
</script>

<style scoped lang="scss">
.log-container {
    .pagination-container {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
