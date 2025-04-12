import { dayjs, ElIcon, ElButton, ElPopconfirm } from 'element-plus';
import { TableColumn } from './types';
import { auths } from '@/utils/authFunction';
import { Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'

/**
 * 创建表格配置的工厂函数
 * @param options 自定义配置选项
 * @returns 表格完整配置对象
 */
export const createTableConfig = (options: {
    columns?: TableColumn[];
    search?: any[];
    param?: {
        pageNum?: number;
        pageSize?: number;
    };
    config?: {
        total?: number;
        loading?: boolean;
        isBorder?: boolean;
        isSerialNo?: boolean;
        isSelection?: boolean;
    };
    printName?: string;
} = {}) => {
    return {
        // 列表数据
        data: [],
        // 表头内容
        columns: options.columns || [],
        // 配置项
        config: {
            total: options.config?.total ?? 0,
            loading: options.config?.loading ?? false,
            isBorder: options.config?.isBorder ?? true,
            isSerialNo: options.config?.isSerialNo ?? false,
            isSelection: options.config?.isSelection ?? false,
        },
        // 搜索表单
        search: options.search || [],
        // 分页参数
        param: {
            pageNum: options.param?.pageNum ?? 1,
            pageSize: options.param?.pageSize ?? 50,
        },
        // 打印标题
        printName: options.printName || dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
};

/**
 * 创建表格列配置
 * @param label 列标签
 * @param prop 列属性名
 * @param options 其他选项
 * @returns 列配置对象
 */
export const createColumn = (
    label: string,
    prop: string,
    options: Partial<TableColumn> = {}
): TableColumn => {
    return {
        label,
        prop,
        colWidth: options.colWidth || '',
        type: options.type || 'text',
        width: options.width,
        minWidth: options.minWidth || 90,
        height: options.height,
        isCheck: options.isCheck ?? true,
        ...options,
    };
};
const icons = { Delete, Edit, Search, Share, Upload };
/**
 * 创建操作列，有删除和编辑按钮
 * @param options 其他选项
 * @returns 操作列配置对象
 */
export const createActionColumn = (bntList: Object[], options: Partial<TableColumn> = {}) => {
    bntList = bntList.filter((col: any) => (col.auth ? auths(col.auth) : true));
    const width = bntList.length * 85;
    return createColumn('操作', 'action', {
        ...options,
        fixed: 'right',
        width,
        template: (row: any) => {
            return () => bntList.map((item: any) => {
                const IconComponent = icons[item.icon]
                const button = (
                    <ElButton
                        type="text"
                        onClick={() => !item.poptext && item.onClick(item, row)}
                    >
                        {IconComponent && <ElIcon><IconComponent /></ElIcon>}
                        {item.text}
                    </ElButton>
                );

                if (item.poptext) {
                    return (
                        <ElPopconfirm
                            title={item.poptext}
                            onConfirm={() => item.onClick(item, row)}
                        >
                            {{
                                reference: () => button
                            }}
                        </ElPopconfirm>
                    );
                }

                return button;
            });
        }
    });
};

/**
 * 创建搜索项配置
 * @param label 标签
 * @param prop 属性名
 * @param type 类型
 * @param options 其他选项
 * @returns 搜索项配置对象
 */
export const createSearchItem = (
    label: string,
    prop: string,
    type: 'input' | 'select' | 'date' | 'datetimerange',
    options: any = {}
) => {
    return {
        label,
        prop,
        type,
        placeholder: options.placeholder || `请输入${label}`,
        value: options.value,
        options: options.options,
        ...options,
    };
};

/**
 * 创建货币列配置
 * @param value 默认值
 * @param hasAll 是否包含全部选项
 * @returns 货币列配置对象
 */
export const createCurrency = (value: number = 1, hasAll: boolean = false) => {
    return createSearchItem('币种', 'cid', 'select', {
        options: [
            ...(hasAll ? [{ label: '全部', value: 2 }] : []),
            { label: 'USD', value: 1 },
            { label: 'RMB', value: 0 },
        ],
        value,
        placeholder: '请选择币种',
        filterable: true
    });
};
/**
 * 创建桌面列表配置
 * @param value 默认值
 */
export const createDeskList = (value: number = 1) => {
    return createSearchItem('台桌', 'desk_id', 'select', {
        options: [
            { label: '全部', value: 2 },
            { label: '台桌1', value: 1 },
            { label: '台桌2', value: 0 },
        ],
        value,
        placeholder: '请选择币种',
        filterable: true
    });
};

// 预设的搜索项快捷选项
export const dateRangePresets = {
    today: [
        new Date(new Date().setHours(0, 0, 0, 0)),
        new Date(new Date().setHours(23, 59, 59, 999)),
    ],
    yesterday: [
        new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0),
        new Date(new Date().setDate(new Date().getDate() - 1)).setHours(23, 59, 59, 999),
    ],
    thisWeek: [
        new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).setHours(0, 0, 0, 0),
        new Date(),
    ],
    thisMonth: [
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        new Date(),
    ],
};

// 使用示例：
/*
import { createTableConfig, createColumn, createSearchItem } from './template';

const tableData = createTableConfig({
    columns: [
        createColumn('采样点名称', 'name', { type: 'text' }),
        createColumn('详细地址', 'address', { type: 'text' }),
        createColumn('图片描述', 'image', { 
            type: 'image',
            width: '70'
        }),
    ],
    search: [
        createSearchItem('采样点名称', 'name', 'input', {
            value: '莲塘别墅广场'
        }),
        createSearchItem('开放时间', 'time', 'datetimerange', {
            value: [
                new Date(2024, 0, 1, 6, 0, 0).toISOString(),
                new Date(2024, 0, 1, 23, 59, 59).toISOString(),
            ]
        }),
        createSearchItem('支持24小时', 'isSupport', 'select', {
            options: [
                { label: '是', value: 1 },
                { label: '否', value: 0 },
            ],
            value: 1
        }),
    ],
    config: {
        isSelection: true,
        isSerialNo: true,
    },
    param: {
        pageSize: 50,
    },
    printName: '核酸采样点列表',
});
*/ 