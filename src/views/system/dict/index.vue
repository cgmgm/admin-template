<template>
    <div class="container layout-pd">
        <el-row :gutter="20" class="w100 h100" style="flex:1;">
            <!--字典类型区域-->
            <el-col :span="6" :xs="24">
                <div style="height: 100%;background: var(--el-fill-color-blank);padding:5px;">
                    <div class="head-container">
                        <el-input v-model="dictTypeFilter" placeholder="请输入字典类型名称" clearable :prefix-icon="Search"
                            style="flex:1;" />
                        <el-button type="primary" plain @click="handleBack.addDict" v-auth="'保存字典'">
                            新增字典
                        </el-button>
                    </div>
                    <div class="head-container">
                        <el-table :data="dictTypeList" height="calc(100vh - 230px)" border>
                            <el-table-column prop="name" label="字典名称" />
                            <el-table-column prop="type" label="字典类型" />
                            <el-table-column label="操作" width="120">
                                <template #default="scope">
                                    <el-button link type="primary" @click="handleSelectDict(scope.row)">查看</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </el-col>

            <el-col :span="18" :xs="24">
                <Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData" @selectionChange="selectionChange"
                    @valueChange="valueChange">
                    <template #orBut>
                        <!-- 自定义按钮插槽 -->
                        <el-button type="primary" plain @click="handleBack.add" v-auth="'保存字典项'">
                            新增
                        </el-button>
                        <el-button type="danger" plain :disabled="multipleSelection.length === 0" @click="handleDelete"
                            v-auth="'删除字典项'">
                            删除
                        </el-button>
                    </template>
                </Table>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="tsx" name="systemDict">
import { defineAsyncComponent, reactive, ref, computed, watch } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createActionColumn } from '@/components/table/template';
import type { TableData } from '@/components/table/types';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import dictDialog from './dialog.vue';
import dictDataDialog from './data-dialog.vue';
import { getDictionaries, getDictItems, deleteDictItem } from '@/api/system';

// 引入组件
const Table = defineAsyncComponent(() => import('@/components/table/index.vue'));

// 字典类型数据
const dictTypeList = ref([]);
const dictTypeFilter = ref('');
const currentDict = ref<any>(null);

// 选择字典类型
const handleSelectDict = (dict: any) => {
    currentDict.value = dict;
    queryParams.dictId = dict.id;
    getTableData(queryParams);
};

// 按钮操作
const handleBack = {
    addDict: () => {
        openDictDialog();
    },
    add: () => {
        if (!currentDict.value) {
            ElMessage.warning('请先选择左侧字典类型');
            return;
        }
        openDialog();
    },
    edit: (e: any) => {
        openDialog(e.id);
    },
    delete: (e: any) => {
        handleSingleDelete(e);
    }
};

// 删除单个字典项
const handleSingleDelete = (row: any) => {
    ElMessageBox.confirm(`确认删除字典数据项"${row.name}"吗?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            await deleteDictItem(row.id);
            getTableData(queryParams);
            ElMessage.success('删除成功');
        } catch (error) {
            console.error('删除失败', error);
        }
    }).catch(() => { });
};

// 批量删除字典项
const handleDelete = () => {
    if (multipleSelection.value.length === 0) {
        ElMessage.warning('请选择要删除的数据');
        return;
    }

    const ids = multipleSelection.value.map((item: any) => item.id).join(',');
    ElMessageBox.confirm(`确认删除选中的${multipleSelection.value.length}项数据吗?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            // 批量删除接口，这里简化为单个删除
            await deleteDictItem({ id: ids });
            getTableData(queryParams);
            ElMessage.success('删除成功');
        } catch (error) {
            console.error('删除失败', error);
        }
    }).catch(() => { });
};

// 表格选择和状态变更
const multipleSelection = ref([]);
const selectionChange = (val: any) => {
    multipleSelection.value = val;
};

const valueChange = (row: any, prop: string, value: any, type: string) => {
    console.log('值变更', row, prop, value, type);
};

// 操作回调
const actionBack = (item: any, row: any) => {
    handleBack[item.key as keyof typeof handleBack]?.(row);
};

let queryParams = {
    dictId: undefined,
    page: 1,
    page_size: 20
};

// 表格配置
const state = reactive({
    tableData: createTableConfig({
        columns: [
            createColumn('字典编码', 'code', { width: 150 }),
            createColumn('字典标签', 'name', { width: 150 }),
            createColumn('字典键值', 'value'),
            createColumn('排序', 'sort', { width: 80 }),
            createColumn('状态', 'status', {
                type: 'switch',
                activeValue: 1,
                inactiveValue: 0,
                activeText: '启用',
                inactiveText: '禁用'
            }),
            createColumn('备注', 'remark', { showOverflowTooltip: true }),
            createColumn('创建时间', 'created_at', { width: 160 }),
            createActionColumn([
                { key: 'edit', text: '编辑', onClick: actionBack, auth: '保存字典项', icon: 'Edit' },
                { key: 'delete', text: '删除', onClick: actionBack, poptext: '是否确认删除？', auth: '删除字典项', icon: 'Delete' }
            ])
        ],
        search: [
            createSearchItem('字典编码', 'code', 'input', { placeholder: '字典编码' }),
            createSearchItem('字典标签', 'name', 'input', { placeholder: '字典标签' }),
            createSearchItem('状态', 'status', 'select', {
                placeholder: '字典状态',
                options: [
                    { label: '启用', value: 1 },
                    { label: '禁用', value: 0 }
                ]
            })
        ],
        config: {
            isSelection: true,
            loading: false
        }
    })
});

// 监听字典类型筛选
watch(
    () => dictTypeFilter.value,
    (val) => {
        loadDictTypes();
    }
);

// 加载字典类型列表
const loadDictTypes = async () => {
    try {
        const res = await getDictionaries({
            name: dictTypeFilter.value,
            page: 1,
            page_size: 100
        });
        dictTypeList.value = res.data.items || [];
    } catch (error) {
        console.error('获取字典类型失败', error);
    }
};
const openDictDialog = () => {
    (window as any).$dialog('新增字典', dictDialog, {}).$on('success', () => {
        loadDictTypes();
    });
};
// 打开字典项对话框
const openDialog = (id?: number | string) => {
    if (!currentDict.value) return;

    (window as any).$dialog(
        id ? '编辑字典数据' : '添加字典数据',
        dictDataDialog,
        { id, dictId: currentDict.value.id }
    ).$on('success', () => {
        getTableData(queryParams);
    });
};

// 获取字典项数据
const getTableData = async (params: any) => {
    if (!currentDict.value) return;
    queryParams = params;
    state.tableData.config.loading = true;

    try {
        // 这里使用字典详情接口获取数据项，实际上应该有分页接口
        const res = await getDictItems({ type: currentDict.value.type, ...queryParams });
        state.tableData.data = res.data || [];
        state.tableData.config.total = res.data?.length || 0;
    } catch (error) {
        console.error('获取字典数据失败', error);
        ElMessage.error('获取字典数据失败');
    } finally {
        state.tableData.config.loading = false;
    }
};

// 初始化
(async () => {
    await loadDictTypes();
    if (dictTypeList.value.length > 0) {
        handleSelectDict(dictTypeList.value[0]);
    }
})();
</script>

<style scoped lang="scss">
.container {
    height: 100%;
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.head-container {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
}
</style>