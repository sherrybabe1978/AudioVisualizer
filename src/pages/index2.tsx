// src/pages/index.tsx

import Head from "next/head";
import { useEffect } from 'react';
import localFont from "next/font/local";
import styles from "@/styles/Home.module.css";
import AudioVisualizer from '../components/AudioVisualizer';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  useEffect(() => {
    console.log("Home component mounted");
  }, []);

  console.log("Rendering Home component");

  return (
    <>
      <Head>
        <title>Audio Visualizer</title>
        <meta
          name="description"
          content="Audio Visualizer built with Next.js"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <AudioVisualizer audioSrc="/how_ai_learns.wav" />
        </main>
      </div>
    </>
  );
}
