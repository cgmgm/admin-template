<template>
    <div class="telegram-bot-dialog-container">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px"
            style="max-height: 1000px; overflow-y: auto;">
            <el-tabs v-model="activeTab">
                <!-- 基础配置 -->
                <el-tab-pane label="基础配置" name="basic">
                    <el-form-item label="机器人标识" prop="bot_name">
                        <el-input v-model="form.bot_name" placeholder="请输入机器人标识（如：xihu）"
                            :disabled="props.type === 'edit'" />
                    </el-form-item>
                    <el-form-item label="平台名称" prop="platform_name">
                        <el-input v-model="form.platform_name" placeholder="请输入平台名称（如：西湖）" />
                    </el-form-item>
                    <el-form-item label="版本号" prop="version">
                        <el-input v-model="form.version" placeholder="请输入版本号（如：1.0.0）" />
                    </el-form-item>
                    <el-form-item label="主站ID" prop="master_id">
                        <el-input-number v-model="form.master_id" :min="1" placeholder="请输入主站ID" style="width: 100%;" />
                    </el-form-item>
                    <el-form-item label="客服属性" prop="service_attr">
                        <el-input v-model="form.service_attr" placeholder="请输入客服属性（如：@xihu0008）" />
                    </el-form-item>
                    <el-form-item label="Token" prop="token">
                        <el-input v-model="form.token" placeholder="请输入机器人Token" show-password />
                    </el-form-item>
                    <el-form-item label="机器人用户名" prop="name">
                        <el-input v-model="form.name" placeholder="请输入机器人用户名（如：xihuvipbot）" />
                    </el-form-item>
                    <el-form-item label="聊天ID" prop="chat_id">
                        <el-input v-model="form.chat_id" placeholder="请输入聊天ID" />
                    </el-form-item>
                    <el-form-item label="官方频道" prop="channel">
                        <el-input v-model="form.channel" placeholder="请输入官方频道链接（可选）" />
                    </el-form-item>
                    <el-form-item label="客服链接" prop="service">
                        <el-input v-model="form.service" placeholder="请输入客服链接（可选）" />
                    </el-form-item>
                    <el-form-item label="游戏URL" prop="game_url">
                        <el-input v-model="form.game_url" placeholder="请输入游戏URL（可选）" />
                    </el-form-item>
                    <el-form-item label="start回复图片" prop="start_img">
                        <ImageUpload v-model="form.start_img" />
                    </el-form-item>
                    <el-form-item label="start回复文案" prop="start_game_text">
                        <MultiLangRichEditor v-model="form.start_game_text" />
                    </el-form-item>
                    <el-form-item label="状态" prop="status">
                        <el-radio-group v-model="form.status">
                            <el-radio :label="1">启用</el-radio>
                            <el-radio :label="0">禁用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-tab-pane>

                <!-- 按钮配置 -->
                <el-tab-pane label="按钮配置" name="buttons">
                    <div class="button-config-container">
                        <div class="button-preview-area">
                            <div class="preview-header">
                                <span>按钮预览</span>
                                <el-button type="primary" size="small" @click="addButtonRow">
                                    + 添加新行
                                </el-button>
                            </div>

                            <div v-if="form.custom_buttons.length === 0" class="empty-state">
                                <el-empty description="暂无按钮，点击上方按钮添加新行" />
                            </div>

                            <div v-else class="button-rows" ref="rowsContainerRef">
                                <div v-for="(row, rowIndex) in form.custom_buttons" :key="rowIndex" class="button-row">
                                    <div class="row-header">
                                        <span>第 {{ rowIndex + 1 }} 行</span>
                                        <div class="row-actions">
                                            <el-button type="primary" size="small" text
                                                @click="addButtonToRow(rowIndex)">
                                                + 添加按钮
                                            </el-button>
                                            <el-button type="danger" size="small" text @click="removeRow(rowIndex)">
                                                删除行
                                            </el-button>
                                        </div>
                                    </div>
                                    <div class="row-buttons" :ref="(el) => setRowRef(el, rowIndex)">
                                        <div v-for="(btn, btnIndex) in row" :key="btn._id || btnIndex" class="button-item"
                                            @click="editButton(rowIndex, btnIndex)">
                                            <div class="button-content">
                                                <span class="button-icon">{{ btn.icon || '📱' }}</span>
                                                <span class="button-text">{{ btn.text || '未命名' }}</span>
                                            </div>
                                            <div class="button-badge">
                                                <el-tag v-if="btn.handle_type === 'method'" size="small">方法</el-tag>
                                                <el-tag v-else type="success" size="small">自定义</el-tag>
                                            </div>
                                            <el-button class="button-delete" type="danger" size="small" circle
                                                @click.stop="removeButton(rowIndex, btnIndex)">
                                                <el-icon>
                                                    <Delete />
                                                </el-icon>
                                            </el-button>
                                        </div>
                                        <div v-if="row.length === 0" class="empty-row">
                                            <span>该行暂无按钮</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>

            <el-form-item style="margin-top: 20px;">
                <el-button @click="onCancel">取 消</el-button>
                <el-button type="primary" @click="onSubmit" :loading="loading">确 定</el-button>
            </el-form-item>
        </el-form>

        <!-- 按钮编辑抽屉 -->
        <el-drawer v-model="drawerVisible" :title="drawerTitle" size="50%" :before-close="closeDrawer">
            <el-form :model="currentButton" label-width="100px">

                <el-form-item label="按钮文本">
                    <el-input v-model="currentButton.text" placeholder="如：开始游戏" />
                    <div class="help-text">按钮显示的文本</div>
                </el-form-item>

                <el-form-item label="匹配关键词">
                    <el-input v-model="currentButton.keywords" placeholder="多个关键词用 | 隔开，如：开始|start|game" />
                    <div class="help-text">用户发送这些关键词时触发</div>
                </el-form-item>

                <el-form-item label="处理方式">
                    <el-radio-group v-model="currentButton.handle_type">
                        <el-radio label="method">调用方法</el-radio>
                        <el-radio label="custom">自定义内容</el-radio>
                    </el-radio-group>
                </el-form-item>

                <!-- 调用方法模式 -->
                <el-form-item v-if="currentButton.handle_type === 'method'" label="选择方法">
                    <el-select v-model="currentButton.handle_method" placeholder="请选择要调用的方法" style="width: 100%;">
                        <el-option v-for="method in availableHandleMethods" :key="method.value" :label="method.label"
                            :value="method.value" />
                    </el-select>
                    <div class="help-text">选择一个后端已定义的处理方法</div>
                </el-form-item>

                <!-- 方法类型也支持上传图片 -->
                <el-form-item v-if="currentButton.handle_type === 'method'" label="方法图片">
                    <ImageUpload v-model="currentButton.method_image" />
                    <div class="help-text">可选，调用方法时显示的图片</div>
                </el-form-item>

                <!-- 自定义内容模式 -->
                <template v-if="currentButton.handle_type === 'custom'">
                    <el-form-item label="回复内容">
                        <MultiLangRichEditor v-model="currentButton.reply_text" />
                    </el-form-item>

                    <el-form-item label="回复图片">
                        <ImageUpload v-model="currentButton.reply_image" />
                    </el-form-item>

                    <!-- 回复按钮配置 -->
                    <el-form-item label="回复按钮">
                        <div class="reply-buttons-config">
                            <div class="reply-buttons-header">
                                <span>配置回复消息中的按钮</span>
                                <el-button type="primary" size="small" @click="addReplyButtonRow">
                                    + 添加按钮行
                                </el-button>
                            </div>

                            <div v-if="currentButton.reply_buttons.length === 0" class="empty-hint">
                                <el-text type="info" size="small">暂无按钮，点击上方添加</el-text>
                            </div>

                            <div v-else class="reply-button-rows">
                                <div v-for="(row, rowIdx) in currentButton.reply_buttons" :key="rowIdx"
                                    class="reply-button-row">
                                    <div class="row-label">
                                        <span>第 {{ rowIdx + 1 }} 行</span>
                                        <el-button type="danger" size="small" text
                                            @click="removeReplyButtonRow(rowIdx)">
                                            删除行
                                        </el-button>
                                    </div>
                                    <div class="row-buttons-list">
                                        <div v-for="(btn, btnIdx) in row" :key="btnIdx" class="inline-button-item">
                                            <div class="button-info">
                                                <el-tag
                                                    :type="btn.type === 'url' ? 'warning' : (btn.type === 'webapp' ? 'info' : '')">
                                                    {{ btn.text || '未命名' }}
                                                </el-tag>
                                                <el-text size="small" type="info">
                                                    {{ btn.type === 'url' ? '🔗 URL' : (btn.type === 'webapp' ?
                                                        '🌐 WebApp' : '📞 Callback') }}
                                                </el-text>
                                            </div>
                                            <div class="button-actions">
                                                <el-button size="small" text @click="editReplyButton(rowIdx, btnIdx)">
                                                    编辑
                                                </el-button>
                                                <el-button size="small" type="danger" text
                                                    @click="removeReplyButton(rowIdx, btnIdx)">
                                                    删除
                                                </el-button>
                                            </div>
                                        </div>
                                        <el-button size="small" @click="addReplyButton(rowIdx)">
                                            + 添加按钮
                                        </el-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-form-item>
                </template>

                <el-form-item style="margin-top: 30px;">
                    <el-button @click="closeDrawer">取消</el-button>
                    <el-button type="primary" @click="saveButton">保存</el-button>
                </el-form-item>
            </el-form>
        </el-drawer>

        <!-- 回复按钮编辑对话框 -->
        <el-dialog v-model="replyButtonDialogVisible" title="配置回复按钮" width="500px">
            <el-form :model="currentReplyButton" label-width="100px">
                <el-form-item label="按钮文本">
                    <el-input v-model="currentReplyButton.text" placeholder="如：访问官网" />
                </el-form-item>

                <el-form-item label="按钮类型">
                    <el-radio-group v-model="currentReplyButton.type">
                        <!-- <el-radio label="callback">回调按钮</el-radio> -->
                        <el-radio label="url">URL链接</el-radio>
                        <!-- <el-radio label="webapp">WebApp</el-radio> -->
                    </el-radio-group>
                </el-form-item>

                <el-form-item v-if="currentReplyButton.type === 'callback'" label="回调数据">
                    <el-input v-model="currentReplyButton.callback_data" placeholder="如：open_game" />
                    <div class="help-text">回调数据，用于识别按钮点击</div>
                </el-form-item>

                <el-form-item v-if="currentReplyButton.type === 'url'" label="URL链接">
                    <el-input v-model="currentReplyButton.url" placeholder="https://example.com" />
                </el-form-item>

                <el-form-item v-if="currentReplyButton.type === 'webapp'" label="WebApp链接">
                    <el-input v-model="currentReplyButton.url" placeholder="https://game.example.com" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="replyButtonDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveReplyButton">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="telegramBotDialog">
