import { useEffect } from 'react';
import '../styles.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.pendo) {
      pendo.initialize({
        visitor: {
          id: ''
        }
      });
    }
  }, []);

  return <Component {...pageProps} />;
}
