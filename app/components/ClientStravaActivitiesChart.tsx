import React from 'react';
import StravaChart from './StravaChart'; // Adjust the path as necessary
import NumberContainers from './NumberContainers'; // Adjust the path as necessary
import useProcessStravaData from './useProcessStravaData'; // Adjust the path as necessary
import { StravaActivity } from '../types/StravaInterface';

interface ClientStravaActivitiesChartProps {
  startDate: Date;
  endDate: Date;
  stravaData: StravaActivity[] | null;
  isLoading: boolean;
}

const ClientStravaActivitiesChart: React.FC<ClientStravaActivitiesChartProps> = ({ startDate, endDate, stravaData, isLoading }) => {
  const { processedData, totalDistance, totalElevationGain } = useProcessStravaData(stravaData, startDate, endDate);

  return (
    <div>
      <NumberContainers totalDistance={totalDistance} totalElevationGain={totalElevationGain} />
      <StravaChart processedData={processedData} isLoading={isLoading} />
    </div>
  );
};

export default ClientStravaActivitiesChart;
