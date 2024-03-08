import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/ouraAuth';
import fetchMock from 'jest-fetch-mock';

// Mocking console.error to suppress error logs in test output
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
    // Restoring console.error after tests run
    (console.error as jest.Mock).mockRestore();
});

beforeEach(() => {
    fetchMock.resetMocks();
});

describe('OuraAuth API Endpoint', () => {
    it('should exchange code for token and set cookie on success', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({
            access_token: 'test-token',
            expires_in: 3600,
        }));

        process.env.OURA_CLIENT_ID = 'test-client-id';
        process.env.OURA_CLIENT_SECRET = 'test-client-secret';
        process.env.OURA_REDIRECT_URI = 'http://localhost/callback';

        const { req, res } = createMocks({
            method: 'GET',
            query: {
                code: 'test-code',
            },
        });

        await handler(req as any, res as any);

        expect(res._getStatusCode()).toBe(302); // Checks if redirected
        expect(res._getHeaders()['set-cookie']).toBeDefined(); // Checks if cookie is set
    });

    describe('OuraAuth API Endpoint - Error Handling', () => {
        beforeEach(() => {
            fetchMock.resetMocks();
        });

        it('should return a 400 error when code is not provided', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    // Intentionally omitting 'code' to simulate the error condition
                },
            });

            await handler(req as any, res as any);

            // Check if the status code is 400, indicating a client-side error
            expect(res._getStatusCode()).toBe(400);

            // Optionally, check if the response message is as expected
            // This depends on how your API handler formats error messages
            expect(res._getData()).toBe('Code is required');
        });
    });

    it('should handle successful response from Oura API', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({
            access_token: 'access-token',
            expires_in: 3600, // Example expiration time in seconds
        }));

        const { req, res } = createMocks({
            method: 'GET',
            query: {
                code: 'valid-code',
            },
        });

        await handler(req as any, res as any);

        expect(res._getStatusCode()).toBe(302); // Assuming redirection to '/' signifies success
        expect(res._getHeaders()['set-cookie']).toBeDefined();
    });

    it('should log an error and return a 500 status when the Oura API call fails', async () => {
        fetchMock.mockReject(new Error('Failed to fetch'));

        const { req, res } = createMocks({
            method: 'GET',
            query: {
                code: 'valid-code-but-api-fails',
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