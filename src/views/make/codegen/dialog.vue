<template>
    <div class="container layout-pd">
        <el-card class="config-card">
            <template #header>
                <div class="card-header">
                    <span>对话框组件生成工具</span>
                    <div>
                        <el-button type="primary" @click="generateCode">生成代码</el-button>
                        <el-button type="success" @click="copyCode">复制代码</el-button>
                    </div>
                </div>
            </template>
            <el-tabs v-model="activeTab">
                <el-tab-pane label="基础设置" name="basic">
                    <el-form label-width="120px">
                        <el-form-item label="API路径">
                            <el-input v-model="config.apiPath" placeholder="例如: @/api/system"></el-input>
                        </el-form-item>
                        <el-form-item label="保存接口名">
                            <el-input v-model="config.saveApi" placeholder="例如: saveRole"></el-input>
                        </el-form-item>
                        <el-form-item label="组件名称">
                            <el-input v-model="config.componentName" placeholder="例如: systemRoleDialog"></el-input>
                        </el-form-item>
                        <el-form-item label="表单宽度">
                            <el-input v-model="config.formWidth" placeholder="例如: 600px"></el-input>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="表单项配置" name="formItems">
                    <div class="table-header-actions">
                        <el-button type="primary" @click="addFormItem">添加表单项</el-button>
                    </div>
                    <el-table :data="config.formItems" border style="width: 100%">
                        <el-table-column label="操作" width="120">
                            <template #default="scope">
                                <el-button type="danger" size="small" @click="removeFormItem(scope.$index)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="标签名" prop="label">
                            <template #default="scope">
                                <el-input v-model="scope.row.label" placeholder="标签名"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="字段名" prop="prop">
                            <template #default="scope">
                                <el-input v-model="scope.row.prop" placeholder="字段名"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="类型" prop="type" width="180">
                            <template #default="scope">
                                <el-select v-model="scope.row.type" placeholder="选择类型">
                                    <el-option label="输入框" value="input"></el-option>
                                    <el-option label="文本域" value="textarea"></el-option>
                                    <el-option label="选择器" value="select"></el-option>
                                    <el-option label="日期选择器" value="date"></el-option>
                                    <el-option label="开关" value="switch"></el-option>
                                    <el-option label="复选框" value="checkbox"></el-option>
                                    <el-option label="树选择" value="tree"></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="是否必填" width="120">
                            <template #default="scope">
                                <el-switch v-model="scope.row.required"></el-switch>
                            </template>
                        </el-table-column>
                        <el-table-column label="占位文本" prop="placeholder" width="200">
                            <template #default="scope">
                                <el-input v-model="scope.row.placeholder" placeholder="请输入占位文本"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="高级配置" width="120">
                            <template #default="scope">
                                <el-button type="primary" size="small" @click="showFormItemConfig(scope.row)">
                                    配置
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="预览代码" name="preview">
                    <div class="code-preview">
                        <el-input type="textarea" v-model="generatedCode" :rows="20" placeholder="生成的代码将显示在这里"
                            readonly></el-input>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 表单项配置对话框 -->
        <el-dialog v-model="formItemConfigVisible" title="高级表单配置" width="600px" append-to-body>
            <el-form :model="currentFormItem" label-width="140px">
                <template v-if="currentFormItem.type === 'select'">
                    <el-form-item label="选项配置">
                        <div v-for="(option, index) in currentFormItem.options || []" :key="index" class="option-item">
                            <el-input v-model="option.label" placeholder="标签" class="option-label"></el-input>
                            <el-input v-model="option.value" placeholder="值" class="option-value"></el-input>
                            <el-button type="danger" @click="removeOption(index)" icon="Delete" circle></el-button>
                        </div>
                        <el-button type="primary" @click="addOption">添加选项</el-button>
                    </el-form-item>
                </template>

                <template v-if="currentFormItem.type === 'tree'">
                    <el-form-item label="树配置">
                        <template v-if="!currentFormItem.treeConfig">
                            <div class="tree-config-initializer">
                                <el-button type="primary" @click="initTreeConfig">初始化树配置</el-button>
                            </div>
                        </template>
                        <template v-else>
                            <el-input v-model="currentFormItem.treeConfig.dataKey" placeholder="数据变量名"></el-input>
                            <el-input v-model="currentFormItem.treeConfig.nodeKey" placeholder="节点键名"></el-input>
                            <el-input v-model="currentFormItem.treeConfig.props"
                                placeholder="props配置，如: {label: 'title', children: 'children'}"></el-input>
                        </template>
                    </el-form-item>
                </template>

                <template v-if="currentFormItem.type === 'textarea'">
                    <el-form-item label="行数">
                        <el-input-number v-model="currentFormItem.rows" :min="1" :max="10"
                            placeholder="文本域行数"></el-input-number>
                    </el-form-item>
                </template>

                <template v-if="currentFormItem.type">
                    <el-form-item label="布局宽度">
                        <el-select v-model="currentFormItem.col" placeholder="选择列宽">
                            <el-option label="全宽(24)" value="24"></el-option>
                            <el-option label="一半宽(12)" value="12"></el-option>
                            <el-option label="三分之一(8)" value="8"></el-option>
                            <el-option label="四分之一(6)" value="6"></el-option>
                        </el-select>
                    </el-form-item>
                </template>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="formItemConfigVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveFormItemConfig">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="tsx" name="dialogGenerator">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

