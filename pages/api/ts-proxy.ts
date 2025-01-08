import type { NextApiRequest, NextApiResponse } from 'next';
import * as https from 'https';
export const runtime = "edge"
// Define the function for handling the API request
export default async function m3u8(req: NextApiRequest, res: NextApiResponse) {
    // Get the URL from the query parameter and ensure it's a string
    const url = req.query.url as string;
    // Get the headers from the query or default to an empty object
    const headers = req.query.headers ? JSON.parse(req.query.headers as string) : {};

    // Ensure that the URL is provided
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Set up options for the HTTPS request, including headers
    const options: https.RequestOptions = {
        headers,
    };

    // Make the HTTPS request
    https.get(url, options, (response) => {
        // Forward the response status code from the external server
        res.status(response.statusCode || 200);

        // Forward all headers from the external response to the client
        Object.keys(response.headers).forEach((key) => {
            res.setHeader(key,`${response.headers[key]}`);
        });

        // Pipe the external response body to the client
        response.pipe(res);
    }).on('error', (error) => {
        // Handle any errors in the HTTPS request
        console.error('Error in HTTPS request:', error);
        res.status(500).json({ error: 'Failed to fetch the resource' });
    });
}
