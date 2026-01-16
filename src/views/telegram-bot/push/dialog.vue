<template>
    <div style="min-width: 800px;">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" v-loading="loading">
            <el-tabs v-model="activeTab">
                <!-- 基本信息 -->
                <el-tab-pane label="基本信息" name="basic">
                    <el-form-item label="任务名称" prop="task_name">
                        <el-input v-model="form.task_name" placeholder="请输入任务名称" :disabled="isView" />
                    </el-form-item>

                    <el-form-item label="机器人" prop="bot_name">
                        <el-select v-model="form.bot_name" placeholder="选择机器人" style="width: 100%;" :disabled="isView"
                            @change="handleBotChange">
                            <el-option v-for="bot in botList" :key="bot.bot_name" :label="bot.platform_name"
                                :value="bot.bot_name" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="推送内容" prop="push_content">
                        <MultiLangRichEditor v-model="form.push_content" />
                    </el-form-item>

                    <el-form-item label="推送图片">
                        <ImageUpload v-model="form.push_image" :disabled="isView" />
                    </el-form-item>

                    <el-form-item label="推送按钮">
                        <div style="width: 100%;">
                            <el-button size="small" @click="addButtonRow" v-if="!isView">+ 添加按钮行</el-button>
                            <div v-for="(row, rowIndex) in form.push_buttons" :key="rowIndex"
                                style="margin-top: 10px; border: 1px solid #dcdfe6; padding: 10px; border-radius: 4px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                    <span>第 {{ rowIndex + 1 }} 行</span>
                                    <el-button size="small" type="danger" text @click="removeButtonRow(rowIndex)"
                                        v-if="!isView">删除行</el-button>
                                </div>
                                <el-row :gutter="10">
                                    <el-col :span="12" v-for="(btn, btnIndex) in row" :key="'btn-' + btnIndex">
                                        <el-card shadow="never" size="small">
                                            <template #header>
                                                <div style="display: flex; justify-content: space-between;">
                                                    <span>按钮 {{ Number(btnIndex) + 1 }}</span>
                                                    <el-button size="small" type="danger" text
                                                        @click="removeButton(rowIndex, Number(btnIndex))"
                                                        v-if="!isView">
                                                        删除
                                                    </el-button>
                                                </div>
                                            </template>
                                            <el-form-item label="文本" label-width="60px">
                                                <el-input v-model="btn.text" size="small" :disabled="isView" />
                                            </el-form-item>
                                            <el-form-item label="链接" label-width="60px">
                                                <el-input v-model="btn.url" size="small" :disabled="isView" />
                                            </el-form-item>
                                        </el-card>
                                    </el-col>
                                    <el-col :span="12" v-if="row.length < 2 && !isView">
                                        <el-button style="width: 100%; height: 100%; min-height: 120px;" dashed
                                            @click="addButton(rowIndex)">
                                            + 添加按钮
                                        </el-button>
                                    </el-col>
                                </el-row>
                            </div>
                        </div>
                    </el-form-item>

                    <el-form-item label="状态" prop="status">
                        <el-radio-group v-model="form.status" :disabled="isView">
                            <el-radio :label="0">禁用</el-radio>
                            <el-radio :label="1">启用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-tab-pane>

                <!-- 调度配置 -->
                <el-tab-pane label="调度配置" name="schedule">
                    <el-form-item label="调度类型" prop="schedule_type">
                        <el-radio-group v-model="form.schedule_type" :disabled="isView">
                            <el-radio v-for="item in scheduleTypes" :key="item.value" :label="item.value">
                                {{ item.label }}
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item label="执行日期" v-if="form.schedule_type === 'once'" prop="schedule_date">
                        <el-date-picker v-model="form.schedule_date" type="datetime" placeholder="选择执行日期时间"
                            style="width: 100%;" :disabled="isView" />
                    </el-form-item>

                    <el-form-item label="执行时间" v-if="form.schedule_type !== 'once'" prop="schedule_time">
                        <el-time-picker v-model="scheduleTime" format="HH:mm" placeholder="选择执行时间" style="width: 200px;"
                            :disabled="isView" />
                    </el-form-item>

                    <el-form-item label="执行星期" v-if="form.schedule_type === 'weekly'" prop="schedule_days">
                        <el-checkbox-group v-model="scheduleDaysArray" :disabled="isView">
                            <el-checkbox v-for="day in weekDays" :key="day.value" :value="day.value">
                                {{ day.label }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>

                <!-- 目标用户 -->
                <el-tab-pane label="目标用户" name="target">
                    <el-form-item label="目标类型" prop="target_type">
                        <el-radio-group v-model="form.target_type" :disabled="isView">
                            <el-radio v-for="item in targetTypes" :key="item.value" :label="item.value">
                                {{ item.label }}
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item label="时间范围" v-if="form.target_type === 'new' || form.target_type === 'old'"
                        prop="target_days">
                        <el-input-number v-model="form.target_days" :min="1" :max="365" style="width: 200px;"
                            :disabled="isView" />
                        <span style="margin-left: 10px;">天</span>
                        <div class="help-text">
                            {{ form.target_type === 'new' ? '最近N天注册的用户' : 'N天前注册的用户' }}
                        </div>
                    </el-form-item>

                    <el-form-item label="自定义用户" v-if="form.target_type === 'custom'">
                        <el-input v-model="customUserIds" type="textarea" :rows="3" placeholder="输入用户ID，每行一个或用逗号分隔"
                            :disabled="isView" />
                    </el-form-item>

                    <el-form-item label="选择群组" v-if="form.target_type === 'group'" prop="target_user_ids">
                        <el-select v-model="form.target_user_ids" multiple placeholder="请选择群组" style="width: 100%;"
                            :disabled="isView">
                            <el-option v-for="group in groupList" :key="group.chat_id" 
                                :label="group.chat_title || group.chat_id" 
                                :value="group.chat_id">
                                <span style="float: left">{{ group.chat_title || '未命名群组' }}</span>
                                <span style="float: right; color: #8492a6; font-size: 13px">{{ group.chat_id }}</span>
                            </el-option>
                        </el-select>
                        <div class="help-text">
                            选择要推送的群组，机器人必须在群组中且是活跃状态
                        </div>
                    </el-form-item>
                </el-tab-pane>

                <!-- 推送控制 -->
                <!-- <el-tab-pane label="推送控制" name="control">
                    <el-form-item label="批次大小" prop="batch_size">
                        <el-input-number v-model="form.batch_size" :min="1" :max="500" style="width: 200px;"
                            :disabled="isView" />
                        <span style="margin-left: 10px;">条/批</span>
                        <div class="help-text">每批次发送的消息数量</div>
                    </el-form-item>

                    <el-form-item label="批次间隔" prop="batch_interval">
                        <el-input-number v-model="form.batch_interval" :min="0" :max="60" style="width: 200px;"
                            :disabled="isView" />
                        <span style="margin-left: 10px;">秒</span>
                        <div class="help-text">每批次之间的等待时间</div>
                    </el-form-item>

                    <el-form-item label="最大重试" prop="max_retry">
                        <el-input-number v-model="form.max_retry" :min="0" :max="10" style="width: 200px;"
                            :disabled="isView" />
                        <span style="margin-left: 10px;">次</span>
                        <div class="help-text">发送失败后的最大重试次数</div>
                    </el-form-item>
                </el-tab-pane> -->
            </el-tabs>

            <el-form-item style="margin-top: 30px;" v-if="!isView">
                <el-button @click="dialogInstance.close">取 消</el-button>
                <el-button type="primary" @click="onSubmit" :loading="loading">确 定</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts" name="pushTaskDialog">
import { ref, reactive, computed, watch, onMounted, defineAsyncComponent, inject } from 'vue';
import { ElMessage } from 'element-plus';
import { createPushTask, updatePushTask, scheduleTypes, targetTypes, weekDays } from '@/api/telegramPush';
import { getAllTelegramBots, getTelegramBotGroups } from '@/api/telegramBot';

const ImageUpload = defineAsyncComponent(() => import('../list/ImageUpload.vue'));
const MultiLangRichEditor = defineAsyncComponent(() => import('@/components/MultiLangRichEditor/only.vue'));

const dialogInstance = inject('dialogInstance') as any;

const props = defineProps({
    type: {
        type: String,
        default: 'add'
    },
    data: {
        type: Object,
        default: () => null
    }
});

const loading = ref(false);
const formRef = ref();
const activeTab = ref('basic');
const botList = ref<any[]>([]);
const groupList = ref<any[]>([]);

const title = computed(() => {
    if (props.type === 'view') return '查看推送任务';
    if (props.type === 'edit') return '编辑推送任务';
    return '创建推送任务';
});

const isView = computed(() => props.type === 'view');

const form = reactive({
    id: 0,
    task_name: '',
    bot_name: '',
    push_content: '',
    push_image: '',
    push_buttons: [] as any[],
    schedule_type: 'daily',
    schedule_time: '',
    schedule_days: '',
    schedule_date: null as any,
    target_type: 'all',
    target_days: 7,
    target_user_ids: [] as number[],
    batch_size: 100,
    batch_interval: 1,
    max_retry: 3,
    status: 1
});

const rules = {
    task_name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
    bot_name: [{ required: true, message: '请选择机器人', trigger: 'change' }],
    push_content: [{ required: true, message: '请输入推送内容', trigger: 'blur' }],
    schedule_type: [{ required: true, message: '请选择调度类型', trigger: 'change' }],
    target_type: [{ required: true, message: '请选择目标类型', trigger: 'change' }],
};

// 时间选择器的绑定值
const scheduleTime = ref<Date>();
const scheduleDaysArray = ref<number[]>([]);
const customUserIds = ref('');

// 监听时间选择器变化
watch(scheduleTime, (val) => {
    if (val) {
        const hours = val.getHours().toString().padStart(2, '0');
        const minutes = val.getMinutes().toString().padStart(2, '0');
        form.schedule_time = `${hours}:${minutes}`;
    }
});

// 监听星期选择变化
watch(scheduleDaysArray, (val) => {
    form.schedule_days = val.join(',');
});

// 监听自定义用户ID变化
watch(customUserIds, (val) => {
    if (form.target_type === 'custom') {
        if (val) {
            const ids = val.split(/[,\n]/).map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            form.target_user_ids = ids;
        } else {
            form.target_user_ids = [];
        }
    }
});

// 监听目标类型变化
watch(() => form.target_type, (val) => {
    if (val === 'group') {
        loadGroupList();
        // 如果是从其他类型切换过来，且不是编辑回显（这里简单处理，如果是group类型但ids为空则可能是新切换）
        // 实际上表单初始化时如果类型是group，ids会有值
    } else if (val === 'custom') {
        // 如果切换回 custom，且 target_user_ids 有值（可能来自 group），这里 customUserIds 需要同步吗？
        // 通常切换类型会清空 target_user_ids，除非是编辑状态下初始化
        if (form.target_user_ids.length > 0 && !customUserIds.value) {
             customUserIds.value = form.target_user_ids.join('\n');
        }
    }
});

// 加载群组列表
const loadGroupList = async () => {
    if (!form.bot_name) {
        if (form.target_type === 'group') {
             ElMessage.warning('请先选择机器人');
        }
        groupList.value = [];
        return;
    }
    
    try {
        const res = await getTelegramBotGroups({ bot_name: form.bot_name });
        groupList.value = res.data || [];
    } catch (error) {
        console.error('加载群组列表失败:', error);
    }
};

onMounted(() => {
    loadBotList();
    if (props.data) {
        initForm(props.data);
    }
});

// 加载机器人列表
const loadBotList = async () => {
    try {
        const res = await getAllTelegramBots();
        botList.value = res.data || [];
    } catch (error) {
        console.error('加载机器人列表失败:', error);
    }
};

// 初始化表单
const initForm = (data: any) => {
    Object.assign(form, {
        id: data.id || 0,
        task_name: data.task_name || '',
        bot_name: data.bot_name || '',
        push_content: data.push_content || '',
        push_image: data.push_image || '',
        push_buttons: data.push_buttons || [],
        schedule_type: data.schedule_type || 'daily',
        schedule_time: data.schedule_time || '',
        schedule_days: data.schedule_days || '',
        schedule_date: data.schedule_date || null,
        target_type: data.target_type || 'all',
        target_days: data.target_days || 7,
        target_user_ids: data.target_user_ids || [],
        batch_size: data.batch_size || 100,
        batch_interval: data.batch_interval || 1,
        max_retry: data.max_retry || 3,
        status: data.status ?? 1
    });

    // 初始化时间选择器
    if (form.schedule_time) {
        const [hours, minutes] = form.schedule_time.split(':');
        scheduleTime.value = new Date();
        scheduleTime.value.setHours(parseInt(hours));
        scheduleTime.value.setMinutes(parseInt(minutes));
    }

    // 初始化星期选择
    if (form.schedule_days) {
        scheduleDaysArray.value = form.schedule_days.split(',').map(d => parseInt(d));
    }

    // 初始化自定义用户ID
    if (form.target_type === 'custom' && form.target_user_ids && form.target_user_ids.length > 0) {
        customUserIds.value = form.target_user_ids.join('\n');
    }
    
    // 如果是群组类型，加载群组列表
    if (form.target_type === 'group' && form.bot_name) {
        loadGroupList();
    }
};

// 机器人切换
const handleBotChange = () => {
    // 可以在这里加载机器人相关的统计数据
    
    // 如果当前选的是群组类型，重新加载群组
    if (form.target_type === 'group') {
        form.target_user_ids = []; // 切换机器人清空已选群组
        loadGroupList();
    }
};

// 添加按钮行
const addButtonRow = () => {
    form.push_buttons.push([]);
};

// 删除按钮行
const removeButtonRow = (index: number) => {
    form.push_buttons.splice(index, 1);
};

// 添加按钮
const addButton = (rowIndex: number) => {
    form.push_buttons[rowIndex].push({ text: '', url: '' });
};

// 删除按钮
const removeButton = (rowIndex: number, btnIndex: number) => {
    form.push_buttons[rowIndex].splice(btnIndex, 1);
};

// 提交
const onSubmit = async () => {
    try {
        await formRef.value?.validate();

        loading.value = true;

        const data = { ...form };

        // 处理按钮数据，移除空按钮
        if (data.push_buttons && data.push_buttons.length > 0) {
            data.push_buttons = data.push_buttons
                .map(row => row.filter((btn: any) => btn.text && btn.url))
                .filter(row => row.length > 0);
        }

        // 处理执行日期时间，转换为本地时间字符串（避免时区问题）
        if (data.schedule_date && data.schedule_date instanceof Date) {
            const year = data.schedule_date.getFullYear();
            const month = String(data.schedule_date.getMonth() + 1).padStart(2, '0');
            const day = String(data.schedule_date.getDate()).padStart(2, '0');
            const hours = String(data.schedule_date.getHours()).padStart(2, '0');
            const minutes = String(data.schedule_date.getMinutes()).padStart(2, '0');
            const seconds = String(data.schedule_date.getSeconds()).padStart(2, '0');
            data.schedule_date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        const apiFunc = props.type === 'edit' ? updatePushTask : createPushTask;
        const res = await apiFunc(data);

        ElMessage.success(props.type === 'edit' ? '更新成功' : '创建成功');
        dialogInstance.$emit('success');
        dialogInstance.$close();
    } catch (error: any) {
        if (error !== false) {
            ElMessage.error(error.message || '操作失败');
        }
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped lang="scss">
.help-text {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
}
</style>
