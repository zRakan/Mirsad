function invalid(event) {
    setResponseStatus(event, 404, { status: "error" });

    return { status: "error" }
}

export default defineEventHandler(async function(event) {
    const params = getQuery(event);

    if(!params || !params['id']) return invalid(event);

    const data = await getData(params['id'])
    
    return data;
});