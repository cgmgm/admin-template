<template>
    <div class="container layout-pd">
        <el-row :gutter="20" class="w100 h100" style="flex:1;">
            <!--文件类型筛选-->
            <el-col :span="4" :xs="24">
                <div style="height: 100%;background: var(--el-fill-color-blank);padding:5px;">
                    <div class="head-container">
                        <el-input v-model="filterName" placeholder="请输入类型名称" clearable :prefix-icon="Search"
                            style="margin-bottom: 20px" />
                    </div>
                    <div class="head-container">
                        <el-tree :data="treeData" :props="{ children: 'children', label: 'name' }" node-key="value"
                            :expand-on-click-node="false" :filter-node-method="filterNode" ref="tree" default-expand-all
                            @node-click="handleNodeClick" />
                    </div>
                </div>
            </el-col>

            <el-col :span="20" :xs="24">
                <Table ref="tableRef" v-bind="state.tableData" @fetch="getTableData" @selectionChange="selectionChange">
                    <template #orBut>
                        <!-- 自定义按钮插槽 -->
                        <el-button type="primary" plain @click="handleUpload" v-auth="'sys:files:upload'">
                            上传文件
                        </el-button>
                        <el-button type="danger" plain :disabled="!selectList.length" @click="handleDelete"
                            v-auth="'sys:files:del'">
                            删除
                        </el-button>
                    </template>
                </Table>
            </el-col>
        </el-row>

        <!-- 文件详情对话框 -->
        <el-dialog v-model="detailDialogVisible" title="文件详情" width="650px">
            <template v-if="currentFile">
                <div class="file-detail">
                    <!-- 预览区域 -->
                    <div class="preview-area">
                        <el-image v-if="currentFile.type === 'image'" :src="currentFile.url" fit="contain" />
                        <video v-else-if="currentFile.type === 'video'" controls :src="currentFile.url"></video>
                        <div v-else class="no-preview">
                            <el-icon :size="64">
                                <Document />
                            </el-icon>
                            <p>此文件类型无法预览</p>
                        </div>
                    </div>
                    <!-- 详细信息 -->
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="文件名">{{ currentFile.name }}</el-descriptions-item>
                        <el-descriptions-item label="文件类型">{{ currentFile.type }}</el-descriptions-item>
                        <el-descriptions-item label="文件大小">{{ currentFile.formatted_size ||
                            formatFileSize(currentFile.size) }}</el-descriptions-item>
                        <el-descriptions-item label="文件格式">{{ currentFile.extension }}</el-descriptions-item>
                        <el-descriptions-item label="MIME类型">{{ currentFile.mime_type }}</el-descriptions-item>
                        <el-descriptions-item label="创建时间">{{ currentFile.created_at }}</el-descriptions-item>
                        <el-descriptions-item label="MD5哈希值" v-if="currentFile.md5">{{ currentFile.md5
                            }}</el-descriptions-item>
                    </el-descriptions>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="tsx" name="systemfiles">
import { defineAsyncComponent, reactive, ref, computed, watch } from 'vue';
import { createTableConfig, createColumn, createSearchItem, createActionColumn } from '@/components/table/template';
import type { TableData } from '@/components/table/types';
import { useCat } from '@/mixins/useStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Document, Delete, Download, View } from '@element-plus/icons-vue';
import { getFiles as getList, delFile as del, fileTypeOptions, formatFileSize } from '@/api/files';

// 引入组件
const Table = defineAsyncComponent(() => import('@/components/table/index.vue'));
const UploadDialog = defineAsyncComponent(() => import('./upload-dialog.vue'));

const handleUpload = () => {
    (window as any).$dialog('上传文件', UploadDialog);
};

const handleBack = {
    view: (e: any) => {
        currentFile.value = e;
        detailDialogVisible.value = true;
    },
    delete: (e?: any) => {
        ElMessageBox.confirm('是否确认删除该文件?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            del({ id: e.id }).then(() => {
                getTableData(queryParams);
                ElMessage.success('删除成功');
            });
        });
    },
    download: (e: any) => {
        window.open(e.url);
    },
}

