import { ApplicationCommand, Client, CommandInteraction, Constants } from 'eris';

import { GroupConfig, ICommand } from '../interface';
import { Global, LocalStorage } from '../util';

export class SetChannelCommand implements ICommand {
    private cmd: ApplicationCommand;
    private client: Client;
    public async create(client: Client) {
        this.client = client;

        this.cmd = await client.createCommand({
            name: 'set-rom-channel',
            description: 'Register the roles channel used to select your roles',
            options: [],
            type: Constants.ApplicationCommandTypes.CHAT_INPUT
        });
    }

    public async handle(interaction: CommandInteraction): Promise<void> {
        await LocalStorage.set('rom-channel', interaction.channel.id);

        let groups: GroupConfig[] = await LocalStorage.get('rom-groups');
        groups = (groups || []).map(g => {
            g.messageId = '';
            g.childMessageId = '';
            return g;
        });
        await LocalStorage.set('rom-groups', groups);

        await interaction.defer();
        await interaction.deleteOriginalMessage();

        await Global.refresh(interaction.guildID);
    }

    public isHandledBy(event: any): boolean {
        return this.cmd?.name === event.data.name;
    }
}
