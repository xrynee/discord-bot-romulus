import { ActionRow, Channel, Client, Constants, Message } from 'eris';

import { GroupConfig } from '../interface';
import { LocalStorage } from '../util';

export class RomulusConfig {
    private client: Client;

    private channel: Channel;
    private messages: Message[];

    private async getChannelId(): Promise<string> {
        const channelId = await LocalStorage.get('rom-channel');
        if ((!!channelId && !this.channel) || (!!this.channel && this.channel.id !== channelId)) {
            this.channel = await this.client.getChannel(channelId as string);
        }
        return channelId as string;
    }

    public async init(client: Client): Promise<void> {
        this.client = client;

        await this.refresh(this.client.guilds.values().next().value?.id);
    }

    public async refresh(guildId: string): Promise<void> {
        const channelId = await this.getChannelId();
        if (!channelId) {
            return;
        }
        this.messages = await this.client.getMessages(channelId);

        let groups: GroupConfig[] = (await LocalStorage.get('rom-groups')) || [];
        let notFoundMessageId = await LocalStorage.get<string>('no-config-found-message-id');
        if (!groups?.length) {
            if (!notFoundMessageId) {
                const notFoundMessage = await this.client.createMessage(
                    channelId,
                    'No groups found. Add some with `/add-rom-role`'
                );
                notFoundMessageId = notFoundMessage.id;
                await LocalStorage.set('no-config-found-message-id', notFoundMessageId);
            }
            return;
        } else {
            if (!!notFoundMessageId) {
                await this.client.deleteMessage(channelId, notFoundMessageId);
                await LocalStorage.set('no-config-found-message-id', '');
            }
        }

        const guild = this.client.guilds.get(guildId);
        const guildMembers = await guild.fetchMembers();

        groups = await Promise.all(
            groups.map(async g => {
                const membersCount = guildMembers.filter(m => m.roles.includes(g.role.id)).length;
                const messageContent = `_ _\n\n# ${g.description}\n> ${membersCount} members`;
                const buttonComponents: ActionRow[] = [
                    {
                        type: Constants.ComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: Constants.ComponentTypes.BUTTON,
                                emoji: {
                                    name: 'plus',
                                    id: '940149617683759104'
                                },
                                custom_id: 'romulus-add-' + g.role.name,
                                style: Constants.ButtonStyles.SUCCESS
                            },
                            {
                                type: Constants.ComponentTypes.BUTTON,
                                emoji: {
                                    name: '❌'
                                },
                                custom_id: 'romulus-remove-' + g.role.name,
                                style: Constants.ButtonStyles.SECONDARY
                            }
                        ]
                    }
                ];

                let mainMessage = this.messages.find(m => m.id === g.messageId);
                if (!mainMessage) {
                    mainMessage = await this.client.createMessage(channelId, {
                        content: messageContent,
                        components: buttonComponents
                    });

                    g.messageId = mainMessage.id;
                }

                // const threads = await this.client.getActiveGuildThreads(mainMessage.guildID);

                // let thread = threads.threads.find(t => t.parentID === mainMessage.id);
                // let childMessage = this.messages.find(m => m.id === g.childMessageId);
                // if (!g.childMessageId) {
                //     const thread = await mainMessage.createThreadWithMessage({
                //         name: 'Description',
                //         autoArchiveDuration: 10080
                //     });
                //     childMessage = await thread.createMessage({
                //         components: [],
                //         content: g.role.name
                //     });
                //     g.childMessageId = childMessage.id;
                // }

                await this.client.editMessage(channelId, mainMessage.id, {
                    content: messageContent,
                    components: buttonComponents
                });

                // await this.client.editMessage(channelId, childMessage.id, {
                //     content: g.role.name,
                //     components: []
                // });
                return g;
            })
        );

        await LocalStorage.set('rom-groups', groups);
    }

    // public async findRomulusMessage(buttonLabel: string): Promise<Message> {
    //     return this.messages.find(m => {
    //         const button: Button = m.components?.[0]?.components?.[0] as Button;
    //         return button?.label === buttonLabel;
    //     }) as Message;
    // }
}
