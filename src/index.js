if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const EBResquest = require('./apis/efi-bank');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());

app.listen('8000', () => {
  console.log('running');
})
app.set('view engine', 'ejs');
app.set('views', 'src/views');

const reqEBAlready = EBResquest({
  clientId: process.env.EB_CLIENT_ID,
  clientSecret: process.env.EB_CLIENT_SECRET
});

app.get('/', (req,res) => {
  res.render('index.ejs'); //Futuramente irei remover :)
});

app.post('/pix', async (req, res) => {
  console.log(req.body);
  const reqEB = await reqEBAlready;
  const dataCob = {
    calendario: {
      expiracao: 3600
    },
    devedor: {
      cpf: req.body.cpf,
      nome: req.body.nome
    },
    valor: {
      original: req.body.valor
    },
    chave: '71cdf9ba-c695-4e3c-b010-abb521a3f1be',
    solicitacaoPagador: req.body.obs
  };

  const cobCodeResponse = await reqEB.post('/v2/cob', dataCob);
  const cobId = cobCodeResponse.data?.loc.id;

  const qrCodeResponse = await reqEB.get(`/v2/loc/${cobId}/qrcode`);
  //res.render('qrcode', { qrCodeImage: qrCodeResponse.data?.imagemQrcode });
  res.send(qrCodeResponse.data);
});

app.get('/cobrancas', async (req,res) => {
  const reqEB = await reqEBAlready;
  const cobResponse = await reqEB.get(`/v2/cob?inicio=${req.body.dataInicial}&fim=${req.body.dataFinal}`);
  res.send(cobResponse.data);
});

app.post('/webhook(/pix)?',(req,res) => {
  console.log(req.body);
  res.send('200');
});