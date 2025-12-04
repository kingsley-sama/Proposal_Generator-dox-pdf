const db = require('./supabase.js');

async function getClientDetails(client_id) {
    console.log('Fetching client details for ID:', client_id);
    try {
        const { data, error } = await db
            .from('companies')
            .select('*')
            .eq('client_id', client_id);

        if (error) {
            console.error('Error fetching client details:', error);
            return null;
        }
        console.log('Client details retrieved:', data);
        return data; // this now properly returns data
    } catch (err) {
        return null;
    }
}

async function save_proposal_detail() {
    try{
        const { data, error } = await db
            .from('proposals')
            .insert([
                { /* your proposal data here */ }
            ]);

        if (error) {
            console.error('Error saving proposal details:', error);
            return null;
        }
        console.log('Proposal details saved:', data);
        return data;
    }catch(err){

    }
}

module.exports = { getClientDetails };