interface FormItemOption {
    label: string;
    value: string | number;
}

interface TreeConfig {
    dataKey: string;
    nodeKey: string;
    props: string;
}

interface FormItem {
    label: string;
    prop: string;
    type: string;
    required: boolean;
    placeholder: string;
    options?: FormItemOption[];
    treeConfig?: TreeConfig;
    rows?: number;
    col?: number;
    [key: string]: any;
}

interface ConfigState {
    apiPath: string;
    saveApi: string;
    componentName: string;
    formWidth: string;
    formItems: FormItem[];
}

const activeTab = ref('basic');
const generatedCode = ref('');
const formItemConfigVisible = ref(false);
const currentFormItem = ref<FormItem>({} as FormItem);
const originalIndex = ref(-1);

const config = reactive<ConfigState>({
    apiPath: '@/api/system',
    saveApi: 'saveData',
    componentName: 'dialogForm',
    formWidth: '600px',
    formItems: []
});

// 添加表单项
const addFormItem = () => {
    config.formItems.push({
        label: '',
        prop: '',
        type: 'input',
        required: false,
        placeholder: ''
    });
};

// 移除表单项
const removeFormItem = (index: number) => {
    config.formItems.splice(index, 1);
};

// 显示表单项配置
const showFormItemConfig = (formItem: FormItem) => {
    currentFormItem.value = JSON.parse(JSON.stringify(formItem));
    originalIndex.value = config.formItems.findIndex(item => item === formItem);
    formItemConfigVisible.value = true;

    // 确保选项数组存在
    if (currentFormItem.value.type === 'select' && !currentFormItem.value.options) {
        currentFormItem.value.options = [];
    }

    // 确保树配置存在
    if (currentFormItem.value.type === 'tree') {
        if (!currentFormItem.value.treeConfig) {
            currentFormItem.value.treeConfig = {
                dataKey: 'treeData',
                nodeKey: 'id',
                props: "{ label: 'title', children: 'children' }"
            };
        }
    }
};

// 保存表单项配置
const saveFormItemConfig = () => {
    if (originalIndex.value !== -1) {
        config.formItems[originalIndex.value] = { ...currentFormItem.value };
    }
    formItemConfigVisible.value = false;
};

// 添加选项
const addOption = () => {
    if (!currentFormItem.value.options) {
        currentFormItem.value.options = [];
    }
    currentFormItem.value.options.push({ label: '', value: '' });
};

// 移除选项
const removeOption = (index: number) => {
    if (currentFormItem.value.options) {
        currentFormItem.value.options.splice(index, 1);
    }
};

// 添加初始化树配置的方法
const initTreeConfig = () => {
    if (currentFormItem.value && currentFormItem.value.type === 'tree' && !currentFormItem.value.treeConfig) {
        currentFormItem.value.treeConfig = {
            dataKey: 'treeData',
            nodeKey: 'id',
            props: "{ label: 'title', children: 'children' }"
        };
    }
};

// 生成代码
const generateCode = () => {
    try {
        const code = generateDialogTemplate();
        generatedCode.value = code;
        activeTab.value = 'preview';
        ElMessage.success('代码生成成功');
    } catch (error: any) {
        ElMessage.error('代码生成失败: ' + (error.message || '未知错误'));
    }
};

// 复制代码
const copyCode = () => {
    if (!generatedCode.value) {
        ElMessage.warning('请先生成代码');
        return;
    }

    navigator.clipboard.writeText(generatedCode.value)
        .then(() => {
            ElMessage.success('复制成功');
        })
        .catch(() => {
            ElMessage.error('复制失败');
        });
};

