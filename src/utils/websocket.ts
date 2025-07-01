import { Session } from '@/utils/storage';
import mitt from '@/utils/mitt';

/**
 * WebSocket 连接管理类
 */
class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string = import.meta.env.VITE_WS_URL;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectInterval: number = 3000; // 重连间隔，单位毫秒
    private reconnectTimeoutId: number | null = null;
    private heartbeatInterval: number | null = null;
    private heartbeatTimeoutId: number | null = null;
    private isConnecting: boolean = false;

    /**
     * 创建并连接 WebSocket
     */
    connect(): void {
        if (this.isConnecting || this.ws?.readyState === WebSocket.CONNECTING || this.ws?.readyState === WebSocket.OPEN) {
            console.log('WebSocket 已连接或正在连接中');
            return;
        }

        const wsToken = Session.get('wstoken');
        if (!wsToken) {
            console.error('缺少 WebSocket 令牌，无法连接');
            return;
        }

        this.isConnecting = true;

        try {
            // 使用 wstoken 连接 WebSocket
            const wsUrl = `${this.url}?token=${wsToken}`;
            this.ws = new WebSocket(wsUrl);

            // 绑定事件处理器
            this.ws.onopen = this.onOpen.bind(this);
            this.ws.onmessage = this.onMessage.bind(this);
            this.ws.onclose = this.onClose.bind(this);
            this.ws.onerror = this.onError.bind(this);
        } catch (error) {
            console.error('WebSocket 连接失败:', error);
            this.isConnecting = false;
            this.reconnect();
        }
    }

    /**
     * WebSocket 连接成功回调
     */
    private onOpen(event: Event): void {
        console.log('WebSocket 连接成功');
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // 发送事件通知
        mitt.emit('ws-connected', { event });

        // 启动心跳检测
        this.startHeartbeat();
    }

    /**
     * WebSocket 消息处理回调
     */
    private onMessage(event: MessageEvent): void {
        try {
            const data = JSON.parse(event.data);
            // 发送接收到消息的事件
            mitt.emit('ws-message', data);
        } catch (error) {
            console.error('WebSocket 消息解析错误:', error);
        }
    }

    /**
     * WebSocket 关闭回调
     */
    private onClose(event: CloseEvent): void {
        console.log('WebSocket 连接关闭:', event.code, event.reason);
        this.isConnecting = false;
        this.ws = null;

        // 清理心跳检测
        this.stopHeartbeat();

        // 发送关闭事件
        mitt.emit('ws-closed', { event });

        // 尝试重新连接
        if (!event.wasClean) {
            this.reconnect();
        }
    }

    /**
     * WebSocket 错误回调
     */
    private onError(event: Event): void {
        console.error('WebSocket 错误:', event);
        this.isConnecting = false;

        // 发送错误事件
        mitt.emit('ws-error', { event });
    }

    /**
     * 重连 WebSocket
     */
    private reconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('WebSocket 重连次数已达最大值，停止重连');
            mitt.emit('ws-reconnect-failed', {});
            return;
        }

        if (this.reconnectTimeoutId !== null) {
            window.clearTimeout(this.reconnectTimeoutId);
        }

        this.reconnectAttempts++;
        console.log(`WebSocket 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        // 延时重连
        this.reconnectTimeoutId = window.setTimeout(() => {
            this.connect();
        }, this.reconnectInterval);
    }

    /**
     * 发送消息
     */
    send(data: any): boolean {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            this.ws.send(message);
            return true;
        }
        console.error('WebSocket 未连接，无法发送消息');
        return false;
    }

    /**
     * 关闭 WebSocket 连接
     */
    close(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        // 清理所有计时器
        this.stopHeartbeat();
        if (this.reconnectTimeoutId !== null) {
            window.clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }

        this.isConnecting = false;
    }

    /**
     * 开始心跳检测
     */
    private startHeartbeat(): void {
        // 清理已有心跳
        this.stopHeartbeat();

        // 每30秒发送一次心跳
        this.heartbeatInterval = window.setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                // 发送心跳包
                this.send({ type: 'ping' });
            }
        }, 30000); // 15秒发送一次心跳
    }

    /**
     * 停止心跳检测
     */
    private stopHeartbeat(): void {
        if (this.heartbeatInterval !== null) {
            window.clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }

        if (this.heartbeatTimeoutId !== null) {
            window.clearTimeout(this.heartbeatTimeoutId);
            this.heartbeatTimeoutId = null;
        }
    }

    /**
     * 处理心跳响应
     */
    handlePong(): void {
        // 收到pong响应，清除超时计时器
        if (this.heartbeatTimeoutId !== null) {
            window.clearTimeout(this.heartbeatTimeoutId);
            this.heartbeatTimeoutId = null;
        }
    }
}

// 创建单例
const webSocketClient = new WebSocketClient();

export default webSocketClient; 