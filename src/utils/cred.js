const credential = {
  type: process.env.REACT_APP_KEY_TYPE,
  project_id: process.env.REACT_APP_KEY_PROJECT_ID,
  private_key_id: process.env.REACT_APP_KEY_PRIVATE_KEY_ID,
  private_key: process.env.REACT_APP_KEY_PRIVATE_KEY,
  client_email: process.env.REACT_APP_KEY_CLIENT_EMAIL,
  client_id: process.env.REACT_APP_KEY_CLIENT_ID,
  auth_uri: process.env.REACT_APP_KEY_AUTH_URI,
  token_uri: process.env.REACT_APP_KEY_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.REACT_APP_KEY_AUTH_PROVIDER,
  client_x509_cert_url: process.env.REACT_APP_KEY_CLIENT_CERT_URL,
};

export default JSON.stringify(credential);
