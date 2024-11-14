import { Chat } from "../models/chat.model.js";

import { v4 as uuid } from 'uuid';

export default defineEventHandler(async function(event) {
    try {
    
        const body = {
            id: uuid(),
            title: "New chat",
            history: []
        }
        
        const chats = new Chat(body);



    await chats.save();
    
    return { id: body.id, title: body.title, history: body.history }
} catch(err) {
    console.log(err);
    return {}
}
});