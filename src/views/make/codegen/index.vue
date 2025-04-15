<template>
    <div class="container layout-pd">
        <el-card class="config-card">
            <template #header>
                <div class="card-header">
                    <span>表格配置生成工具</span>
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
                        <el-form-item label="列表接口名">
                            <el-input v-model="config.listApi" placeholder="例如: getUsers"></el-input>
                        </el-form-item>
                        <el-form-item label="删除接口名">
                            <el-input v-model="config.deleteApi" placeholder="例如: delUser"></el-input>
                        </el-form-item>
                        <el-form-item label="是否显示序号">
                            <el-switch v-model="config.isSerialNo"></el-switch>
                        </el-form-item>
                        <el-form-item label="是否显示多选框">
                            <el-switch v-model="config.isSelection"></el-switch>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="表格列配置" name="columns">
                    <div class="table-header-actions">
                        <el-button type="primary" @click="addColumn">添加列</el-button>
                    </div>
                    <el-table :data="config.columns" border style="width: 100%">
                        <el-table-column label="操作" width="120">
                            <template #default="scope">
                                <el-button type="danger" size="small" @click="removeColumn(scope.$index)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="列名" prop="label">
                            <template #default="scope">
                                <el-input v-model="scope.row.label" placeholder="列标题"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="属性名" prop="prop">
                            <template #default="scope">
                                <el-input v-model="scope.row.prop" placeholder="prop属性名"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="类型" prop="type" width="180">
                            <template #default="scope">
                                <el-select v-model="scope.row.type" placeholder="选择列类型">
                                    <el-option label="文本" value="text"></el-option>
                                    <el-option label="图片" value="image"></el-option>
                                    <el-option label="输入框" value="input"></el-option>
                                    <el-option label="开关" value="switch"></el-option>
                                    <el-option label="单选" value="radio"></el-option>
                                    <el-option label="下拉框" value="select"></el-option>
                                    <el-option label="日期" value="date"></el-option>
                                    <el-option label="自定义模板" value="template"></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="宽度" prop="width" width="120">
                            <template #default="scope">
                                <el-input v-model="scope.row.width" placeholder="宽度"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="权限" prop="auth" width="200">
                            <template #default="scope">
                                <el-input v-model="scope.row.auth" placeholder="权限 (sys:user:list)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="高级配置" width="120">
                            <template #default="scope">
                                <el-button type="primary" size="small" @click="showColumnConfig(scope.row)">
                                    配置
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="操作按钮" name="actions">
                    <div class="table-header-actions">
                        <el-button type="primary" @click="addAction">添加操作按钮</el-button>
                    </div>
                    <el-table :data="config.actions" border style="width: 100%">
                        <el-table-column label="操作" width="120">
                            <template #default="scope">
                                <el-button type="danger" size="small" @click="removeAction(scope.$index)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="按钮名称" prop="text">
                            <template #default="scope">
                                <el-input v-model="scope.row.text" placeholder="按钮文本"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="按钮标识" prop="key">
                            <template #default="scope">
                                <el-input v-model="scope.row.key" placeholder="按钮唯一标识"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="图标" prop="icon" width="180">
                            <template #default="scope">
                                <el-select v-model="scope.row.icon" placeholder="选择图标">
                                    <el-option label="无" value=""></el-option>
                                    <el-option label="编辑" value="Edit"></el-option>
                                    <el-option label="删除" value="Delete"></el-option>
                                    <el-option label="搜索" value="Search"></el-option>
                                    <el-option label="分享" value="Share"></el-option>
                                    <el-option label="上传" value="Upload"></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="权限" prop="auth" width="200">
                            <template #default="scope">
                                <el-input v-model="scope.row.auth" placeholder="权限 (sys:user:edit)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="确认提示" prop="poptext" width="200">
                            <template #default="scope">
                                <el-input v-model="scope.row.poptext" placeholder="需要确认则填写提示文本"></el-input>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="搜索配置" name="search">
                    <div class="table-header-actions">
                        <el-button type="primary" @click="addSearch">添加搜索项</el-button>
                    </div>
                    <el-table :data="config.search" border style="width: 100%">
                        <el-table-column label="操作" width="120">
                            <template #default="scope">
                                <el-button type="danger" size="small" @click="removeSearch(scope.$index)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="标签名" prop="label">
                            <template #default="scope">
                                <el-input v-model="scope.row.label" placeholder="标签名"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="属性名" prop="prop">
                            <template #default="scope">
                                <el-input v-model="scope.row.prop" placeholder="属性名"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="类型" prop="type" width="180">
                            <template #default="scope">
                                <el-select v-model="scope.row.type" placeholder="选择类型">
                                    <el-option label="输入框" value="input"></el-option>
                                    <el-option label="下拉框" value="select"></el-option>
                                    <el-option label="日期" value="date"></el-option>
                                    <el-option label="日期范围" value="datetimerange"></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="占位符" prop="placeholder" width="200">
                            <template #default="scope">
                                <el-input v-model="scope.row.placeholder" placeholder="输入占位文本"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="字典键" prop="optionKey" width="200">
                            <template #default="scope">
                                <el-input v-model="scope.row.optionKey" placeholder="sys_normal_disable"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="是否必填" width="120">
                            <template #default="scope">
                                <el-switch v-model="scope.row.required"></el-switch>
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

        <!-- 列配置对话框 -->
        <el-dialog v-model="columnConfigVisible" title="高级列配置" width="600px" append-to-body>
            <el-form :model="currentColumn" label-width="140px">
                <el-form-item label="是否显示溢出提示">
                    <el-switch v-model="currentColumn.showOverflowTooltip"></el-switch>
                </el-form-item>

                <template v-if="currentColumn.type === 'switch'">
                    <el-form-item label="激活值">
                        <el-input v-model="currentColumn.activeValue" placeholder="例如: 1"></el-input>
                    </el-form-item>
                    <el-form-item label="未激活值">
                        <el-input v-model="currentColumn.inactiveValue" placeholder="例如: 0"></el-input>
                    </el-form-item>
                    <el-form-item label="激活文本">
                        <el-input v-model="currentColumn.activeText" placeholder="例如: 开启"></el-input>
                    </el-form-item>
                    <el-form-item label="未激活文本">
                        <el-input v-model="currentColumn.inactiveText" placeholder="例如: 关闭"></el-input>
                    </el-form-item>
                </template>

                <template v-if="['select', 'radio'].includes(currentColumn.type)">
                    <el-form-item label="选项配置">
                        <div v-for="(option, index) in currentColumn.options || []" :key="index" class="option-item">
                            <el-input v-model="option.label" placeholder="标签" class="option-label"></el-input>
                            <el-input v-model="option.value" placeholder="值" class="option-value"></el-input>
                            <el-button type="danger" @click="removeOption(index)" icon="Delete" circle></el-button>
                        </div>
                        <el-button type="primary" @click="addOption">添加选项</el-button>
                    </el-form-item>
                </template>

                <template v-if="currentColumn.type === 'template'">
                    <el-form-item label="模板说明">
                        <el-alert title="需要手动编写模板函数，这里仅提供参考格式" type="info" :closable="false"></el-alert>
                        <el-input type="textarea" :rows="3"
                            placeholder="template: row => { return <span>{row.fieldName}</span> }"
                            v-model="currentColumn.templateCode"></el-input>
                    </el-form-item>
                </template>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="columnConfigVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveColumnConfig">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="tsx" name="codeGenerator">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

