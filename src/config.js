const PROD_API_URL = 'https://jobshield-server.onrender.com/api';
const DEV_API_PORT = 5002;

const getBaseUrl = () => {
  if (__DEV__) {
    return PROD_API_URL;
  }
  return PROD_API_URL;
};

const API_URL = getBaseUrl();
const SOCKET_URL = 'https://jobshield-server.onrender.com';

export { API_URL, SOCKET_URL, DEV_API_PORT };
