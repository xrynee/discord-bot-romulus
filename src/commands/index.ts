import * as eris from 'eris';

import { ICommand } from '../interface';

import { AddRoleToUserCommand } from './add-role-to-user';
import { AddRomRoleCommand } from './add-rom-role';
import { RegisterRomRoleCommand } from './register-rom-role';
import { RemoveRoleFromUserCommand } from './remove-role-from-user';
import { SetChannelCommand } from './set-channel';

export const COMMANDS: ICommand[] = [
    new AddRomRoleCommand(),
    new RegisterRomRoleCommand(),
    new SetChannelCommand(),
    new AddRoleToUserCommand(),
    new RemoveRoleFromUserCommand()
];

export const onEvent = async (event: eris.Interaction) => {
    if (event instanceof eris.CommandInteraction || event instanceof eris.ComponentInteraction) {
        const command = COMMANDS.find(c => c.isHandledBy(event));

        command?.handle(event);
    }
};

export const ensureCommands = async (client: eris.Client): Promise<ICommand[]> => {
    // await client.deleteCommand('1215064041295183882');
    await Promise.all(
        COMMANDS.map(async command => {
            await command.create(client);
        })
    );
    // const commands = await client.getCommands();
    // console.log('commands', commands);
    return COMMANDS;
};
