'use client'
import { useEffect, useState, useRef } from "react";
import Hls from 'hls.js';

export default function Home() {
  const [url, setUrl] = useState<string>('https://files.vidstack.io/sprite-fight/hls/stream.m3u8');
  const [headers, setHeaders] = useState<string>('{"Referer":"https://vidstack.io/"}');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Initialize HLS.js and load the stream
    if (videoRef.current && Hls.isSupported()) {
      const hls = new Hls();

      // Set headers for the request (if any)
      const headersObj = JSON.parse(headers);
      hls.config.xhrSetup = (xhr: XMLHttpRequest, url: string) => {
        Object.keys(headersObj).forEach((key) => {
          xhr.setRequestHeader(key, headersObj[key]);
        });
      };

      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      // Clean up the HLS.js instance when the component unmounts
      return () => {
        hls.destroy();
      };
    }
  }, [url, headers]);

  return (
    <div className="flex flex-col justify-center items-center align-bottom">
      <h1>Video URL</h1>
      <input
        type="text"
        onChange={(e) => setUrl(e.target.value)}
        className='w-[80vh] bg-slate-400 border-2'
        defaultValue={url}
      />
      <h1>Headers</h1>
      <input
        type="text"
        className='w-[80vh] bg-slate-400 border-2'
        defaultValue={headers}
        onChange={(e) => setHeaders(e.target.value)}
      />
      <button>Go</button>
      <video
        ref={videoRef}
        controls
        style={{ width: '80vw', height: 'auto', backgroundColor: 'black' }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
