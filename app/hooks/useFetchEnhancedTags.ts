import { useState, useEffect } from 'react';
import axios from 'axios';
import { EnhancedTagData } from '../../app/types/OuraInterfaces';


interface FetchEnhancedTagsResponse {
  data: EnhancedTagData[];
  next_token?: string; // Optional, in case you implement pagination
}


export const useFetchEnhancedTags = (startDate: Date, endDate: Date) => {
  const [tagsData, setTagsData] = useState<EnhancedTagData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnhancedTags = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        const response = await axios.get<FetchEnhancedTagsResponse>(`/api/getEnhancedTags`, {
          params: { start_date: formattedStartDate, end_date: formattedEndDate },
        });

        setTagsData(response.data.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data.error || 'An unknown error occurred');
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnhancedTags();
  }, [startDate, endDate]);

  return { tagsData, isLoading, error };
};

export default useFetchEnhancedTags;