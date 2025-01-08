import type { NextApiRequest, NextApiResponse } from "next";
export const runtime = "edge"
export default async function m3u8(req: NextApiRequest, res: NextApiResponse) {
    const url = req.query.url;
    let headers: any = req.query.headers || '{}';

    if (typeof url === 'string') {
        let rootArr =  url.split('/')
        rootArr.pop()
        const root= rootArr.join('/')

        const r = await fetch(url,{headers:JSON.parse(headers)});
        const data = await r.text();
        const splited = data.split('\n');
        headers = encodeURIComponent(headers)

       
        // console.log(splited)
        for (let i = 0; i < splited.length; i++) { // Correct loop condition
            const line = splited[i];
            
            try {
                if (line.includes('BANDWIDTH')) {
                    if (i + 1 < splited.length) { // Check bounds before accessing splited[i + 1]
                        i =  i+1
                        // console.log(i)
                        const nextLine = splited[i];
                        const mod = `/api/m3u8-proxy?url=${encodeURIComponent((nextLine.includes('http')?'':root+'/')+nextLine)}&headers=${headers}`;
                        splited[i] = mod; // Modify the next line
                    }
                }else if(line.includes('EXTINF')){
                    if (i + 1 < splited.length) { // Check bounds before accessing splited[i + 1]
                        i = i+1 
                        let nextLine = splited[i];
                        const mod = `/api/ts-proxy?url=${encodeURIComponent((nextLine.includes('http')?'':root+'/')+nextLine)}&headers=${headers}`;
                        splited[i] = mod
                    }
                }
            } catch (error) {
                console.log(`Error processing line ${i}: ${line}`, error);
            }
        }

        const joined = splited.join('\n');
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.status(200).send(joined);
    } else {
        res.status(400).json({ error: 'Invalid URL parameter' });
    }
}
