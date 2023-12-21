import Image from 'next/image'

export default function Home() {
  return (
    <h1>Last 7 Days Activity Data from Oura Ring</h1>
    <div id="activityData"></div>
    <canvas id="myChart" width="800" height="800"></canvas>
    <!-- <script src="/script.js"></script> -->
  )
}
