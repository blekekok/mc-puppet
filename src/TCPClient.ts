import { EventEmitter } from "events";
import net, { Server, Socket } from 'net';

export class SimpleTCPClient extends EventEmitter {
    private server: Server;

    constructor() {
        super();

        this.server = net.createServer((socket: Socket) => this.onConnect(socket));
    }

    onConnect(socket: Socket) {
        socket.on('data', (data) => {
            const buffer = new BufferData(data);
            this.emit('data', socket, buffer);
        });
    }

    listen(options: ConnectionOptions) {
        this.server.listen(options.port, options.host, () => {
            this.emit('ready');
        });
    }
}

export class BufferData {
    private buffer: Buffer;

    constructor(buffer?: Buffer) {
        if (buffer === undefined) {
            this.buffer = Buffer.alloc(0);
            return;
        }

        this.buffer = buffer;
    }

    readUInt8(position: number): number {
        const value = this.buffer.subarray(position, position + 1);

        return value.readUInt8();
    }

    writeAscii(content: string): this {
        this.buffer = Buffer.concat([this.buffer, Buffer.from(content, 'ascii')]);

        return this;
    }

    writeFAscii(content: string): this {
        this.buffer = Buffer.concat([Buffer.from(content, 'ascii'), this.buffer]);

        return this;
    }

    writeNumber(content: number): this {
        this.buffer = Buffer.concat([
            this.buffer,
            Buffer.from(BufferData.EncodeLEB128(content))
        ]);

        return this;
    }

    writeFNumber(content: number): this {
        this.buffer = Buffer.concat([
            Buffer.from(BufferData.EncodeLEB128(content)),
            this.buffer
        ]);

        return this;
    }

    writeBufferData(content: BufferData): this {
        this.buffer = Buffer.concat([this.buffer, content.getBuffer()]);

        return this;
    }

    writeFBufferData(content: BufferData): this {
        this.buffer = Buffer.concat([content.getBuffer(), this.buffer]);

        return this;
    }

    encodeLength(): this {
        this.buffer = Buffer.concat([
            Buffer.from(BufferData.EncodeLEB128(this.buffer.length)),
            this.buffer
        ]);

        return this;
    }

    length(): number {
        return this.buffer.length;
    }

    lengthLEB128(): BufferData {
        return new BufferData(
            Buffer.from(BufferData.EncodeLEB128(this.buffer.length))
        );
    }

    getBuffer(): Buffer {
        return this.buffer;
    }

    private static EncodeLEB128(value: number): number[] {
        value |= 0;
        const result = [];
        while (true) {
            const byte_ = value & 0x7f;
            value >>= 7;
            if (
                (value === 0 && (byte_ & 0x40) === 0) ||
                (value === -1 && (byte_ & 0x40) !== 0)
            ) {
                result.push(byte_);
                return result;
            }
            result.push(byte_ | 0x80);
        }
    }
}

export interface ConnectionOptions {
    host: string;
    port: number;
}