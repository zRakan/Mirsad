import { JSDOM } from 'jsdom';
import { client } from './redis.js';
import markdown from './markdown.js';

const LABELS = {
    "Total Liabilities and Shareholder Equity": "Total Liabilities and Shareholders Equity",
    "Shareholders Equity": "Total Shareholders Equity (After Deducting the Minority Equity)"
}

const IGNORE = {
    "Fixed Assets": true,
    "Other Assets": true,
    "Investments": true,
}

function getFinancialRecords(body) {
    const datesData = {
        Quarter: {},
        Annual: {}
    };

    // Current data
    const [annualTable, quarterTable] = (body.querySelectorAll('#unifiedSummaryFinancial .inner_tab_sub table'));

    // Previous Records
    const previousTable = body.querySelector('#fullSummaryFinancial .inner_tab_sub table');

    for(let element of [annualTable, quarterTable, previousTable]) {
        const tableType = element === quarterTable ? "Quarter" : "Annual";

        const currentCategory = element.querySelectorAll('thead');

        for(let catrgory of currentCategory) {
            // Dates
            const cells = catrgory.querySelectorAll('th');
        
            const dates = [];

            for(let i = 1; i < cells.length; i++) {
                const date = cells[i].textContent;
                if(!date) break;
                
                dates.push(date);
                if(datesData[tableType][date]) continue;
        
                datesData[tableType][date] = {};
            }

            // Retrieve data of the category
            const bodyData = catrgory.nextElementSibling;
            
            const currentData = bodyData.querySelectorAll('tr');    
        
            for(let data of currentData) {
                const dataChildren = data.children;
        
                let dataType = dataChildren[0].textContent;
                if(LABELS[dataType])
                    dataType = LABELS[dataType];

                if(IGNORE[dataType]) continue;

                for(let i = 0; i < dates.length; i++) {
                    const currentDate = dates[i];
        
                    const textData = dataChildren[i+1];
                    const isNumber = textData.classList.contains('numeric');
        
                    if(isNumber) {
                        datesData[tableType][currentDate][dataType] = textData.textContent.replace(/[^0-9,.-]/g, '');
                    } else {
                        const stringData = textData.textContent;
                        if(!stringData) break;
        
                        datesData[tableType][currentDate][dataType] = stringData;
                    }
                }
            }
        }
    }

    return datesData
}

function getRelatedCompanies(body) {
    const table = body.querySelector('.companyProfile table');
    if(!table) return {}; // no related companies

    const data = {};
    
    const tableData = table.querySelectorAll('tbody tr');
    for(let tableRow of tableData) {
        const [name, percentage, business, operation, founded] = [...tableRow.children].map(el => el.textContent);

        data[name] = { percentage, business, operation, founded };
    }

    return data;
}

function getDescription(body) {
    let [aboutHeader, about, historyHeader, history] = body.querySelectorAll('.fundInfo > p');
    if(!aboutHeader || !about || !historyHeader || !history) return "No descirption";

    const fullDescription = `${aboutHeader.textContent}\n${about.textContent}\n${historyHeader.textContent}\n${history.textContent}`;

    return fullDescription;
}


export default async function(ID, english = true) {
    const URL = `https://www.saudiexchange.sa/wps/portal/saudiexchange/hidden/company-profile-main/!ut/p/z1/04_Sj9CPykssy0xPLMnMz0vMAfIjo8ziTR3NDIw8LAz83d2MXA0C3SydAl1c3Q0NvE30I4EKzBEKDMKcTQzMDPxN3H19LAzdTU31w8syU8v1wwkpK8hOMgUA-oskdg!!/?companySymbol=${ID}`;

    const language = english ? "en" : "ar";


    let resp = await $fetch(URL, {
        headers: {
            'Cookie': `com.ibm.wps.state.preprocessors.locale.LanguageCookie=${language}`,
            
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
        },

        parseResponse: (txt) => txt,

        retry: 3,
        retryDelay: 500,
    });
    resp = new JSDOM(resp).window.document;

    const records = getFinancialRecords(resp);
    const [markdownAnnual, markdownQuarter] = markdown(records);

    const related = getRelatedCompanies(resp);

    // Summarize description
    let description = getDescription(resp);    
    try {
        const summaryDescription = await $fetch('http://localhost:8000/summary', {
            method: "POST",

            body: { message: description }
        });

        description = summaryDescription.response;
    } catch(err) {
        console.log(err);
    }

    await client.set(`datathon:${ID}:data`, JSON.stringify({ records, related, description }), {
        EX: 86400 // Cache for 24h
    });

    await client.set(`datathon:${ID}:markdown:annual`, markdownAnnual, {
        EX: 86400
    });
    
    await client.set(`datathon:${ID}:markdown:quarter`, markdownQuarter, {
        EX: 86400
    });

    return { records, related, description };
}