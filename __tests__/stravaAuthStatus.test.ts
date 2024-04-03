import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../pages/api/stravaAuthStatus'; // Adjust the import path as necessary
import { serialize, parse } from 'cookie';

// Mock the axios and cookie modules
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock request and response generator functions
const mockReq = (cookie = ''): NextApiRequest => ({
  headers: {
    cookie,
  },
  cookies: cookie ? parse(cookie) : {},
} as any);

const mockRes = (): NextApiResponse => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

describe('Strava Auth Status API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refreshes the token when expired and updates the cookie correctly', async () => {
    const expiredTokenData = {
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) - 100, // Ensure the token is considered expired
      expires_in: 21600,
      refresh_token: 'oldRefreshToken',
      access_token: 'oldAccessToken',
      athlete: {/* Mock athlete data */},
    };

    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'newAccessToken',
        expires_in: 21600,
        refresh_token: 'newRefreshToken',
      },
    });

    const req = mockReq(serialize('stravaData', JSON.stringify(expiredTokenData)));
    const res = mockRes();

    await handler(req, res);

    expect(mockedAxios.post).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('newAccessToken')
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringMatching(/HttpOnly; Secure/)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Strava token refreshed' }));
  });

  it('identifies valid authentication cookie and does not attempt to refresh token', async () => {
    const validTokenData = {
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour into the future
      expires_in: 3600,
      refresh_token: 'validRefreshToken',
      access_token: 'validAccessToken',
      athlete: {/* Mock athlete data */},
    };

    const req = mockReq(serialize('stravaData', JSON.stringify(validTokenData)));
    const res = mockRes();

    await handler(req, res);

    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      isStravaAuthed: true,
    }));
  });

  describe('Strava Auth Status API - No Cookie Present', () => {
    it('handles requests with no authentication cookie', async () => {
      // Create a request object without any cookies
      const req = mockReq();
      const res = mockRes();
  
      // Execute the handler with the mock request and response
      await handler(req, res);
  
      // Assertions to verify the behavior when no cookie is present
      expect(mockedAxios.post).not.toHaveBeenCalled(); // Ensure no attempt is made to refresh the token
      expect(res.status).toHaveBeenCalledWith(200); // Check that a successful response is still returned
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        isStravaAuthed: false, // Expect the API to indicate that Strava is not authenticated
      }));
    });
  });
  

  // Here you can add more tests for different scenarios, like error handling during token refresh
});
