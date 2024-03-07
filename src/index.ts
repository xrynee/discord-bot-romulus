import eris, { Constants } from 'eris';

import { ensureCommands, onEvent } from './commands';
import { init } from './messages';

const bot = new eris.Client(
    'MTIxNTA0NDAzNzUyMzAxMzcyMg.G-MQgw.Hd1HUwQT3tHRg_fNhqelOOh4TpK9JMGNN5aF7w',
    {
        restMode: true,
        intents: [Constants.Intents.all]
    }
);

bot.on('ready', () => {
    ensureCommands(bot);
    init(bot);
});

bot.on('interactionCreate', interaction => {
    onEvent(interaction);
});

bot.connect();
