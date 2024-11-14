import { Chat } from "../models/chat.model.js";

export default defineEventHandler(async function(event) {
    const chats = await Chat.find({});

    return chats;
});