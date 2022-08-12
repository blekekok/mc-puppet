import EventEmitter from "events";
import { Socket } from "net";
import { SimpleTCPClient, BufferData, ConnectionOptions } from './TCPClient';

export class MCPuppet extends EventEmitter {
    private client: SimpleTCPClient;

    constructor() {
        super();

        this.client = new SimpleTCPClient();

        this.client.on('ready', () => this.emit('ready'));
        this.client.on('data', (socket, data) => this.onData(socket, data));
    }

    onData(socket: Socket, data: BufferData) {
        if (data.length() < 2) return;

        if (data.readUInt8(1) === 1) {
            socket.write(data.getBuffer());
        }

        if (data.readUInt8(1) === 0) {
            const length = data.readUInt8(0);
            const status = data.readUInt8(length);

            if (status != 1 && status != 2) return;

            this.emit('request', status == 1 ? RequestType.Status : RequestType.Login, new Response(socket));
        }

        socket.destroy();
    }

    listen(options: ConnectionOptions) {
        this.client.listen(options);
    }
}

export class Response {
    private socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;
    }

    send(content: StatusPayload | ChatPayload): void {
        const data = new BufferData()
            .writeAscii(JSON.stringify(content))
            .encodeLength()
            .writeFNumber(0)
            .encodeLength();

        this.socket.write(data.getBuffer());
    }
}

export interface StatusPayload {
    previewsChat?: boolean;
    enforcesSecureChat?: boolean;
    description?: {
        text: string;
    }
    players: {
        max: number;
        online: number;
        sample?: StatusInfoSample[];
    }
    version?: {
        name: string;
        protocol: number;
    },
    favicon?: string; // 64x64 Base64
}

export interface ChatBase {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underlined?: boolean;
    strikethrough?: boolean;
    obfuscated?: boolean;
    font?: 'minecraft:uniform' | 'minecraft:alt' | 'minecraft:default';
}

export interface ChatPayload extends ChatBase {
    extra?: ChatBase[];
}

export enum RequestType {
    Status,
    Login
}

export interface StatusInfoSample {
    id: string;
    name: string;
}