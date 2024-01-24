import { Chart } from 'chart.js';

declare global {
    interface Window {
        myStravaChart: Chart | undefined;
    }
}