interface ColumnOption {
    label: string;
    value: string | number;
}

interface TableColumn {
    label: string;
    prop: string;
    type: string;
    width: string | number;
    auth: string;
    showOverflowTooltip: boolean;
    activeValue?: string | number;
    inactiveValue?: string | number;
    activeText?: string;
    inactiveText?: string;
    templateCode?: string;
    options?: ColumnOption[];
    [key: string]: any;
}

interface ActionButton {
    text: string;
    key: string;
    icon: string;
    auth: string;
    poptext: string;
}

interface SearchItem {
    label: string;
    prop: string;
    type: string;
    placeholder: string;
    optionKey: string;
    required: boolean;
}

interface ConfigState {
    apiPath: string;
    listApi: string;
    deleteApi: string;
    isSerialNo: boolean;
    isSelection: boolean;
    columns: TableColumn[];
    actions: ActionButton[];
    search: SearchItem[];
}

const activeTab = ref('basic');
const generatedCode = ref('');
const columnConfigVisible = ref(false);
const currentColumn = ref<TableColumn>({} as TableColumn);
const originalIndex = ref(-1);

const config = reactive<ConfigState>({
    apiPath: '@/api/system',
    listApi: 'getList',
    deleteApi: 'del',
    isSerialNo: false,
    isSelection: false,
    columns: [],
    actions: [],
    search: []
});

