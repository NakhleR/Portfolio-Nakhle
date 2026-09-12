import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const [snapshotPath, directory] = process.argv.slice(2);
if (!snapshotPath || !directory) throw new Error('Usage: node download-media.mjs snapshot.json /private/media/directory');
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
fs.mkdirSync(directory, {recursive:true});
const urls = [...new Set(snapshot.collections.projects.flatMap(project => project.images || []))];
const manifest = {};
let cursor=0;
await Promise.all(Array.from({length:4}, async () => {
    while (cursor < urls.length) {
        const url = urls[cursor++];
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:' || parsed.hostname !== 'res.cloudinary.com') throw new Error('Unexpected source media host. Review this URL before adding support.');
        const extension = path.extname(parsed.pathname).toLowerCase();
        if (!['.png','.jpg','.jpeg','.webp','.gif','.avif'].includes(extension)) throw new Error('Unsupported source image type');
        const filename = crypto.createHash('sha256').update(url).digest('hex') + extension;
        const target = path.join(directory, filename);
        let bytes;
        if (fs.existsSync(target)) bytes=fs.readFileSync(target);
        else {
            let response;
            for (let attempt=0; attempt<3; attempt++) {
                try { response=await fetch(url, {signal:AbortSignal.timeout(60000),redirect:'error'}); if(response.ok) break; } catch(error) { if(attempt===2) throw error; }
            }
            if (!response?.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('Image download failed: ' + parsed.pathname);
            bytes=Buffer.from(await response.arrayBuffer());
            if(!bytes.length) throw new Error('Empty image');
            fs.writeFileSync(target,bytes);
        }
        manifest[url]={file:filename,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};
    }
}));
fs.writeFileSync(path.join(directory,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({downloaded:urls.length,bytes:Object.values(manifest).reduce((n,x)=>n+x.bytes,0)}));
