// jest.setup.js
require('jest-fetch-mock').enableMocks();

// Optional: configure default mocks or settings
fetchMock.dontMock(); // if you want to manually mock calls in each test