import { ref, reactive, onMounted, inject, defineAsyncComponent, nextTick, watch, onUnmounted } from 'vue';
import { saveTelegramBot, getAvailableHandleMethods } from '@/api/telegramBot';
import { ElMessage } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import Sortable from 'sortablejs';

const ImageUpload = defineAsyncComponent(() => import('./ImageUpload.vue'));
const MultiLangRichEditor = defineAsyncComponent(() => import('@/components/MultiLangRichEditor/index.vue'));

const dialogInstance = inject('dialogInstance');

const props = defineProps({
    type: {
        type: String,
        default: 'add'
    },
    data: {
        type: Object,
        default: () => ({})
    }
});

const formRef = ref<any>();
const loading = ref(false);
const activeTab = ref('basic');

// 获取可用的处理方法列表
const availableHandleMethods = getAvailableHandleMethods();

// 抽屉相关
const drawerVisible = ref(false);
const drawerTitle = ref('编辑按钮');
const currentButton = reactive({
    text: '',
    keywords: '',
    handle_type: 'method',
    handle_method: '',
    method_image: '', // 方法类型的图片
    reply_text: {} as any,
    reply_image: '',
    reply_buttons: [] as any[][] // 回复按钮（二维数组，每行可以有多个按钮）
});
const currentRowIndex = ref(-1);
const currentBtnIndex = ref(-1);

