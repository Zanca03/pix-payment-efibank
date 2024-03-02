const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

const cert = fs.readFileSync(
  path.resolve(__dirname, `../../certificates/${process.env.EB_CERT}`)
);

const agent = new https.Agent({
  pfx: cert,
  passphrase: ''
});

const baseUrl = process.env.EB_ENDPOINT;

const authenticate = ({clientId,clientSecret}) => {
  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString('base64'); 

  return axios({
    method: 'POST',
    url: `${baseUrl}/oauth/token`,
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json"
    },
    httpsAgent: agent,
    data: {
      grant_type: "client_credentials"
    }
  });
};

const EBRequest = async (credentials) => {
  const authResponse = await authenticate(credentials);
  const accessToken = authResponse.data?.access_token;

  return axios.create({
    baseURL: baseUrl,
    httpsAgent: agent,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Scope': 'cob.write cob.read',
      'Content-Type': 'application/json'
    }
  });
};

module.exports = EBRequest;