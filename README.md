This project is a Next.js web application, initially created with create-next-app and developed further with the assistance of ChatGPT to test whether it could produce a reletively complex software product. It integrates, via OAuth, Strava and Oura APIs to fetch user's activity and health data, then utilizes OpenAI's API for advanced data analysis, resembling the insights of a professional coach.

## Getting Started

# Prerequisites

Before running the application, you need to register your app with Strava and Oura to obtain authentication credentials. Additionally, an OpenAI API Key is required.

Strava Registration: Visit the [Strava Developers](https://developers.strava.com/) page to register your application.
Oura Registration: Go to the [Oura Developers Portal](https://cloud.ouraring.com/v2/docs) to get your credentials.
OpenAI API Key: Obtain an API key from [OpenAI](https://openai.com/product).

Register your app with Strava and Oura, and copy the Auth details. You will also need an OpenAI
API Key.

# Environment Setup

Create a .env file in the root directory and add the following fields:
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=your_strava_redirect_uri
OURA_CLIENT_ID=your_oura_client_id
OURA_CLIENT_SECRET=your_oura_client_secret
OURA_REDIRECT_URI=your_oura_redirect_uri
OPENAI_SECRET=your_openai_api_key

# Running the Development Server

To start the development server, run one of the following commands:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