// 添加列
const addColumn = () => {
    config.columns.push({
        label: '',
        prop: '',
        type: 'text',
        width: '',
        auth: '',
        showOverflowTooltip: true
    });
};

// 移除列
const removeColumn = (index: number) => {
    config.columns.splice(index, 1);
};

// 显示列配置
const showColumnConfig = (column: TableColumn) => {
    currentColumn.value = JSON.parse(JSON.stringify(column));
    originalIndex.value = config.columns.findIndex(c => c === column);
    columnConfigVisible.value = true;

    // 确保选项数组存在
    if (['select', 'radio'].includes(currentColumn.value.type) && !currentColumn.value.options) {
        currentColumn.value.options = [];
    }
};

// 保存列配置
const saveColumnConfig = () => {
    if (originalIndex.value !== -1) {
        config.columns[originalIndex.value] = { ...currentColumn.value };
    }
    columnConfigVisible.value = false;
};

// 添加选项
const addOption = () => {
    if (!currentColumn.value.options) {
        currentColumn.value.options = [];
    }
    currentColumn.value.options.push({ label: '', value: '' });
};

// 移除选项
const removeOption = (index: number) => {
    if (currentColumn.value.options) {
        currentColumn.value.options.splice(index, 1);
    }
};

// 添加操作按钮
const addAction = () => {
    config.actions.push({
        text: '',
        key: '',
        icon: '',
        auth: '',
        poptext: ''
    });
};

// 移除操作按钮
const removeAction = (index: number) => {
    config.actions.splice(index, 1);
};

// 添加搜索项
const addSearch = () => {
    config.search.push({
        label: '',
        prop: '',
        type: 'input',
        placeholder: '',
        optionKey: '',
        required: false
    });
};

// 移除搜索项
const removeSearch = (index: number) => {
    config.search.splice(index, 1);
};

