import Head from 'next/head';
import ActivityChart from './components/ActivityChart';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Oura Ring Activity Data</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <h1>Last 7 Days Activity Data from Oura Ring</h1>
      <div id="activityData"></div>
      <ActivityChart />
    </div>
  )
}
