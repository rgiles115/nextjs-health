import { GetServerSideProps, NextPage } from 'next';
import { parse } from 'cookie';

type SuccessProps = {
  stravaData: { [key: string]: any }; // This will hold the entire Strava data object
};

const Success: NextPage<SuccessProps> = ({ stravaData }) => {
  // Convert the stravaData object to a JSON string
  const stravaDataJson = JSON.stringify(stravaData, null, 2); // The '2' argument adds indentation for readability

  return (
    <div>
      <h1>Success Page</h1>
      <h2>Strava Data:</h2>
      <pre>{stravaDataJson}</pre> {/* Render the JSON string inside a <pre> tag for formatting */}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const cookies = req.headers.cookie || '';
  const parsedCookies = parse(cookies);
  const stravaData = parsedCookies.stravaData ? JSON.parse(parsedCookies.stravaData) : {};

  return {
    props: {
      stravaData,
    },
  };
};

export default Success;
