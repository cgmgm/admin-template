import webSocketClient from '@/utils/websocket';
import { Session } from '@/utils/storage';
import { useCats } from '@/stores/cats';
import pinia from '@/stores/index';
// 初始化配置
const initApp = () => {
    const storeCats = useCats(pinia);
    storeCats.getAllDict();
    console.log(Session.get('wstoken'));
    if (Session.get('wstoken')) {
        webSocketClient.connect();
    }
}

export default {
    initApp
}