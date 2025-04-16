import React from "react";
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Head>
        <title>Before You Go - Sydney Restaurant Review Analysis</title>
        <meta
          name='description'
          content='Discover top Sydney restaurants with AI-powered review summaries. Search near you or by location.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Navbar />

      <main className='flex-grow'>
        <Header />
        <div className='container mx-auto px-4 py-8'>{children}</div>
      </main>

      <Footer />
    </div>
  );
}
