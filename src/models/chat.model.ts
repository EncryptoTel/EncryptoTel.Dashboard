export class MessageModel {
    id: number;
    chatId: number;
    text: string;
    status: number;
    my: boolean;
    statusUpdated: boolean;
    statusUpdated2: boolean;
    created: Date;
    modified: Date;
    chatMember: MemberModel[];
}

export class MemberModel {
    id: number;
    name: string;
}

export class ChatModel {
    id: number;
    type: number;
    name: string;
    members: MemberModel[];
}