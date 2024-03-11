// /__mocks__/axios.js

const mockAxios = jest.createMockFromModule('axios');

// Mock any Axios instance methods like get, post, etc.
mockAxios.create = jest.fn(() => mockAxios);

// Example to simulate a failed request
mockAxios.get.mockImplementation(() =>
  Promise.reject(new Error('Request failed'))
);

module.exports = mockAxios;