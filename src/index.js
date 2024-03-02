if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const EBResquest = require('./apis/efi-bank');

const app = express();

app.listen('8000', () => {
  console.log('running');
})
app.set('view engine', 'ejs');
app.set('views', 'src/views');

const reqEBAlready = EBResquest({
  clientId: process.env.EB_CLIENT_ID,
  clientSecret: process.env.EB_CLIENT_SECRET
});

app.get('/', async (req, res) => {
  const reqEB = await reqEBAlready;
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

  const cobCodeResponse = await reqEB.post('/v2/cob', dataCob);
  const cobId = cobCodeResponse.data?.loc.id;

  const qrCodeResponse = await reqEB.get(`/v2/loc/${cobId}/qrcode`);
  res.render('qrcode', { qrCodeImage: qrCodeResponse.data?.imagemQrcode });
});

app.get('/cobrancas', async (req,res) => {
  const reqEB = await reqEBAlready;
  const currentDate = new Date().toJSON();

  const cobResponse = await reqEB.get(`/v2/cob?inicio=2020-10-22T16:01:35Z&fim=${currentDate}`);
  res.send(cobResponse.data);
});