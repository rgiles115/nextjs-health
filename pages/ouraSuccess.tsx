import { GetServerSideProps, NextPage } from 'next';
import { parse } from 'cookie';

type SuccessProps = {
  ouraData: { [key: string]: any }; // This will hold the entire Oura data object
};

const Success: NextPage<SuccessProps> = ({ ouraData }) => {
  // Convert the ouraData object to a JSON string
  const ouraDataJson = JSON.stringify(ouraData, null, 2); // The '2' argument adds indentation for readability

  return (
    <div>
      <h1>Success Page</h1>
      <h2>Oura Data:</h2>
      <pre>{ouraDataJson}</pre> {/* Render the JSON string inside a <pre> tag for formatting */}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const cookies = req.headers.cookie || '';
  const parsedCookies = parse(cookies);
  const ouraData = parsedCookies.ouraData ? JSON.parse(parsedCookies.ouraData) : {};

  return {
    props: {
      ouraData,
    },
  };
};

export default Success;
