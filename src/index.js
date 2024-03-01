if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

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

axios({
    method: 'POST',
    url: `${process.env.EB_ENDPOINT}/oauth/token`,
    headers:{
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json"
    },
    httpsAgent: agent,
    data: {
        grant_type: "client_credentials" 
    }
}).then((response) => {
    const accessToken = response.data?.access_token;
    const endpoint = `${process.env.EB_ENDPOINT}/v2/cob`;

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

    const config = {
      httpsAgent: agent,
      headers: {
          Authorization: `Bearer ${accessToken}`,
          'Scope': 'cob.write',
          'Content-Type': 'application/json'
      }
    };

    axios.post(endpoint, dataCob, config).then(response => {
      console.log('Resposta da API:', response.data);
    });  
});