// Import necessary utilities and types
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../pages/api/stravaAuthStatus'; // Adjust the import path as necessary
import cookie from 'cookie';

// Typecasting the module mocks
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('cookie');
const mockedCookie = cookie as jest.Mocked<typeof cookie>;

// Mock request and response generator functions
const mockReq = (cookies = ''): NextApiRequest => ({
  headers: {
    cookie: cookies,
  },
  // Add any other properties needed to resemble the NextApiRequest type
} as any);

const mockRes = (): NextApiResponse => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

describe('Strava Auth Status API', () => {
  it('refreshes the token when expired', async () => {
    // Mock data for expired Strava token
    const expiredTokenData = {
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) - 100, // Ensure the token is considered expired
      expires_in: 21600,
      refresh_token: 'oldRefreshToken',
      access_token: 'oldAccessToken',
      athlete: {/* Mock athlete data */},
    };

    // Set up mock return values
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'newAccessToken',
        expires_in: 21600,
        refresh_token: 'newRefreshToken',
      },
    });

    mockedCookie.parse.mockReturnValue({
      stravaData: JSON.stringify(expiredTokenData),
    });

    const req = mockReq(cookie.serialize('stravaData', JSON.stringify(expiredTokenData)));
    const res = mockRes();

    // Execute the handler with the mock request and response
    await handler(req, res);

    // Assertions to verify the behavior
    expect(mockedAxios.post).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('newAccessToken') // This checks if the new access token is included in the response cookies
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      isStravaAuthed: true,
    }));
  });

  // Add more tests here to cover other scenarios and edge cases
});
