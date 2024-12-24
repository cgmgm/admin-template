import { VNode } from 'vue';

// 表格列配置接口
export interface TableColumn {
    prop: string;
    label: string;
    colWidth?: string | number;
    width?: string | number;
    type?: 'text' | 'image' | 'input' | 'switch' | 'radio' | 'date' | 'select';
    formatter?: (row: any) => VNode | string | number | VNode[];
    height?: number;
    activeValue?: boolean | string | number;
    inactiveValue?: boolean | string | number;
    activeText?: string;
    inactiveText?: string;
    placeholder?: string;
    options?: Array<{
        label: string;
        value: any;
    }>;
    filterable?: boolean;
    isCheck?: boolean;
    auth?: string[];
    [key: string]: any;
}

// 搜索项配置接口
export interface SearchItem {
    label: string;
    prop: string;
    type: 'input' | 'select' | 'date' | 'datetimerange';
    placeholder?: string;
    value?: any;
    options?: Array<{
        label: string;
        value: any;
    }>;
    required?: boolean;
    startPlaceholder?: string;
    endPlaceholder?: string;
    [key: string]: any;
}

// 表格配置接口
export interface TableConfig {
    total: number;
    loading: boolean;
    isBorder: boolean;
    isSerialNo: boolean;
    isSelection: boolean;
    treeProps?: {
        children: string;
        hasChildren: string;
    };
}

// 分页参数接口
export interface PaginationParam {
    pageNum: number;
    pageSize: number;
}

// 完整的表格数据接口
export interface TableData {
    data: any[];
    columns: TableColumn[];
    config: TableConfig;
    search: SearchItem[];
    param: PaginationParam;
    printName: string;
} 