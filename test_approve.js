import { api, mockDb, supabase } from './src/supabaseClient.js';

async function test() {
  try {
    const clients = await api.users.list();
    console.log("Clients:", clients);
    if (clients.length > 0) {
      const client = clients[0];
      console.log("Approving client:", client.id);
      const updated = await api.users.approve(client.id, 'true');
      console.log("Updated user:", updated);
    } else {
      console.log("No clients found");
    }
  } catch(e) {
    console.error(e);
  }
}

test();
