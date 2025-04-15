import { storeToRefs } from 'pinia';
import { useThemeConfig } from '@/stores/themeConfig';
import { useUserInfo } from '@/stores/userInfo';
import { useCats } from '@/stores/cats';
import pinia from '@/stores/index';

export function useConfig() {
    const store = useThemeConfig(pinia);
    return { themeConfig: store.themeConfig, store };
}
export function useUser() {
    const store = useUserInfo(pinia);
    return { userInfos: store.userInfos, store };
}
export function useCat() {
    const store = useCats(pinia);
    const initDict = async (key: string) => {
        await store.getDict(key);
    };
    const getDept = async () => {
        await store.getAllDept();
        return store.depts;
    };
    const getRole = async () => {
        await store.getAllrole();
        return store.role;
    };
    const getMerchanRole = async () => {
        await store.getAllMerchanRole();
        return store.merchanRole;
    };
    const getMerchan = async () => {
        await store.getAllMerchan();
        return store.merchan;
    };
    return { initDict, getDept, getRole, getMerchanRole, getMerchan, store };
}