const axios = require('axios')
require('dotenv/config');
const qs = require('qs');
const moment = require('moment')
import productsModel from '../models/productsModel'
const mail = require('../config/mail');

import { ExportToCsv } from 'export-to-csv';

const urlProdutos = 'https://api.tiny.com.br/api2/produtos.pesquisa.php'
const urlEstoque = 'https://api.tiny.com.br/api2/produto.obter.estoque.php'

let initialDataBodyProdutos = {
    token: process.env.TOKEN_API_TINY,
    pesquisa: '',
    pagina: 1,
    formato: 'json'
}    

let initialDataBodyEstoque = {
    token: process.env.TOKEN_API_TINY,
    formato: 'json',
}

const timer = ms => new Promise(res => setTimeout(res, ms))

const getProductsFirstPageTiny = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = (await axios.post(urlProdutos, qs.stringify(initialDataBodyProdutos))).data.retorno;
            const numero_paginas = response.numero_paginas

            for (let cont = 0; cont < response.produtos.length; cont++){
                let produto = response.produtos[cont].produto

                let produtoExistente = await productsModel.findOne({id: produto.id}).exec()
                if (produtoExistente) {
                    console.log('produto existente!')
                } else {
                    console.log('criando produto!')
                    
                    await productsModel.create(produto)  
                    
                    await getEstoqueTiny(produto.id)
                }
            }
            await timer(1250)
            return resolve(numero_paginas);
        } catch(error) {
            console.log("error", error)
            reject(error);
        }
    })
}

const getProductsOtherPagesTiny = async (numero_paginas) => {
    return new Promise(async (resolve, reject) => {
        try {

            for (let cont = 2; cont <= numero_paginas; cont++) {
                console.log('iniciou first page')
                console.log('cont other page', cont)
                
                initialDataBodyProdutos.pagina=cont
        
                const response = (await axios.post(urlProdutos, qs.stringify(initialDataBodyProdutos))).data.retorno;

                for (let cont = 0; cont < response.produtos.length; cont++){
                    let produto = response.produtos[cont].produto
        
                    let produtoExistente = await productsModel.findOne({id: produto.id}).exec()

                    if (produtoExistente) {
                        console.log('produto existente!')
                    } else {
                        console.log('criando produto!')
                        await productsModel.create(produto)

                        await getEstoqueTiny(produto.id)
                    }
                }

                await timer(1250)
            }
            return resolve('ok')
        } catch(err) {
            console.log('getProductsOtherPagesTiny', getProductsOtherPagesTiny)
            reject(err);
        }
    })
}

const getEstoqueTiny = async (produto_id) => {
    try {
        const responseEstoque = (await axios.post(urlEstoque, qs.stringify({...initialDataBodyEstoque, id: produto_id}))).data.retorno;

        for (let cont = 0; cont < responseEstoque.produto.depositos.length; cont++) {

            await productsModel.findOneAndUpdate({id: produto_id}, {saldo: responseEstoque.produto.saldo, saldo_reservado: responseEstoque.produto.saldoReservado, depositos: responseEstoque.produto.depositos[cont].deposito})

            console.log("estoque atualizado")
        }

        await timer(1250)

    } catch(err) {
        console.log('err get estoque', err)
    }
}

const getProductsTiny = async () => {
    try {
        console.log('iniciou first page')
        let numero_paginas = await getProductsFirstPageTiny()
        console.log("numero_paginas", numero_paginas)

        console.log('terminou first page')
        let teste = await getProductsOtherPagesTiny(numero_paginas)
        console.log("teste", teste)
        console.log('terminou other pages')

    } catch(err) {
        console.log("err", err)
    }
}

const deleteAllProducts = async () => {
    try {
        productsModel.deleteMany({}).then(function(){ 
            console.log("Data deleted"); 
        }).catch(function(error){ 
            console.log(error); 
        }); 
    } catch(error) {
        console.log("error delete all products", error)
        
    }
}


const optionsCSV = { 
    fieldSeparator: ';',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true, 
    showTitle: false,
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: false,
    headers: ['Código (SKU)', 'Produto', 'Estoque físico', 'Estoque reservado', 'Unidade', 'Estoque Mínimo', 'Localização',]
  };

  const csvExporter = new ExportToCsv(optionsCSV);

  const csvExporterPlanilha = (data) => {
    let newObj = []
    
    data.map((item, index) => {
        newObj[index] = {
            codigo: item.codigo,
            produto: item.nome,
            estoque_fisico: item.saldo ? item.saldo : '',
            estoque_reservado: item.saldo_reservado ? item.saldo_reservado : '',
            unidade: item.unidade,
            estoque_minimo:'',
            localizacao: item.localizacao,
        }
    })
     
       return csvExporter.generateCsv(newObj, true)
    }


const handleGenerateCSV = async () => {
    try {
        let data = await productsModel.find();
        let csv = csvExporterPlanilha(data)
        console.log("🚀 ~ file: productsController.js ~ line 195 ~ handleGenerateCSV ~ csv", csv)

        mail.sendMail({
            to: ['gustavofraga@teste.com.br'],
            from: 'gustavofraga@teste.com.br',
            subject: `Planilha`,
            template: 'planilha',
            attachments : [
                {
                    filename: 'teste.csv',
                    content: csv
                }
            ],
        });
        
    } catch(error) {

    }
}

module.exports = {
    getProductsTiny,
    getProductsFirstPageTiny,
    deleteAllProducts,
    handleGenerateCSV
}