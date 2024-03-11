import handler from '../pages/api/getSleepData';
import { createMocks } from 'node-mocks-http';
import fetchMock from 'jest-fetch-mock';
import { NextApiRequest, NextApiResponse } from 'next';

fetchMock.enableMocks();

beforeEach(() => {
    fetchMock.resetMocks();
});

// Utility to simulate fetchDetailedSleepData behavior for mocking
const mockFetchDetailedSleepData = (sleepId: string, token: string) => ({
    id: sleepId,
    hrv_values: [20, 30, 40],
    // add other properties as needed
});

describe('getSleepData API Endpoint', () => {
    it('returns 400 if start or end date is missing', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            query: {}, // Missing start_date and end_date
        });

        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({ error: 'Start and end dates are required' });
    });

    it('returns 400 if Oura cookie is not found', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            query: { start_date: '2022-01-01', end_date: '2022-01-07' },
        });

        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({ error: 'Oura cookie not found' });
    });

    it('fetches sleep data successfully', async () => {
        // Mock responses for both the initial and detailed sleep data fetches
        fetchMock.mockResponses(
            // First response: Initial sleep data fetch
            [JSON.stringify({
              data: [{ id: '123' }], // Assume this is the format of your initial API call's response
            }), { status: 200 }],
            // Second response: Detailed sleep data fetch for the first entry
            [JSON.stringify({
              id: '123',
              hrv_values: [20, 30, 40],
              // Additional detailed sleep data properties
            }), { status: 200 }]
            // Add more mock responses if your handler makes more fetch calls
        );

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'GET',
            query: {
                start_date: '2022-01-01',
                end_date: '2022-01-07',
            },
            headers: {
                Cookie: 'ouraData=' + encodeURIComponent(JSON.stringify({ access_token: 'fake_token' })),
            },
        });

        // No need to manually set req.cookies as you're setting the Cookie header directly

        await handler(req, res);

        // Verify the response status code and the presence of data property
        expect(res._getStatusCode()).toBe(200);
        const responseData = JSON.parse(res._getData());
        expect(responseData).toHaveProperty('data');
        expect(responseData.data[0]).toHaveProperty('id', '123');
        // Verify detailed sleep data properties
        expect(responseData.data[0]).toHaveProperty('hrv_values', [20, 30, 40]);
        // Add more assertions as necessary to validate the response structure and data
    });

    // Add more tests to cover error handling, different response scenarios, etc.
});
