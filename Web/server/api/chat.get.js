import { Chat } from "../models/chat.model.js";

import { client } from "../utils/redis.js";

import dataCompanies from "../data/companies.json"

export default defineEventHandler(async function(event) {
    try {
    const params = getQuery(event);
    
    const chat = await Chat.findOne({ id: params.id });

    let data = {};
    if(chat.company) {
        data = await client.get(`datathon:${chat.company}:data`);
        if(data) data = JSON.parse(data);
        else if(!data) data = await getData(chat.company, false);

        data.name = dataCompanies.filter(el => el.id == chat.company)[0]
    }

    if(data.description) {

        return {
            id: chat.id,
            history: chat.history.splice(1),
            company: {
                name: data.name.name,
                description: data.description,
                stock: await getStock(chat.company)
            }
        }
    } else return { id: chat.id }
} catch(err) {
    console.log(err);
    return err;
}
});