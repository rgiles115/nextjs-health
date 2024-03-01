// Imports necessary hooks and libraries.
import { useState, useEffect } from 'react';
import axios from 'axios';
import { EnhancedTagData } from '../../app/types/OuraInterfaces';

// Defines the interface for the response structure of fetching enhanced tags.
interface FetchEnhancedTagsResponse {
  data: EnhancedTagData[]; // Array of enhanced tag data.
  next_token?: string; // Optional property for pagination token.
}

// Custom hook for fetching enhanced tags data between two dates.
export const useFetchEnhancedTags = (startDate: Date, endDate: Date) => {
  // State to hold the tags data fetched from the API.
  const [tagsData, setTagsData] = useState<EnhancedTagData[]>([]);
  // State to track the loading status.
  const [isLoading, setIsLoading] = useState(false);
  // State to hold any error that occurs during the fetch operation.
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to perform the fetch operation when the component mounts or the dates change.
  useEffect(() => {
    // Async function to fetch the enhanced tags data.
    const fetchEnhancedTags = async () => {
      setIsLoading(true); // Sets loading to true at the start of the fetch operation.
      setError(null); // Resets any existing errors.

      try {
        // Formats the start and end dates to ISO string and extracts the date part.
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        // Performs the GET request to the specified endpoint with start and end dates as parameters.
        const response = await axios.get<FetchEnhancedTagsResponse>(`/api/getEnhancedTags`, {
          params: { start_date: formattedStartDate, end_date: formattedEndDate },
        });

        // Updates the tagsData state with the data fetched from the response.
        setTagsData(response.data.data);
      } catch (err) {
        // Handles any errors that occur during the fetch operation.
        if (axios.isAxiosError(err)) {
          // Sets a more specific error message if the error is from Axios.
          setError(err.response?.data.error || 'An unknown error occurred');
        } else {
          // Sets a generic error message for other types of errors.
          setError('An unknown error occurred');
        }
      } finally {
        // Sets loading to false once the fetch operation is complete or fails.
        setIsLoading(false);
      }
    };

    // Calls the fetch function defined above.
    fetchEnhancedTags();
  }, [startDate, endDate]); // Dependency array to trigger useEffect when these values change.

  // Returns the state values to be used by the component that uses this hook.
  return { tagsData, isLoading, error };
};

// Exporting the custom hook for use in other parts of the application.
export default useFetchEnhancedTags;
