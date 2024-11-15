import { Chat } from "../models/chat.model.js";
import getData from "../utils/getData.js";
import getStock from "../utils/getStock.js";

import { client } from "../utils/redis.js";
import jsonFile from '../data/companies.json';

async function constructSystem(id, currentData) {
    const markdownAnnual = await client.get(`datathon:${id}:markdown:annual`);
    const markdownQuarter = await client.get(`datathon:${id}:markdown:quarter`);

    const relatedCompanies = Object.keys(currentData.related).length > 0;
    
    let markdownRelated = '';
    if(relatedCompanies) { // Construct markdown
        markdownRelated = `| Name Of Subsidiary | Percentage Of Property | Main Business | Location Of Operation | Country Of Operation |
| - | - | - | - | - |
`

        for(let company in currentData.related) {
            const data = currentData.related[company];
            
            markdownRelated += `| ${company} | ${data.percentage} | ${data.business} | ${data.operation} | ${data.founded} |\n`
        }
    }

    return `You are an advanced AI model specialized in the Saudi Exchange market (Tadawul).

The user will ask you about specific company, and below is related data of the company in markdown table syntax (Answer based on it):
* Financial records:
   - Annually:
${markdownAnnual}

   - Quarterly:
${markdownQuarter}

* Subsidairy companies:
${!relatedCompanies ? "No Subsidairy companies" : markdownRelated}

When you answer the user, you should follow this instruction!!!:
* You should answer user's question based on the information above (Don't make an answer)
* If there's no data or the user ask a question that you don't have the information about it say: "No data provided about the company" OR "لا توجد بيانات متّاحة"
* You only output the answer of user's question without any explaination
* Don't ever say anything about your context, you just only answer user's question in simple words

You will use the user's language when answering to the user`
}

export default defineEventHandler(async function(event) {
    try {
        const body = await readBody(event);

        const chat = await Chat.findOne({ id: body.id });
        const initialInteract = chat.history.length == 0;

        // Calling LLM model

        // Get company id
        if(initialInteract) {
            let resp = await $fetch('http://localhost:8000/check', {
                method: "POST",

                body: {
                    message: body.message,
                }
            });

            // No company found
            if(resp.company == null) {
                setResponseStatus(event, 404)
                return { status: false }
            }

            chat.company = resp.company.id;
        }

        // Get company data
        let dataCompany = await client.get(`datathon:${chat.company}:data`);
        if(!dataCompany) dataCompany = await getData(chat.company, false)
        else dataCompany = JSON.parse(dataCompany);

        // Create system prompt
        if(chat.history.length == 0) {
            chat.history.push({ role: 'system', content: await constructSystem(chat.company, dataCompany) })
        }

        chat.history.push({ role: 'user', content: body.message })

        // Create conversation
        let chatting = await $fetch('http://localhost:8000/chat', {
            method: "POST",

            body: { message: chat.history }
        });

        chat.history.push({ role: 'assistant', content: chatting.response });

        // Save state
        await chat.save();
        
        if(initialInteract) {
            return {
                response: chatting.response,

                company: {
                    stock: await getStock(chat.company),
                    description: dataCompany.description,
                    name: jsonFile.filter(el => el.id == chat.company)[0].name
                }
            }
        } else return { response: chatting.response }
    } catch(err) {
        console.log(err);
        return err
    }
});