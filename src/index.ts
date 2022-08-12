import { ChatPayload, MCPuppet, RequestType, Response, StatusPayload } from "./MCPuppet";
import fs from 'fs';

const bitmap = fs.readFileSync('cat.png');
const base64Image = Buffer.from(bitmap).toString('base64');

const puppet = new MCPuppet();

puppet.on('ready', () => {
    console.log('Puppet Active!');
});

puppet.on('request', (status: RequestType, res: Response) => {
    if (status === RequestType.Status) {
        const data: StatusPayload = {
            description: {
                text: "This is not what you are looking for!"
            },
            players: {
                max: 16,
                online: 1,
                sample: [
                    {
                        id: '6decf108-3e55-4378-9a82-bdd4b2d23a19',
                        name: 'made by blekekok'
                    }
                ],
            },
            version: {
                name: 'You are not the boss of me!',
                protocol: 47
            },

            favicon: base64Image
        };

        res.send(data);
    }

    if (status === RequestType.Login) {
        const data: ChatPayload = {
            text: 'End of the line\n\n',
            underlined: true,
            extra: [
                {
                    text: 'Empty road',
                    bold: true,
                    underlined: true,
                    italic: true
                }
            ]
        };

        res.send(data);

        void res;
    }
});

puppet.listen({ host: 'localhost', port: 25565 });