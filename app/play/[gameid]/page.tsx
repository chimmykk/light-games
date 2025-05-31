"use client"
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const GamePage = () => {
  const [htmlFiles, setHtmlFiles] = useState<string[]>([]);
  const pathname = usePathname();
  const gameid = pathname.split('/').pop(); // Extract gameid from the pathname

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(`/api/getGameData?gameid=${gameid}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setHtmlFiles(data);
        } else {
          console.error('Invalid data format received:', data);
        }
      } catch (error) {
        console.error('Failed to fetch game data:', error);
      }
    };

    fetchGameData();
  }, [gameid]);

  return (
    <div style={{ margin: 0, padding: 0, height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {htmlFiles.map((file, index) => (
        <iframe
          key={index}
          srcDoc={file}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={`HTML File ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default GamePage;
