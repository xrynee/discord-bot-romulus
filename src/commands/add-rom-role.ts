import {
    ApplicationCommand,
    Client,
    CommandInteraction,
    Constants,
    InteractionDataOptionsWithValue,
    Permission
} from 'eris';

import { GroupConfig, ICommand } from '../interface';
import { Global, LocalStorage } from '../util';

export class AddRomRoleCommand implements ICommand {
    private cmd: ApplicationCommand;
    private client: Client;
    public async create(client: Client) {
        this.client = client;

        this.cmd = await client.createCommand({
            name: 'add-rom-role',
            description: 'Add a role to the list of ROM roles',
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
            type: Constants.ApplicationCommandTypes.CHAT_INPUT,
            defaultPermission: false
        });
    }

    public async handle(interaction: CommandInteraction): Promise<void> {
        const options: InteractionDataOptionsWithValue[] = interaction.data.options as any;

        const roleName = options.find(o => o.name === 'role').value.toString();
        const channelName = options.find(o => o.name === 'channel').value.toString();
        const description = options.find(o => o.name === 'description').value.toString();

        const role = await this.client.createRole(interaction.guildID, {
            name: roleName,
            permissions: new Permission(0)
        });

        const channel = await this.client.createChannel(
            interaction.guildID,
            channelName,
            Constants.ChannelTypes.GUILD_TEXT,
            {
                permissionOverwrites: [
                    {
                        type: Constants.PermissionOverwriteTypes.ROLE,
                        id: interaction.guildID,
                        deny: Constants.Permissions.all,
                        allow: 0
                    },
                    {
                        type: Constants.PermissionOverwriteTypes.ROLE,
                        id: role.id,
                        allow: Constants.Permissions.allText,
                        deny: 0
                    }
                ]
            }
        );

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
