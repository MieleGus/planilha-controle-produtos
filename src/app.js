require('dotenv/config');
const express = require('express');
const mongoose = require('mongoose');
const productsController = require('./controllers/productsController')

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
    await productsController.handleGenerateCSV();
    // await productsController.getEstoqueMinimo();
}

teste2();

//worker ->
    // deleteallProducts 17h
    // 
    // getProductsTiny()
    // geraCSV  e envia

export default app;