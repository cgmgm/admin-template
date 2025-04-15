// 为Element Plus声明类型

declare module 'element-plus' {
    export const ElMessage: {
        success(message: string): void;
        warning(message: string): void;
        error(message: string): void;
        info(message: string): void;
    };

    export const ElMessageBox: {
        confirm(message: string, title: string, options?: any): Promise<any>;
        alert(message: string, title: string, options?: any): Promise<any>;
    };
}
