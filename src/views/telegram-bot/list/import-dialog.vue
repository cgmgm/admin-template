<template>
    <div class="import-dialog-container">
        <el-alert title="批量导入说明" type="info" :closable="false" style="margin-bottom: 20px;">
            <template #default>
                <div>1. 请上传 JSON 格式的配置文件</div>
                <div>2. 或直接在下方文本框中粘贴 JSON 配置</div>
                <div>3. JSON 格式示例见下方</div>
            </template>
        </el-alert>

        <el-form ref="formRef" label-width="100px">
            <el-form-item label="上传文件">
                <el-upload class="upload-demo" :auto-upload="false" :on-change="handleFileChange" :limit="1"
                    accept=".json">
                    <el-button type="primary">选择文件</el-button>
                    <template #tip>
                        <div class="el-upload__tip">只能上传 JSON 文件</div>
                    </template>
                </el-upload>
            </el-form-item>

            <el-form-item label="JSON 配置">
                <el-input v-model="jsonConfig" type="textarea" :rows="15" placeholder="请粘贴或上传 JSON 配置" />
            </el-form-item>

            <el-form-item>
                <el-button @click="onCancel">取 消</el-button>
                <el-button type="primary" @click="onSubmit" :loading="loading">确 定</el-button>
                <el-button type="info" @click="showExample">查看示例</el-button>
            </el-form-item>
        </el-form>

        <!-- 示例 JSON -->
        <el-dialog v-model="exampleVisible" title="JSON 配置示例" width="700px">
            <pre
                style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto;">{{ exampleJson }}</pre>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="importDialog">
import { ref, inject } from 'vue';
import { batchImportTelegramBots } from '@/api/telegramBot';
import { ElMessage } from 'element-plus';

const dialogInstance = inject('dialogInstance');

const formRef = ref<any>();
const loading = ref(false);
const jsonConfig = ref('');
const exampleVisible = ref(false);

// 示例 JSON
const exampleJson = {
    "bots": [
        {
            "bot_name": "test_bot",
            "platform_name": "测试平台",
            "version": "1.0.0",
            "master_id": 100,
            "service_attr": "@test_service",
            "token": "123456:ABC-DEF",
            "name": "testbot",
            "chat_id": "123",
            "channel": "https://t.me/test_channel",
            "service": "https://t.me/test_service",
            "game_url": "https://game.example.com",
            "start_img": "https://example.com/start.jpg",
            "service_img": "https://example.com/service.jpg",
            "channel_img": "https://example.com/channel.jpg",
            "togame_img": "https://example.com/game.jpg",
            "event_img": "https://example.com/event.jpg",
            "selected_buttons": ["start_game", "profile", "channel", "service"],
            "custom_buttons": [
                {
                    "icon": "❓",
                    "keywords": "帮助|Help",
                    "reply_text":  {},
                    "reply_image": null
                }
            ],
            "start_game_text": "xihuMessage",
            "status": 1
        }
    ]
};

// 文件选择处理
const handleFileChange = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
        jsonConfig.value = e.target.result;
    };
    reader.readAsText(file.raw);
};

// 显示示例
const showExample = () => {
    exampleVisible.value = true;
};

// 验证 JSON
const validateJson = () => {
    if (!jsonConfig.value.trim()) {
        ElMessage.error('请输入 JSON 配置');
        return false;
    }

    try {
        const data = JSON.parse(jsonConfig.value);
        if (!data.bots || !Array.isArray(data.bots)) {
            ElMessage.error('JSON 格式错误：缺少 bots 数组');
            return false;
        }
        if (data.bots.length === 0) {
            ElMessage.error('bots 数组不能为空');
            return false;
        }
        return true;
    } catch (e: any) {
        ElMessage.error('JSON 格式错误: ' + e.message);
        return false;
    }
};

// 提交
const onSubmit = async () => {
    if (!validateJson()) {
        return;
    }

    loading.value = true;
    try {
        const data = JSON.parse(jsonConfig.value);
        const res = await batchImportTelegramBots(data);

        if (res.code === 200) {
            const { success_count, failed_count, errors } = res.data;

            if (failed_count > 0) {
                ElMessage.warning(
                    `导入完成：成功 ${success_count} 个，失败 ${failed_count} 个。\n失败原因：${errors.join('; ')}`
                );
            } else {
                ElMessage.success(`成功导入 ${success_count} 个机器人配置`);
            }

            (dialogInstance as any)?.$emit('success');
            (dialogInstance as any)?.close();
        }
    } catch (error: any) {
        console.error('导入失败:', error);
        ElMessage.error('导入失败: ' + (error.message || '未知错误'));
    } finally {
        loading.value = false;
    }
};

// 取消
const onCancel = () => {
    (dialogInstance as any)?.close();
};
</script>

<style scoped lang="scss">
.import-dialog-container {
    padding: 20px;

    pre {
        font-family: 'Courier New', Courier, monospace;
        font-size: 12px;
        line-height: 1.5;
    }
}
</style>
