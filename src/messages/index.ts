import { Client } from 'eris';

import { RomulusConfig } from './config';

export const MESSAGES = [new RomulusConfig()];

export const init = async (client: Client) => {
    await Promise.all(
        MESSAGES.map(async message => {
            await message.init(client);
        })
    );
};