const handleDelete = () => {
    const ids = selectList.value;
    if (!ids.length) return;

    ElMessageBox.confirm(`是否确认删除选中的 ${ids.length} 个文件?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        del({ id: ids.join(',') }).then(() => {
            getTableData(queryParams);
            ElMessage.success('删除成功');
        });
    });
}

const actionBack = (item: any, row: any) => {
    handleBack[item.key as keyof typeof handleBack]?.(row);
}

// 文件类型树结构
const treeData = computed(() => {
    const root = { name: '所有文件', value: '', children: [] as any };
    fileTypeOptions.filter(item => item.value).forEach(item => {
        root.children.push({
            name: item.label,
            value: item.value
        });
    });
    return [root];
});

// 过滤筛选
const tree = ref();
const filterName = ref('');
watch(
    () => filterName.value,
    (newValue) => {
        tree.value.filter(newValue);
    }
);

// 选中项管理
const selectList = ref([]);
const selectionChange = (val: any) => {
    selectList.value = val.map((item: any) => item.id);
}

// 文件详情对话框
const detailDialogVisible = ref(false);
const currentFile = ref<any>(null);
const typeTab = {
    image: 'success',
    video: 'warning',
    document: 'info',
    other: 'danger'
}
// 表格配置
const state = reactive<{ tableData: TableData }>({
    tableData: createTableConfig({
        columns: [
            createColumn('文件名', 'name'),
            createColumn('预览', 'url', {
                width: 120,
                template: row => {
                    if (row.type === 'image') {
                        return <el-image style={{ width: '80px', height: '80px', objectFit: 'cover' }} src={row.url} preview-src-list={[row.url]} />
                    } else if (row.type === 'video') {
                        return <el-button type="primary" size="small" onClick={() => handleBack.view(row)}>预览视频</el-button>
                    } else {
                        return <el-icon size={24}><Document /></el-icon>
                    }
                }
            }),
            createColumn('类型', 'type', {
                width: 130,
                template: row => <el-tag type={typeTab[row.type as keyof typeof typeTab]}>{row.type}</el-tag>
            }),
            createColumn('扩展名', 'extension', { width: 100 }),
            createColumn('文件大小', 'size', {
                width: 120,
                template: row => <span>{formatFileSize(row.size)}</span>
            }),
            createColumn('创建时间', 'created_at'),
            createActionColumn([
                { key: 'view', text: '查看详情', onClick: actionBack, auth: '文件详情', icon: 'View' },
                { key: 'download', text: '下载', onClick: actionBack, icon: 'Download' },
                { key: 'delete', text: '删除', onClick: actionBack, poptext: '是否确认删除？', auth: '文件删除', icon: 'Delete' }
            ]),
        ],
        search: [
            createSearchItem('文件名', 'keyword', 'input', {
                placeholder: '请输入文件名或路径'
            }),
            createSearchItem('文件类型', 'type', 'select', {
                placeholder: '请选择文件类型',
                options: fileTypeOptions
            }),
            createSearchItem('文件扩展名', 'extension', 'input', {
                placeholder: '请输入扩展名'
            }),
            createSearchItem('上传日期', 'date_range', 'datetimerange', {
                startPlaceholder: '开始日期',
                endPlaceholder: '结束日期'
            })
        ],
        config: {
            isSelection: true
        }
    }),
});

let queryParams = {} as any;
// 节点单击事件
const handleNodeClick = (data: any) => {
    queryParams.type = data.value;
    getTableData(queryParams);
};

// 获取表格数据
const getTableData = async (e: any) => {
    queryParams = e;
    state.tableData.config.loading = true;
    // 处理日期范围
    if (e.date_range && e.date_range.length === 2) {
        queryParams.start_date = e.date_range[0];
        queryParams.end_date = e.date_range[1];
        delete queryParams.date_range;
    }
    try {
        const row = await getList(queryParams);
        state.tableData.data = row.data.items || []; // 设置实际数据
        state.tableData.config.total = row.data.total || 0; // 设置数据总数
    } catch (error) {
        console.error(error);
    } finally {
        state.tableData.config.loading = false;
    }
};

// 筛选节点
const filterNode = (value: string, data: any) => {
    if (!value) return true;
    return data.name.indexOf(value) !== -1;
};
</script>

<style scoped lang="scss">
.container {
    height: 100%;
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.preview-area {
    margin-bottom: 20px;
    text-align: center;

    .el-image,
    video {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;
    }

    .no-preview {
        padding: 30px;
        color: var(--el-text-color-secondary);
        text-align: center;
    }
}

.file-detail {
    padding: 20px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
}
</style>