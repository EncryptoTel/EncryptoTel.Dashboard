export class MessageModel {
    id: number;
    chatId: number;
    text: string;
    status: number;
    created: Date;
    modified: Date;
    chatMember: MemberModel[];
}

export class MemberModel {
    id: number;
    fullName: string;
}