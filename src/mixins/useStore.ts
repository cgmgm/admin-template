import { storeToRefs } from 'pinia';
import { useThemeConfig } from '@/stores/themeConfig';
import { useUserInfo } from '@/stores/userInfo';
import { useCats } from '@/stores/cats';
import { computed, onMounted } from 'vue';

export function useConfig() {
    const store = useThemeConfig();
    const { themeConfig } = storeToRefs(store);
    return { themeConfig, store };
}
export function useUser() {
    const store = useUserInfo();
    const { userInfos } = storeToRefs(store);
    return { userInfos, store };
}
export function useCat() {
    const store = useCats();
    const { dictData, depts, game, desk } = storeToRefs(store);
    const initDict = async (key: string) => {
        await store.getDict(key);
    };
    const getDept = async () => {
        return await store.getAllDept();
    };
    const getRole = async () => {
        return await store.getAllrole();
    };
    const getMerchanRole = async () => {
        return await store.getAllMerchanRole();
    };
    const getMerchan = async () => {
        return await store.getAllMerchan();
    };
    return { dictData, depts, game, desk, initDict, getDept, getRole, getMerchanRole, getMerchan };
}