// 生成对话框模板
const generateDialogTemplate = (): string => {
    let code = '';

    // 模板部分
    code += '<template>\n';
    code += `  <div class="${config.componentName}-container">\n`;
    code += '    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">\n';
    code += '      <el-row :gutter="35">\n';

    // 添加表单项
    const currentRow: string[] = [];
    config.formItems.forEach(item => {
        const colSpan = item.col || '24';

        currentRow.push(`        <el-col :span="${colSpan}">\n`);
        currentRow.push(`          <el-form-item label="${item.label}" prop="${item.prop}">\n`);

        // 根据表单项类型生成不同的表单控件
        switch (item.type) {
            case 'input':
                currentRow.push(`            <el-input v-model="form.${item.prop}" placeholder="${item.placeholder || `请输入${item.label}`}" />\n`);
                break;
            case 'textarea':
                currentRow.push(`            <el-input v-model="form.${item.prop}" type="textarea" ${item.rows ? `rows="${item.rows}"` : ''} placeholder="${item.placeholder || `请输入${item.label}`}" />\n`);
                break;
            case 'select':
                currentRow.push(`            <el-select v-model="form.${item.prop}" placeholder="${item.placeholder || `请选择${item.label}`}">\n`);
                if (item.options && item.options.length > 0) {
                    item.options.forEach(option => {
                        currentRow.push(`              <el-option label="${option.label}" value="${option.value}" />\n`);
                    });
                }
                currentRow.push('            </el-select>\n');
                break;
            case 'date':
                currentRow.push(`            <el-date-picker v-model="form.${item.prop}" type="date" placeholder="${item.placeholder || `请选择${item.label}`}" />\n`);
                break;
            case 'switch':
                currentRow.push(`            <el-switch v-model="form.${item.prop}" />\n`);
                break;
            case 'checkbox':
                currentRow.push(`            <el-checkbox v-model="form.${item.prop}">${item.placeholder || item.label}</el-checkbox>\n`);
                break;
            case 'tree':
                const treeConfig = item.treeConfig || { dataKey: 'treeData', nodeKey: 'id', props: "{ label: 'title', children: 'children' }" };
                currentRow.push(`            <el-tree ref="${item.prop}TreeRef" :data="${treeConfig.dataKey}" show-checkbox node-key="${treeConfig.nodeKey}"\n`);
                currentRow.push(`              :props="${treeConfig.props}" :default-checked-keys="checkedKeys" />\n`);
                break;
            default:
                currentRow.push(`            <el-input v-model="form.${item.prop}" placeholder="${item.placeholder || `请输入${item.label}`}" />\n`);
        }

        currentRow.push('          </el-form-item>\n');
        currentRow.push('        </el-col>\n');
    });

    code += currentRow.join('');
    code += '      </el-row>\n';

    // 按钮部分
    code += '      <el-form-item>\n';
    code += '        <el-button @click="onCancel">取 消</el-button>\n';
    code += '        <el-button type="primary" @click="onSubmit" :loading="loading">确 定</el-button>\n';
    code += '      </el-form-item>\n';
    code += '    </el-form>\n';
    code += '  </div>\n';
    code += '</template>\n\n';

    // script部分
    code += `<script setup lang="ts" name="${config.componentName}">\n`;
    code += 'import { ref, reactive, onMounted, inject } from \'vue\';\n';
    code += 'import type { FormInstance, FormRules } from \'element-plus\';\n';
    code += `import { ${config.saveApi} } from '${config.apiPath}';\n`;
    code += 'import { ElMessage } from \'element-plus\';\n\n';

    code += 'const dialogInstance = inject(\'dialogInstance\');\n\n';

    // props定义
    code += 'const props = defineProps({\n';
    code += '  id: {\n';
    code += '    type: [Number, String],\n';
    code += '    default: undefined\n';
    code += '  },\n';
    code += '  data: {\n';
    code += '    type: Object,\n';
    code += '    default: () => ({})\n';
    code += '  }\n';
    code += '});\n\n';

    // 表单引用
    code += 'const formRef = ref<FormInstance>();\n';

    // 检查是否包含树控件
    const hasTrees = config.formItems.some(item => item.type === 'tree');
    if (hasTrees) {
        config.formItems.forEach(item => {
            if (item.type === 'tree') {
                code += `const ${item.prop}TreeRef = ref();\n`;
            }
        });
        code += 'const checkedKeys = ref<number[]>([]);\n';
    }

    code += 'const loading = ref(false);\n\n';

    // 表单校验规则
    code += 'const rules = reactive<FormRules>({\n';
    config.formItems.forEach(item => {
        if (item.required) {
            code += `  ${item.prop}: [{ required: true, message: '请${item.type === 'select' ? '选择' : '输入'}${item.label}', trigger: '${item.type === 'select' ? 'change' : 'blur'}' }],\n`;
        }
    });
    code += '});\n\n';

    // 表单数据
    code += 'const form = reactive({\n';
    config.formItems.forEach(item => {
        let defaultValue = 'undefined';
        switch (item.type) {
            case 'input':
            case 'textarea':
                defaultValue = "''";
                break;
            case 'select':
                defaultValue = "''";
                break;
            case 'date':
                defaultValue = 'null';
                break;
            case 'switch':
            case 'checkbox':
                defaultValue = 'false';
                break;
            default:
                defaultValue = "''";
        }
        code += `  ${item.prop}: ${defaultValue},\n`;
    });
    code += '});\n\n';

    // 初始化表单
    code += 'const initForm = (data?: any) => {\n';
    code += '  if (data) {\n';
    code += '    Object.assign(form, data);\n';
    if (hasTrees) {
        code += '    // 如果有树控件，可以在这里设置默认选中的节点\n';
        config.formItems.forEach(item => {
            if (item.type === 'tree') {
                code += `    // checkedKeys.value = data.${item.prop}_ids || [];\n`;
            }
        });
    }
    code += '  }\n';
    code += '};\n\n';

    // 提交表单
    code += 'const onSubmit = async () => {\n';
    code += '  if (!formRef.value) return;\n';
    code += '  await formRef.value.validate(async (valid: boolean) => {\n';
    code += '    if (valid) {\n';
    code += '      loading.value = true;\n';
    code += '      try {\n';

    // 处理树控件提交
    if (hasTrees) {
        config.formItems.forEach(item => {
            if (item.type === 'tree') {
                code += `        // 获取选中的树节点ID\n`;
                code += `        form.${item.prop}_ids = ${item.prop}TreeRef.value.getCheckedKeys();\n`;
            }
        });
    }

    code += '        await ' + config.saveApi + '(form);\n';
    code += '        ElMessage.success(\'保存成功\');\n';
    code += '        (dialogInstance as any)?.$emit(\'success\');\n';
    code += '        onCancel();\n';
    code += '      } catch (error) {\n';
    code += '        console.error(error);\n';
    code += '      } finally {\n';
    code += '        loading.value = false;\n';
    code += '      }\n';
    code += '    }\n';
    code += '  });\n';
    code += '};\n\n';

    // 取消
    code += 'const onCancel = () => {\n';
    code += '  (dialogInstance as any)?.$close();\n';
    code += '};\n\n';

    // 挂载
    code += 'onMounted(() => {\n';
    code += '  if (props.id) {\n';
    code += '    // 如果传入ID，可以在这里获取详情数据\n';
    code += '    // getDetail(props.id).then(res => {\n';
    code += '    //   initForm(res.data);\n';
    code += '    // });\n';
    code += '  } else {\n';
    code += '    initForm(props.data);\n';
    code += '  }\n';
    code += '});\n';
    code += '<\/script>\n\n';

    // style部分
    code += '<style scoped lang="scss">\n';
    code += `.${config.componentName}-container {\n`;
    code += `   width: ${config.formWidth};\n`;
    code += `   max-width: 100%;\n`;
    code += '}\n';
    code += '</style>';

    return code;
};

onMounted(() => {
    // 初始化配置示例
    config.formItems = [
        { label: '名称', prop: 'name', type: 'input', required: true, placeholder: '请输入名称' },
        { label: '编码', prop: 'code', type: 'input', required: true, placeholder: '请输入编码' },
        { label: '描述', prop: 'description', type: 'textarea', required: false, placeholder: '请输入描述', rows: 3 }
    ];
});
</script>

<style scoped lang="scss">
.container {
    min-height: 100%;
    display: flex;
    flex-direction: column;
}

.config-card {
    flex: 1;
    margin-bottom: 20px;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .table-header-actions {
        margin-bottom: 15px;
    }

    .code-preview {
        margin: 10px 0;
    }

    .option-item {
        display: flex;
        margin-bottom: 10px;
        gap: 10px;

        .option-label,
        .option-value {
            flex: 1;
        }
    }
}
</style>