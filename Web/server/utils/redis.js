import { createClient } from 'redis';

export const client = createClient();

(async function() {

    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();
    
})();
