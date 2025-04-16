import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import Layout from "../components/layout/Layout";

declare global {
  interface Window {
    initMap: () => void;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&loading=async`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    if (
      typeof window !== "undefined" &&
      !document.querySelector('script[src*="maps.googleapis.com"]')
    ) {
      loadGoogleMapsScript();
    }
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
