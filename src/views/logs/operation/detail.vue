<template>
    <div class="log-detail">
        <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">{{ data.username }}</el-descriptions-item>
            <el-descriptions-item label="操作模块">{{ data.module }}</el-descriptions-item>
            <el-descriptions-item label="操作类型">{{ data.action }}</el-descriptions-item>
            <el-descriptions-item label="请求方法">{{ data.method }}</el-descriptions-item>
            <el-descriptions-item label="请求URL">{{ data.url }}</el-descriptions-item>
            <el-descriptions-item label="IP地址">{{ data.ip }}</el-descriptions-item>
            <el-descriptions-item label="状态码">
                <el-tag :type="data.status_code === 200 ? 'success' : 'danger'">{{ data.status_code }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="执行时间">{{ data.execution_time }}ms</el-descriptions-item>
            <el-descriptions-item label="操作时间">{{ data.created_at }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ data.remark }}</el-descriptions-item>
            <el-descriptions-item label="用户代理" :span="2">{{ data.user_agent }}</el-descriptions-item>
            <el-descriptions-item label="请求数据" :span="2">
                <pre>{{ data.request_data ? JSON.stringify(data.request_data, null, 2) : '-' }}</pre>
            </el-descriptions-item>
            <el-descriptions-item label="响应数据" :span="2">
                <pre>{{ data.response_data ? JSON.stringify(data.response_data, null, 2) : '-' }}</pre>
            </el-descriptions-item>
        </el-descriptions>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getOperationLogDetail } from '@/api/system';
import { ElMessage } from 'element-plus';

const props = defineProps({
    id: {
        type: [Number, String],
        default: ''
    }
});

const data = ref<any>({});

// 获取日志详情
const getDetail = async () => {
    try {
        if (!props.id) return;
        const res = await getOperationLogDetail({ id: props.id });
        data.value = res.data;
    } catch (error) {
        ElMessage.error('获取日志详情失败');
    }
};

onMounted(() => {
    getDetail();
});
</script>

<style scoped>
.log-detail {
    padding: 10px;
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