// 回复按钮编辑对话框
const replyButtonDialogVisible = ref(false);
const currentReplyButton = reactive({
    text: '',
    type: 'url', // callback, url, webapp
    callback_data: '',
    url: ''
});
const currentReplyButtonRowIdx = ref(-1);
const currentReplyButtonBtnIdx = ref(-1);

// 表单校验规则
const rules = reactive<any>({
    bot_name: [
        { required: true, message: '请输入机器人标识', trigger: 'blur' },
        { pattern: /^[a-z0-9_]+$/, message: '只能包含小写字母、数字和下划线', trigger: 'blur' }
    ],
    platform_name: [
        { required: true, message: '请输入平台名称', trigger: 'blur' }
    ],
    master_id: [
        { required: true, message: '请输入主站ID', trigger: 'blur' }
    ],
    token: [
        { required: true, message: '请输入机器人Token', trigger: 'blur' }
    ],
    name: [
        { required: true, message: '请输入机器人用户名', trigger: 'blur' }
    ],
    chat_id: [
        { required: true, message: '请输入聊天ID', trigger: 'blur' }
    ],
    status: [
        { required: true, message: '请选择状态', trigger: 'change' }
    ]
});

// 表单数据
const form = reactive({
    id: 0,
    bot_name: '',
    platform_name: '',
    version: '1.0.0',
    master_id: null as any,
    service_attr: '',
    token: '',
    name: '',
    chat_id: '',
    channel: '',
    service: '',
    game_url: '',
    start_game_text: {} as any,
    start_img: '',
    custom_buttons: [] as any[][], // 改为二维数组，每个元素是一行按钮
    status: 1
});