// 生成代码
const generateCode = () => {
    try {
        let code = generateVueTemplate();
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

// 生成Vue模板
const generateVueTemplate = (): string => {
    // 构建代码字符串，避免使用复杂的模板字符串
    let code = '';

    // 模板部分
    code += '<template>\n';
    code += '  <div class="container layout-pd">\n';
    code += '    <Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData" @selectionChange="selectionChange" @valueChange="valueChange">\n';
    code += '      <template #orBut>\n';
    code += '        <!-- 自定义按钮插槽 -->\n';
    code += '        <el-button type="primary" plain @click="handleBack.add" v-auth="\'sys:add\'">\n';
    code += '          新增\n';
    code += '        </el-button>\n';
    code += '        <el-button type="danger" plain :disabled="multipleSelection.length === 0" @click="handleDelete" v-auth="\'sys:del\'">\n';
    code += '          删除\n';
    code += '        </el-button>\n';
    code += '      </template>\n';
    code += '    </Table>\n';
    code += '  </div>\n';
    code += '</template>\n\n';

    // script部分
    code += '<script setup lang="tsx" name="tablePage">\n';
    code += 'import { defineAsyncComponent, reactive, ref } from \'vue\';\n';
    code += 'import { createTableConfig, createColumn, createSearchItem, createActionColumn } from \'@/components/table/template\';\n';
    code += 'import type { TableData } from \'@/components/table/types\';\n';
    code += 'import { ElMessage, ElMessageBox, ElImage, ElTag } from \'element-plus\';\n';
    code += `import { ${config.listApi} as getList, ${config.deleteApi} as del } from '${config.apiPath}';\n\n`;
    code += '// 引入组件\n';
    code += 'const Table = defineAsyncComponent(() => import(\'@/components/table/index.vue\'));\n\n';
    code += 'const handleBack = {\n';
    code += '  add: () => {\n';
    code += '    // 添加逻辑，打开对话框等\n';
    code += '    console.log(\'添加\');\n';
    code += '  },\n';

    // 处理操作按钮
    config.actions.forEach(action => {
        code += `  ${action.key}: (e: any) => {\n`;
        code += `    // ${action.text}逻辑\n`;
        code += `    console.log('${action.text}', e);\n`;
        code += '  },\n';
    });

    code += '};\n\n';

    // 弹窗
    code += '// 弹窗\n';
    code += '// const openDialog = (id?: number) => {\n';
    code += '//   (window as any).$dialog(id ? \'编辑\' : \'添加\', dialog, { id })\n';
    code += '//     .$on(\'success\', (e: any) => {\n';
    code += '//       getTableData(queryParams);\n';
    code += '//     });\n';
    code += '// };\n\n';
    code += 'const multipleSelection = ref([]);\n';
    code += '// 多选选中\n';
    code += 'const selectionChange = (val: any[]) => {\n';
    code += '  multipleSelection.value = val;\n';
    code += '};\n\n';
    code += 'const handleDelete = () => {\n';
    code += '  if (multipleSelection.value.length === 0) {\n';
    code += '    ElMessage.warning(\'请选择要删除的数据\');\n';
    code += '    return;\n';
    code += '  }\n';
    code += '  \n';
    code += '  const ids = multipleSelection.value.map((item: any) => item.id).join(\',\');\n';
    code += '  ElMessageBox.confirm(\'是否确认删除所选数据?\', \'警告\', {\n';
    code += '    confirmButtonText: \'确定\',\n';
    code += '    cancelButtonText: \'取消\',\n';
    code += '    type: \'warning\',\n';
    code += '  }).then(() => {\n';
    code += '    // 删除逻辑\n';
    code += '    // handleBack.delete(multipleSelection.value);\n';
    code += '  }).catch(() => {});\n';
    code += '};\n\n';
    code += 'const actionBack = (item: any, row: any) => {\n';
    code += '  handleBack[item.key as keyof typeof handleBack]?.(row);\n';
    code += '};\n\n';
    code += 'const state = reactive<{ tableData: TableData }>({\n';
    code += '  tableData: createTableConfig({\n';
    code += '    columns: [\n';

    // 处理列配置
    config.columns.forEach(col => {
        code += '      createColumn(\'';
        code += col.label;
        code += '\', \'';
        code += col.prop;
        code += '\', { ';

        if (col.type === 'template') {
            code += 'template: row => {\n';
            code += col.templateCode || `        return <span>{row.${col.prop}}</span>\n`;
            code += '      }';
        } else if (col.type === 'switch') {
            code += `type: '${col.type}'`;
            if (col.activeValue) code += `, activeValue: ${col.activeValue}`;
            if (col.inactiveValue) code += `, inactiveValue: ${col.inactiveValue}`;
            if (col.activeText) code += `, activeText: '${col.activeText}'`;
            if (col.inactiveText) code += `, inactiveText: '${col.inactiveText}'`;
        } else if (['select', 'radio'].includes(col.type) && col.options?.length) {
            code += `type: '${col.type}', options: [\n`;
            col.options.forEach((opt, index) => {
                code += `        { label: '${opt.label}', value: ${opt.value} }`;
                if (index < (col.options?.length || 0) - 1) code += ',\n';
                else code += '\n      ]';
            });
        } else {
            code += `type: '${col.type}'`;
        }

        // 处理通用配置
        if (col.width) code += `, width: ${col.width}`;
        if (col.auth) code += `, auth: '${col.auth}'`;
        if (col.showOverflowTooltip === false) code += `, showOverflowTooltip: false`;

        code += ' }),\n';
    });

    // 处理操作列
    if (config.actions.length) {
        code += '      createActionColumn([\n';
        config.actions.forEach((action, index) => {
            code += '        { ';
            code += `key: '${action.key}', `;
            code += `text: '${action.text}', `;
            code += 'onClick: actionBack, ';
            if (action.auth) code += `auth: '${action.auth}', `;
            if (action.poptext) code += `poptext: '${action.poptext}', `;
            code += `icon: '${action.icon}'`;
            code += ' }';
            if (index < config.actions.length - 1) code += ',\n';
            else code += '\n      ])\n';
        });
    }

    code += '    ],\n';
    code += '    search: [\n';

    // 处理搜索配置
    config.search.forEach((search, index) => {
        code += '      createSearchItem(\'';
        code += search.label;
        code += '\', \'';
        code += search.prop;
        code += '\', \'';
        code += search.type;
        code += '\', {';

        let hasOption = false;
        if (search.placeholder) {
            code += ` placeholder: '${search.placeholder}'`;
            hasOption = true;
        }
        if (search.optionKey) {
            if (hasOption) code += ', ';
            code += `optionKey: '${search.optionKey}'`;
            hasOption = true;
        }
        if (search.required) {
            if (hasOption) code += ', ';
            code += 'required: true';
        }

        code += ' })';
        if (index < config.search.length - 1) code += ',\n';
        else code += '\n';
    });

    code += '    ],\n';
    code += '    config: {\n';
    code += `      isSelection: ${config.isSelection},\n`;
    code += `      isSerialNo: ${config.isSerialNo}\n`;
    code += '    }\n';
    code += '  }),\n';
    code += '});\n\n';
    code += '// table 值变更\n';
    code += 'const valueChange = (row: any, prop: string, value: any, type: string) => {\n';
    code += '  console.log(\'值变更\', row, prop, value, type);\n';
    code += '};\n\n';
    code += 'let queryParams = {} as any;\n\n';
    code += '// 获取表格数据\n';
    code += 'const getTableData = async (e: any) => {\n';
    code += '  queryParams = e;\n';
    code += '  state.tableData.config.loading = true;\n';
    code += '  try {\n';
    code += '    const res = await getList(e);\n';
    code += '    state.tableData.data = res.data.list || res.data || []; // 设置实际数据\n';
    code += '    state.tableData.config.total = res.data.total || res.data.length || 0; // 设置数据总数\n';
    code += '  } catch (error) {\n';
    code += '    console.error(error);\n';
    code += '    ElMessage.error(\'获取数据失败\');\n';
    code += '  } finally {\n';
    code += '    state.tableData.config.loading = false;\n';
    code += '  }\n';
    code += '};\n';
    code += '<\/script>\n\n';

    // style部分
    code += '<style scoped lang="scss">\n';
    code += '.container {\n';
    code += '  height: 100%;\n';
    code += '  overflow: hidden;\n';
    code += '  flex: 1;\n';
    code += '  display: flex;\n';
    code += '  flex-direction: column;\n';
    code += '}\n';
    code += '</style>';

    return code;
};

onMounted(() => {
    // 初始化配置示例
    config.columns = [
        { label: '编号', prop: 'id', type: 'text', width: 80, auth: '', showOverflowTooltip: true },
        { label: '名称', prop: 'name', type: 'text', width: 150, auth: '', showOverflowTooltip: true }
    ];

    config.actions = [
        { text: '编辑', key: 'edit', icon: 'Edit', auth: 'sys:edit', poptext: '' },
        { text: '删除', key: 'delete', icon: 'Delete', poptext: '是否确认删除？', auth: 'sys:del' }
    ];

    config.search = [
        { label: '名称', prop: 'name', type: 'input', placeholder: '请输入名称', optionKey: '', required: false }
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