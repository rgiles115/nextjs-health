import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../pages/api/ouraAuthStatus'; // Adjust the import path as necessary
import cookie from 'cookie';

// Mock the axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Define a type for your mocked NextApiResponse which includes Jest's mock functions
type MockedNextApiResponse = NextApiResponse & {
  setHeader: jest.Mock;
  status: jest.Mock;
  json: jest.Mock;
};

const mockReq = (cookieString = ''): NextApiRequest => ({
  headers: {
    cookie: cookieString,
  },
} as any);

const mockRes = (): MockedNextApiResponse => {
  const res: Partial<MockedNextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res as MockedNextApiResponse;
};

describe('Oura Auth Status API', () => {
  beforeEach(() => {
    // Reset Axios mock before each test
    mockedAxios.post.mockReset();

    // Mock Axios post call to simulate a successful token refresh response
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: "newAccessToken",
        token_type: "Bearer",
        expires_in: 86400, // Assuming the same expiration duration for simplicity
        refresh_token: "newRefreshToken",
        expires_at: Math.floor(Date.now() / 1000) + 86400, // Ensure this is in the future
      },
    });
  });

  it('refreshes the token when expired', async () => {
    // Example cookie data, ensuring it's set to be expired
    const cookieData = {
      "access_token": "WKLEGU6S6IH326J2PQULGAWYRDVT7EX3",
      "token_type": "Bearer",
      "expires_in": 86400,
      "refresh_token": "CGGCPY7SWHGVJLOK4Z7TVWJ4RBG6IZJV",
      "expires_at": Math.floor(Date.now() / 1000) - 100,
    };
    
    const serializedCookie = cookie.serialize('ouraData', JSON.stringify(cookieData), {
      httpOnly: true,
      secure: true,
      path: '/',
    });

    const req = mockReq(serializedCookie);
    const res = mockRes();

    await handler(req, res);

    // Assertions to verify behavior
    expect(res.setHeader).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ isOuraAuthed: true }));
  });
});
