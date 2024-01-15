// ouraAuthStatus.test.ts
import handler from '../pages/api/ouraAuthStatus';
import { createMocks } from 'node-mocks-http';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('/api/ouraAuthStatus', () => {
  // Mock Oura cookie data representing a valid token
  const mockValidOuraCookie = {
    access_token: "FEM3ZJFWZ27DO2NGXR3PNRREC5HJSVXA",
    token_type: "Bearer",
    expires_in: 86400,
    refresh_token: "LY4ZOYHDIA47S5MNY4VUKU4BSOOXIEPH",
    expires_at: 1705446578 // Adjust as needed for test scenarios
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return authenticated status if token is valid', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        cookie: `ouraData=${JSON.stringify(mockValidOuraCookie)}`,
      },
    });
  
    await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ isOuraAuthed: true });
  });
  

  it('should refresh token if expired and return new auth status', async () => {
    const mockExpiredOuraCookie = {
      ...mockValidOuraCookie,
      expires_at: 1600000000 // Past timestamp to simulate expired token
    };
  
    const futureTimestamp = Math.floor(Date.now() / 1000) + 86400;
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: "NEW_ACCESS_TOKEN",
        expires_in: 86400,
        refresh_token: "NEW_REFRESH_TOKEN",
        expires_at: futureTimestamp
      }
    });
  
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        cookie: `ouraData=${JSON.stringify(mockExpiredOuraCookie)}`,
      },
    });
  
    await handler(req as any as NextApiRequest, res as any as NextApiResponse);

  // Log the 'Set-Cookie' header and response body
  console.log('Set-Cookie Header:', res.getHeader('Set-Cookie'));
  console.log('Response Body:', res._getData());

    const setCookieHeader = res.getHeader('Set-Cookie');
    const cookieValue = setCookieHeader && typeof setCookieHeader === 'string'
      ? cookie.parse(setCookieHeader.split(';')[0]) // Parsing the cookie string
      : {};

  expect(mockedAxios.post).toHaveBeenCalled();
  expect(cookieValue.ouraData).toBeDefined();
  const refreshedData = JSON.parse(cookieValue.ouraData);
  expect(refreshedData.expires_at).toBe(futureTimestamp);
  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual({ isOuraAuthed: true });
});
  

  // More tests can be added for other scenarios
});
