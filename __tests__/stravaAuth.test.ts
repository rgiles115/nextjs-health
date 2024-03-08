import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/stravaAuth'; // Adjust the import path as necessary
import fetchMock from 'jest-fetch-mock';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {}); // Optional: to suppress console.error logs
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('StravaAuth API Endpoint', () => {
  it('should handle successful response from Strava API', async () => {
    // Mock Strava's API successful response
    fetchMock.mockResponseOnce(JSON.stringify({
      access_token: 'strava-access-token',
      athlete: {}, // Assuming Strava returns an athlete object
      expires_at: 21600, // Example expiration time
    }));

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        code: 'valid-strava-code',
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(302); // Assuming redirection to '/' signifies success
    expect(res._getHeaders()['set-cookie']).toBeDefined();
  });

  it('should log an error and return a 500 status when the Strava API call fails', async () => {
    fetchMock.mockReject(new Error('Failed to fetch from Strava API'));

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        code: 'valid-code-but-strava-api-fails',
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(500);
    // Verify the response contains the expected error structure
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      success: false,
      message: 'Internal Server Error',
    });
    // Assert that console.error was called with an error
    expect(console.error).toHaveBeenCalledWith(expect.any(Error));
  });
});