// Sortable 相关
const rowsContainerRef = ref();
const rowRefs = ref<HTMLElement[]>([]);
const sortableInstances: Sortable[] = [];

const setRowRef = (el: any, index: number) => {
    if (el) {
        rowRefs.value[index] = el;
    }
};

// 初始化 Sortable
const initSortable = () => {
    // 清理旧实例
    sortableInstances.forEach(instance => instance.destroy());
    sortableInstances.length = 0;

    // 1. 行排序
    if (rowsContainerRef.value) {
        const rowSortable = Sortable.create(rowsContainerRef.value, {
            animation: 150,
            handle: '.row-header', // 只能拖动头部
            onEnd: ({ newIndex, oldIndex }: any) => {
                if (newIndex === oldIndex) return;
                // 移动行数据
                const targetRow = form.custom_buttons.splice(oldIndex, 1)[0];
                form.custom_buttons.splice(newIndex, 0, targetRow);
                
                // 行移动后，rowRefs 的顺序可能乱了，重新初始化
                nextTick(() => {
                    initSortable();
                 });
            }
        });
        sortableInstances.push(rowSortable);
    }

    // 2. 按钮排序（支持跨行）
    rowRefs.value.forEach((el, rowIndex) => {
        if (!el) return;
        const btnSortable = Sortable.create(el, {
            group: 'buttons', // 允许跨行
            animation: 150,
            onEnd: (evt: any) => {
                const { newIndex, oldIndex, from, to } = evt;
                
                // 查找源行和目标行的索引
                const fromIndex = rowRefs.value.indexOf(from);
                const toIndex = rowRefs.value.indexOf(to);

                if (fromIndex === -1 || toIndex === -1) return;

                // 如果没变动
                if (fromIndex === toIndex && newIndex === oldIndex) return;

                // 移动按钮数据
                const btn = form.custom_buttons[fromIndex].splice(oldIndex, 1)[0];
                form.custom_buttons[toIndex].splice(newIndex, 0, btn);
            }
        });
        sortableInstances.push(btnSortable);
    });
};

