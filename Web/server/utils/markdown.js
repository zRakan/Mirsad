export default function(data) {
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Create Annual markdown
    let currentHeaders = [];
    
    let headers = Object.values(data.Annual);
    for(let obj of headers) {
        for(let header in obj) {
            if(header == 'Last Update Date' || header == "All Figures in" || header == "All Currency In" ||
               header == "تاريخ آخر تحديث" || header == "العملة في" || header == "جميع الأرقام بال"
            ) continue;
    
            currentHeaders.push(header);
        }
    }
    
    currentHeaders = [...new Set(currentHeaders)];
    
    
    // Create top-of-markdown
    let markdownAnnual = `Date | ${currentHeaders.join(" | ")}\n`
    for(let i = 0; i <= currentHeaders.length; i++) {
        markdownAnnual += "| - "
    }
    
    markdownAnnual += '\n';
    for(let date in data.Annual) {
        const dateData = data.Annual[date];
        markdownAnnual += `| ${date} `
        
        for(let header of currentHeaders) {
            let parsedNumber = dateData[header];
            
            if(header != "Profit (Loss) per Share" && parsedNumber && parsedNumber != "-") {
                parsedNumber = parseFloat(dateData[header].replace(/[,]/g, ''));
                parsedNumber = numberWithCommas(parsedNumber * 1000);
            }
    
            markdownAnnual += `| ${parsedNumber ?? "-"} `
        }
    
        markdownAnnual += '\n';
    }
    
    // Create Quarter markdown
    currentHeaders = [];
    
    headers = Object.values(data.Quarter);
    for(let obj of headers) {
        for(let header in obj) {
            if(header == 'Last Update Date' || header == "All Figures in" || header == "All Currency In") continue;
    
            currentHeaders.push(header);
        }
    }
    
    currentHeaders = [...new Set(currentHeaders)];
    
    // Create top-of-markdown
    let markdownQuarter = `Date | ${currentHeaders.join(" | ")}\n`
    for(let i = 0; i <= currentHeaders.length; i++) {
        markdownQuarter += "| - "
    }
    
    markdownQuarter += '\n';
    for(let date in data.Quarter) {
        const dateData = data.Quarter[date];
        markdownQuarter += `| ${date} `
        
        for(let header of currentHeaders) {
            let parsedNumber = dateData[header];
            
            if(header != "Profit (Loss) per Share" && parsedNumber) {
                parsedNumber = parseFloat(dateData[header].replace(/[,]/g, ''));
                parsedNumber = numberWithCommas(parsedNumber * 1000);
            }
    
            markdownQuarter += `| ${parsedNumber ?? "-"} `
        }
    
        markdownQuarter += '\n';
    }
    
    return [markdownAnnual, markdownQuarter];
}