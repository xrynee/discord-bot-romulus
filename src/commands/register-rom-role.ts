import {
    ApplicationCommand,
    Client,
    CommandInteraction,
    Constants,
    InteractionDataOptionsWithValue
} from 'eris';

import { GroupConfig, ICommand } from '../interface';
import { Global, LocalStorage } from '../util';

export class RegisterRomRoleCommand implements ICommand {
    private cmd: ApplicationCommand;
    private client: Client;
    public async create(client: Client) {
        this.client = client;

        this.cmd = await client.createCommand({
            name: 'register-rom-role',
            description: 'Register a role to the list of ROM roles',
            options: [
                {
                    name: 'role',
                    description: 'The role to add',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                },
                {
                    name: 'channel',
                    description: 'The name of the channel to add',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                },
                {
                    name: 'description',
                    description: 'The description of the channel to add',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                }
            ],
            type: Constants.ApplicationCommandTypes.CHAT_INPUT
        });
    }

    public async handle(interaction: CommandInteraction): Promise<void> {
        const options: InteractionDataOptionsWithValue[] = interaction.data.options as any;

        const roleName = options.find(o => o.name === 'role').value.toString();
        const channelName = options.find(o => o.name === 'channel').value.toString();
        const description = options.find(o => o.name === 'description').value.toString();

        const roles = await this.client.getRESTGuildRoles(interaction.guildID);
        const role = roles.find(r => r.name === roleName);

        const channels = await this.client.getRESTGuildChannels(interaction.guildID);
        const channel = channels.find(c => c.name === channelName);

        if (!role) {
            return interaction.createMessage(
                'Role not found:' +
                    roleName +
                    '\nIf you need to create a new one instead, try /add-rom-role'
            );
        }

        if (!channel) {
            return interaction.createMessage(
                'Channel not found:' +
                    channelName +
                    '\nIf you need to create a new one instead, try /add-rom-role'
            );
        }

        const groups: GroupConfig[] = (await LocalStorage.get('rom-groups')) || [];
        groups.push({
            messageId: '',
            childMessageId: '',
            description,
            role: {
                name: roleName,
                id: role.id
            },
            channel: {
                name: channelName,
                id: channel.id
            }
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