// 监听按钮数据变化，从新初始化排序（因为行可能增加）
watch(() => form.custom_buttons.length, () => {
    nextTick(() => {
        initSortable();
    });
});

// 添加新行
const addButtonRow = () => {
    form.custom_buttons.push([]);
};

// 添加按钮到行
const addButtonToRow = (rowIndex: number) => {
    currentRowIndex.value = rowIndex;
    currentBtnIndex.value = -1; // -1 表示新增
    drawerTitle.value = '添加按钮';
    Object.assign(currentButton, {
        text: '',
        keywords: '',
        handle_type: 'method',
        handle_method: '',
        method_image: '', // 重置方法图片
        reply_text: {},
        reply_image: '',
        reply_buttons: []
    });
    drawerVisible.value = true;
};

// 编辑按钮
const editButton = (rowIndex: number, btnIndex: number) => {
    currentRowIndex.value = rowIndex;
    currentBtnIndex.value = btnIndex;
    drawerTitle.value = '编辑按钮';
    const btn = form.custom_buttons[rowIndex][btnIndex];
    Object.assign(currentButton, {
        _id: (btn as any)._id,
        text: btn.text || '',
        keywords: btn.keywords || '',
        handle_type: btn.handle_type || 'method',
        handle_method: btn.handle_method || '',
        method_image: btn.method_image || '', // 加载方法图片
        reply_text: btn.reply_text || {},
        reply_image: btn.reply_image || '',
        reply_buttons: btn.reply_buttons || []
    });
    drawerVisible.value = true;
};

// 保存按钮
const saveButton = () => {
    // 验证
    if (!currentButton.keywords || !currentButton.keywords.trim()) {
        ElMessage.error('请填写匹配关键词');
        return;
    }

    if (currentButton.handle_type === 'method' && !currentButton.handle_method) {
        ElMessage.error('请选择处理方法');
        return;
    }
    if (currentButton.handle_type === 'custom') {
        const hasContent = Object.values(currentButton.reply_text || {}).some((val: any) => val && val.trim());
        if (!hasContent) {
            ElMessage.error('请填写回复内容');
            return;
        }
    }

    const buttonData = {
        _id: (currentButton as any)._id || Date.now() + Math.random().toString(36).substr(2, 9),
        text: currentButton.text,
        keywords: currentButton.keywords,
        handle_type: currentButton.handle_type,
        handle_method: currentButton.handle_method,
        method_image: currentButton.method_image, // 保存方法图片
        reply_text: currentButton.reply_text,
        reply_image: currentButton.reply_image,
        reply_buttons: currentButton.reply_buttons // 保存回复按钮
    };

    if (currentBtnIndex.value === -1) {
        // 新增
        form.custom_buttons[currentRowIndex.value].push(buttonData);
    } else {
        // 编辑
        form.custom_buttons[currentRowIndex.value][currentBtnIndex.value] = buttonData;
    }

    drawerVisible.value = false;
};

// 添加回复按钮行
const addReplyButtonRow = () => {
    currentButton.reply_buttons.push([]);
};

// 删除回复按钮行
const removeReplyButtonRow = (rowIdx: number) => {
    currentButton.reply_buttons.splice(rowIdx, 1);
};

// 添加回复按钮
const addReplyButton = (rowIdx: number) => {
    currentReplyButtonRowIdx.value = rowIdx;
    currentReplyButtonBtnIdx.value = -1;
    Object.assign(currentReplyButton, {
        text: '',
        type: 'url',
        callback_data: '',
        url: ''
    });
    replyButtonDialogVisible.value = true;
};

// 编辑回复按钮
const editReplyButton = (rowIdx: number, btnIdx: number) => {
    currentReplyButtonRowIdx.value = rowIdx;
    currentReplyButtonBtnIdx.value = btnIdx;
    const btn = currentButton.reply_buttons[rowIdx][btnIdx];
    Object.assign(currentReplyButton, {
        text: btn.text || '',
        type: btn.type || 'url',
        callback_data: btn.callback_data || '',
        url: btn.url || ''
    });
    replyButtonDialogVisible.value = true;
};

