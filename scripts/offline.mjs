import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
async function files(dir) {
  let out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...(await files(p)));
    else out.push(p);
  }
  return out;
}
const list = (await files("dist")).filter((p) => !p.endsWith("sw.js"));
const hash = createHash("sha256");
for (const path of list) hash.update(await readFile(path));
const urls = list.map((p) => "/Biology/" + p.slice(5));
const worker = `const CACHE='biology-island-${hash.digest("hex").slice(0, 12)}';
const ASSETS=${JSON.stringify(urls)};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('biology-island-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith('/Biology/'))return;
if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/Biology/index.html')));return;}
event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});`;
await writeFile("dist/sw.js", worker);
console.log(
  `Offline cache: ${urls.length} local resources. First successful online visit required.`,
);
