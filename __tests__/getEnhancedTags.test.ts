import axios, { AxiosError } from 'axios';
import handler from '../pages/api/getEnhancedTags'; // Update the import path to the actual file
import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';


// Mocking axios
jest.mock('axios');
(axios.isAxiosError as unknown as jest.Mock) = jest.fn((payload: any): payload is AxiosError => {
    return typeof payload === 'object' && payload !== null && 'isAxiosError' in payload && payload.isAxiosError;
});
const mockedAxios = axios as jest.Mocked<typeof axios>;


describe('API Handler Tests', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    it('returns 400 if start or end date is missing', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            query: {}, // Missing start_date and end_date
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({ error: 'Start and end dates are required.' });
    });

    it('returns 400 if Oura authentication details not found', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            query: { start_date: '2022-01-01', end_date: '2022-01-07' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({ error: 'Oura authentication details not found.' });
    });

    it('fetches data successfully from the Oura API', async () => {
        const ouraData = { access_token: 'fake_token' };
        const mockApiResponse = { data: { /* Mock response data from Oura */ } };
        mockedAxios.get.mockResolvedValue(mockApiResponse); // Mock axios call to resolve with mockApiResponse

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            query: { start_date: '2022-01-01', end_date: '2022-01-07' },
            headers: {
                Cookie: `ouraData=${encodeURIComponent(JSON.stringify(ouraData))}`,
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual(mockApiResponse.data);
    });

    it('handles Axios errors gracefully', async () => {
        // Prepare the mock error response consistent with Axios error structure
        const mockAxiosError = {
            isAxiosError: true,
            response: {
                status: 401,
                data: { error: 'Unauthorized' }
            }
        };
        
        // Mock Axios.get to reject with the prepared error
        mockedAxios.get.mockRejectedValue(mockAxiosError);
        console.log("Mock Error:",mockAxiosError);
        
        // Set up the request and response objects using node-mocks-http
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            query: { start_date: '2022-01-01', end_date: '2022-01-07' },
            headers: {
                Cookie: `ouraData=${encodeURIComponent(JSON.stringify({ access_token: 'fake_token' }))}`,
            },
        });
    
        // Invoke the handler
        await handler(req, res);
    
        // Assertions: Expect the response to match the Axios error's status and message
        expect(res._getStatusCode()).toBe(401);
        expect(JSON.parse(res._getData())).toEqual({ error: 'Unauthorized' });
    });
    
    

    // Add more tests here to cover other scenarios, like handling Axios errors, etc.
});