// 保存回复按钮
const saveReplyButton = () => {
    if (!currentReplyButton.text || !currentReplyButton.text.trim()) {
        ElMessage.error('请填写按钮文本');
        return;
    }

    if (currentReplyButton.type === 'callback' && !currentReplyButton.callback_data) {
        ElMessage.error('请填写回调数据');
        return;
    }

    if ((currentReplyButton.type === 'url' || currentReplyButton.type === 'webapp') && !currentReplyButton.url) {
        ElMessage.error('请填写链接地址');
        return;
    }

    const buttonData = {
        text: currentReplyButton.text,
        type: currentReplyButton.type,
        callback_data: currentReplyButton.callback_data,
        url: currentReplyButton.url
    };

    if (currentReplyButtonBtnIdx.value === -1) {
        // 新增
        currentButton.reply_buttons[currentReplyButtonRowIdx.value].push(buttonData);
    } else {
        // 编辑
        currentButton.reply_buttons[currentReplyButtonRowIdx.value][currentReplyButtonBtnIdx.value] = buttonData;
    }

    replyButtonDialogVisible.value = false;
};

// 删除回复按钮
const removeReplyButton = (rowIdx: number, btnIdx: number) => {
    currentButton.reply_buttons[rowIdx].splice(btnIdx, 1);
};

// 关闭抽屉
const closeDrawer = () => {
    drawerVisible.value = false;
};

// 删除按钮
const removeButton = (rowIndex: number, btnIndex: number) => {
    form.custom_buttons[rowIndex].splice(btnIndex, 1);
    ElMessage.success('按钮已删除');
};

// 删除行
const removeRow = (rowIndex: number) => {
    form.custom_buttons.splice(rowIndex, 1);
    ElMessage.success('行已删除');
};

// 初始化表单数据
const initForm = (data?: any) => {
    if (data && data.id) {
        Object.assign(form, {
            id: data.id,
            bot_name: data.bot_name || '',
            platform_name: data.platform_name || '',
            version: data.version || '1.0.0',
            master_id: data.master_id || null,
            service_attr: data.service_attr || '',
            token: data.token || '',
            name: data.name || '',
            chat_id: data.chat_id || '',
            channel: data.channel || '',
            service: data.service || '',
            game_url: data.game_url || '',
            start_game_text: data.start_game_text || {},
            start_img: data.start_img || '',
            custom_buttons: data.custom_buttons || [],
            status: data.status ?? 1
        });
        
        // 为已有按钮添加唯一ID，确保拖拽正常
        form.custom_buttons.forEach((row: any[]) => {
            row.forEach(btn => {
                if (!btn._id) {
                    btn._id = Date.now() + Math.random().toString(36).substr(2, 9);
                }
            });
        });
    } else {
        // 新增时，添加一个默认行
        form.custom_buttons = [];
    }
};

// 验证自定义按钮
const validateCustomButtons = () => {
    if (form.custom_buttons.length === 0) {
        ElMessage.error('请至少添加一行按钮');
        activeTab.value = 'buttons';
        return false;
    }

    for (let i = 0; i < form.custom_buttons.length; i++) {
        const row = form.custom_buttons[i];
        if (row.length === 0) {
            ElMessage.error(`第 ${i + 1} 行没有按钮，请添加按钮或删除该行`);
            activeTab.value = 'buttons';
            return false;
        }

        for (let j = 0; j < row.length; j++) {
            const btn = row[j];
            if (!btn.keywords || !btn.keywords.trim()) {
                ElMessage.error(`第 ${i + 1} 行第 ${j + 1} 个按钮缺少关键词`);
                activeTab.value = 'buttons';
                return false;
            }
        }
    }
    return true;
};

