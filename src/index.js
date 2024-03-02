if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');

const app = express();

app.listen('8000', () => {
  console.log('running');
})
app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.get('/', async (req, res) => {
  const cert = fs.readFileSync(
    path.resolve(__dirname, `../certificates/${process.env.EB_CERT}`)
  );

  const agent = new https.Agent({
    pfx: cert,
    passphrase: ''
  });

  const credentials = Buffer.from(
    `${process.env.EB_CLIENT_ID}:${process.env.EB_CLIENT_SECRET}`
  ).toString('base64');

  const baseUrl = process.env.EB_ENDPOINT;

  const authResponse = await axios({
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
  })

  const accessToken = authResponse.data?.access_token;

  const reqEB = axios.create({
    baseURL: baseUrl,
    httpsAgent: agent,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Scope': 'cob.write',
      'Content-Type': 'application/json'
    }
  })

  const dataCob = {
    calendario: {
      expiracao: 3600
    },
    devedor: {
      cpf: "12345678909",
      nome: "Francisco da Silva"
    },
    valor: {
      original: "123.45"
    },
    chave: '71cdf9ba-c695-4e3c-b010-abb521a3f1be',
    solicitacaoPagador: "Cobrança dos serviços prestados."
  };

  const qrCodeResponse = await reqEB.post('/v2/cob', dataCob);
  res.send(qrCodeResponse.data);
});