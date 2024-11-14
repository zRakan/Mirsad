export default async function(ID) {
    const chartType = "SQL_CI_CV_COM"; // All data

    const URL = `https://www.saudiexchange.sa/tadawul.eportal.charts.v2/ChartGenerator?chart-type=${chartType}&chart-parameter=${ID}&&methodType=parsingMethod`;

    let resp = await $fetch(URL);

    return resp;
}