// 提交表单
const onSubmit = () => {
    formRef.value?.validate(async (valid: boolean) => {
        if (!valid) {
            activeTab.value = 'basic';
            return;
        }

        if (!validateCustomButtons()) {
            return;
        }

        loading.value = true;
        try {
            await saveTelegramBot(form);
            ElMessage.success(props.type === 'add' ? '添加成功' : '更新成功');
            (dialogInstance as any)?.$emit('success');
            (dialogInstance as any)?.$close();
        } catch (error) {
            console.error('保存失败:', error);
        } finally {
            loading.value = false;
        }
    });
};

// 取消
const onCancel = () => {
    (dialogInstance as any)?.$close();
};

onMounted(() => {
    initForm(props.data);
    nextTick(() => {
        initSortable();
    });
});

onUnmounted(() => {
    sortableInstances.forEach(instance => instance.destroy());
});
</script>

<style scoped lang="scss">
.telegram-bot-dialog-container {
    padding: 20px;
    min-width: 700px;

    .help-text {
        font-size: 12px;
        color: #999;
        margin-top: 5px;
    }

    .button-config-container {
        .button-preview-area {
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            padding: 15px;
            background-color: #f5f7fa;

            .preview-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #dcdfe6;

                span {
                    font-weight: bold;
                    font-size: 14px;
                }
            }

            .empty-state {
                padding: 40px 0;
            }

            .button-rows {
                .button-row {
                    margin-bottom: 20px;
                    padding: 15px;
                    background-color: #fff;
                    border-radius: 4px;
                    border: 1px solid #e4e7ed;

                    .row-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                        padding-bottom: 10px;
                        border-bottom: 1px dashed #dcdfe6;

                        span {
                            font-weight: 500;
                            color: #606266;
                        }

                        .row-actions {
                            display: flex;
                            gap: 10px;
                        }
                    }

                    .row-buttons {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;

                        .button-item {
                            position: relative;
                            min-width: 120px;
                            padding: 12px 15px;
                            background: linear-gradient(135deg, #667eea 100%);
                            border-radius: 8px;
                            cursor: pointer;
                            transition: all 0.3s;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

                            &:hover {
                                transform: translateY(-2px);
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);

                                .button-delete {
                                    opacity: 1;
                                }
                            }

                            .button-content {
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                color: #fff;

                                .button-icon {
                                    font-size: 20px;
                                }

                                .button-text {
                                    font-size: 14px;
                                    font-weight: 500;
                                }
                            }

                            .button-badge {
                                position: absolute;
                                top: -8px;
                                right: -8px;
                            }

                            .button-delete {
                                position: absolute;
                                bottom: -8px;
                                right: -8px;
                                opacity: 0;
                                transition: opacity 0.3s;
                            }
                        }

                        .empty-row {
                            width: 100%;
                            padding: 20px;
                            text-align: center;
                            color: #909399;
                            font-size: 14px;
                            background-color: #f5f7fa;
                            border-radius: 4px;
                            border: 1px dashed #dcdfe6;
                        }
                    }
                }
            }
        }
    }

    :deep(.el-tabs__content) {
        max-height: 500px;
        overflow-y: auto;
    }

    .reply-buttons-config {
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        padding: 15px;
        background-color: #f5f7fa;

        .reply-buttons-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #dcdfe6;

            span {
                font-size: 14px;
                color: #606266;
            }
        }

        .empty-hint {
            padding: 20px;
            text-align: center;
        }

        .reply-button-rows {
            .reply-button-row {
                margin-bottom: 15px;
                padding: 12px;
                background-color: #fff;
                border-radius: 4px;
                border: 1px solid #e4e7ed;

                .row-label {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    padding-bottom: 8px;
                    border-bottom: 1px dashed #dcdfe6;

                    span {
                        font-size: 13px;
                        font-weight: 500;
                        color: #606266;
                    }
                }

                .row-buttons-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;

                    .inline-button-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 12px;
                        background-color: #f5f7fa;
                        border-radius: 4px;
                        border: 1px solid #e4e7ed;

                        .button-info {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        }

                        .button-actions {
                            display: flex;
                            gap: 5px;
                        }
                    }
                }
            }
        }
    }
}
</style>
