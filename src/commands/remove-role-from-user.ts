import { Client, ComponentInteraction } from 'eris';

import { GroupConfig, ICommand } from '../interface';
import { Global, LocalStorage } from '../util';

export class RemoveRoleFromUserCommand implements ICommand {
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
        await interaction.member.removeRole(group.role.id);
        // await this.client.editGuildMember(interaction.guildID, interaction.member.id, {
        //     roles: interaction.member.roles.filter(r => r !== group.role.id)
        // });

        await interaction.acknowledge();
        await Global.refresh(interaction.guildID);
        // await interaction.;
    }

    public isHandledBy(event: any): boolean {
        const parts = event.data.custom_id?.split('-');
        if (parts?.length !== 3) {
            return false;
        }
        return parts[0] === 'romulus' && parts[1] === 'remove';
    }
}
