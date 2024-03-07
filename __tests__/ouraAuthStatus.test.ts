import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../pages/api/ouraAuthStatus'; // Adjust the import path as necessary
import cookie from 'cookie';

// Mock the axios and cookie modules
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('cookie');
const mockedCookie = cookie as jest.Mocked<typeof cookie>;

// Mock request and response utility functions
const mockReq = (cookies = ''): NextApiRequest => ({
  headers: {
    cookie: cookies,
  },
} as any);

const mockRes = (): NextApiResponse => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

describe('Oura Auth Status API', () => {
  it('refreshes the token when expired', async () => {
    // Mock data for an expired Oura token
    const expiredOuraData = {
      access_token: "L2D76CTXJ2FQQZXDWA72QC6Q7BQBSFEG",
      token_type: "Bearer",
      expires_in: 86400,
      refresh_token: "R76OUXVKCZIGTUS67Z5OVZZSPSX7BE25",
      expires_at: Math.floor(Date.now() / 1000) - 1000, // Ensure this is in the past
    };

    // Set up mock return values for axios and cookie.parse
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: "newAccessToken",
        token_type: "Bearer",
        expires_in: 86400, // Assuming the same expiration duration for simplicity
        refresh_token: "newRefreshToken",
        expires_at: Math.floor(Date.now() / 1000) + 86400, // Ensure this is in the future
      },
    });

    mockedCookie.parse.mockReturnValue({ ouraData: JSON.stringify(expiredOuraData) });

    // Serialize the expired token data and set it as a cookie in the mock request
    const serializedCookie = cookie.serialize('ouraData', JSON.stringify(expiredOuraData));
    const req = mockReq(serializedCookie);
    const res = mockRes();

    // Execute the handler with the mock request and response
    await handler(req, res);

    // Assertions to verify behavior
    expect(mockedAxios.post).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.any(String) // This can be more specific to verify the correct cookie content
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ isOuraAuthed: true }));
  });

  // Additional tests can be added here to cover other scenarios
});
