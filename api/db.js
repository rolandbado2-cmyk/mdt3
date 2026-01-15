import { neon } from '@neondatabase/serverless';

// A Vercel automatikusan beolvassa a DATABASE_URL-t a környezeti változókból
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    // CORS beállítások a biztonságos böngésző-szerver kommunikációhoz
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { action, ...data } = req.body;

    try {
        // BEJELENTKEZÉS
        if (action === 'login') {
            const result = await sql`SELECT * FROM users WHERE name = ${data.name} AND pin = ${data.pin}`;
            if (result.length > 0) {
                return res.status(200).json({ success: true, user: result[0] });
            } else {
                return res.status(200).json({ success: false });
            }
        }

        // KÖRÖZÉSEK LEKÉRÉSE
        if (action === 'getWanted') {
            const result = await sql`SELECT * FROM wanted ORDER BY created_at DESC`;
            return res.status(200).json({ data: result });
        }

        // KÖRÖZÉS HOZZÁADÁSA
        if (action === 'addWanted') {
            await sql`INSERT INTO wanted (name, reason) VALUES (${data.name}, ${data.reason})`;
            return res.status(200).json({ success: true });
        }

        // KÖRÖZÉS TÖRLÉSE
        if (action === 'deleteWanted') {
            await sql`DELETE FROM wanted WHERE id = ${data.id}`;
            return res.status(200).json({ success: true });
        }

        // AKTA HOZZÁADÁSA
        if (action === 'addArchive') {
            await sql`INSERT INTO archive (name, charge, fine, jail_time, officer) 
                      VALUES (${data.name}, ${data.charge}, ${data.fine}, ${data.jail_time}, ${data.officer})`;
            return res.status(200).json({ success: true });
        }

        // AKTÁK LEKÉRÉSE
        if (action === 'getArchive') {
            const result = await sql`SELECT * FROM archive ORDER BY created_at DESC`;
            return res.status(200).json({ data: result });
        }

        // KERESÉS SZEMÉLYRE
        if (action === 'searchPerson') {
            const records = await sql`SELECT * FROM archive WHERE name = ${data.name}`;
            const wanted = await sql`SELECT * FROM wanted WHERE name = ${data.name}`;
            return res.status(200).json({ found: true, records, wanted: wanted.length > 0 });
        }

        return res.status(400).json({ error: "Ismeretlen muvelet" });

        } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    
        "name": "orfk-mdt",
        "version": "1.0.0",
        "type": "module",
        "dependencies": {
        "@neondatabase/serverless": "^0.9.0"
}
}

