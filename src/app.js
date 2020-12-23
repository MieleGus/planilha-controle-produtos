require('dotenv/config');
const express = require('express');
const mongoose = require('mongoose');
const productsController = require('./controllers/productsController')

require('./config/worker')

const app = express();

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.set('useFindAndModify', false);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log('connected to database');
});

const teste2 = async () => {
    // await productsController.deleteAllProducts();
    // await productsController.getProductsTiny();
    // await productsController.handleSendPlanilha();

    // await productsController.getEstoqueMinimo(); //
}

teste2();

//worker ->
    // deleteallProducts 17h
    // 
    // getProductsTiny() 17h
    // geraCSV  e envia 18h

export default app;