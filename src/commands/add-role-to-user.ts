import { Client, ComponentInteraction } from 'eris';

import { GroupConfig, ICommand } from '../interface';
import { Global, LocalStorage } from '../util';

export class AddRoleToUserCommand implements ICommand {
    private client: Client;
    public async create(client: Client) {
        this.client = client;
    }

    public async handle(interaction: ComponentInteraction): Promise<void> {
        const roleName = interaction.data.custom_id?.split('-')?.[2];
        if (!roleName) {
            return;
        }

        const groups: GroupConfig[] = await LocalStorage.get('rom-groups');
        const group = groups.find(g => g.role.name === roleName);
        if (!group) {
            return;
        }

        if (!interaction.member.roles.includes(group.role.id)) {
            await interaction.member.addRole(group.role.id);
        }

        await interaction.acknowledge();

        await Global.refresh(interaction.guildID);
    }

    public isHandledBy(event: any): boolean {
        const parts = event.data.custom_id?.split('-');
        if (parts?.length !== 3) {
            return false;
        }
        return parts[0] === 'romulus' && parts[1] === 'add';
    }
}
