import fs from 'node:fs';
import path from 'node:path';
import { MongoClient, BSON } from 'mongodb';
import dotenv from 'dotenv';
const [envPath, database, directory] = process.argv.slice(2);
if (!envPath || !database || !directory) throw new Error('Usage: node export.mjs /path/source.env database /private/output/directory');
const env = dotenv.parse(fs.readFileSync(envPath));
const client = new MongoClient(env.MONGODB_URI || env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
try {
    await client.connect();
    const db = client.db(database);
    const names = (await db.listCollections({}, {nameOnly:true}).toArray()).map(c => c.name);
    const collections = {};
    for (const name of names) collections[name] = await db.collection(name).find({}).toArray();
    const snapshot = {exportedAt: new Date().toISOString(), database, collections};
    fs.mkdirSync(directory, {recursive:true});
    fs.writeFileSync(path.join(directory, 'portfolio-original.ejson'), BSON.EJSON.stringify(snapshot, null, 2, {relaxed:false}), {mode:0o600,flag:'wx'});
    fs.writeFileSync(path.join(directory, 'portfolio-snapshot.json'), JSON.stringify(snapshot, null, 2), {mode:0o600,flag:'wx'});
    console.log(JSON.stringify(Object.fromEntries(Object.entries(collections).map(([name,rows]) => [name,rows.length]))));
} catch (error) {
    console.error('Export failed: ' + error.name + '. Connection details suppressed.');
    process.exitCode=1;
} finally { await client.close(); }
