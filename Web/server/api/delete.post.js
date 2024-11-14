import { Chat } from "../models/chat.model.js";

function invalidRequest(event) {
    setResponseStatus(event, 400);
    return { status: false }
}

export default defineEventHandler(async function(event) {
    try {
        const body = await readBody(event);
        if(!body.id) return invalidRequest(event);

        const targetChat = await Chat.deleteOne({ id: body.id });
        if(targetChat.deletedCount == 0) return invalidRequest(event);
        
        return { status: true }
    } catch(err) {
        console.log(err);
        return invalidRequest(event)
    }
});