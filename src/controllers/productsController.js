require('dotenv/config');

const productsModel = require('../models/productsModel')
const estoqueMinimoModel = require('../models/estoqueMinimoModel')
const json2xls = require('json2xls');
const excelToJson = require('convert-excel-to-json');
const axios = require('axios')
const qs = require('qs');
const mail = require('../config/mail');
const fs = require('fs');
const path = require('path');

const urlProdutos = 'https://api.tiny.com.br/api2/produtos.pesquisa.php'
const urlEstoque = 'https://api.tiny.com.br/api2/produto.obter.estoque.php'

const xlsxDirectory = path.resolve('src/assets/planilha-tiny.xlsx')

const timer = ms => new Promise(res => setTimeout(res, ms))

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
                    
                    let estoque_minimo = await estoqueMinimoModel.findOne({codigo: produto.codigo}).exec()
                    if (estoque_minimo) {
                        console.log("🚀 ~ file: productsController.js ~ line 64 ~ returnnewPromise ~ estoque_minimo", estoque_minimo)
                        await productsModel.findOneAndUpdate({id: produto.id}, {estoque_minimo: estoque_minimo.quantidade})
                    }
                    
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

                        let estoque_minimo = await estoqueMinimoModel.findOne({codigo: produto.codigo}).exec()
                        if (estoque_minimo) {
                            console.log("🚀 ~ file: productsController.js ~ line 64 ~ returnnewPromise ~ estoque_minimo", estoque_minimo)
                            await productsModel.findOneAndUpdate({id: produto.id}, {estoque_minimo: estoque_minimo.quantidade})
                        }

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
        console.log('chegeou delete all products')
        productsModel.deleteMany({}).then(function(){ 
            console.log("Data deleted"); 
        }).catch(function(error){ 
            console.log(error); 
        }); 
        console.log('53253252 products')
        
    } catch(error) {
        console.log("error delete all products", error)
        
    }
}

const getEstoqueMinimo = async () => {
    try {
        const result = excelToJson({
            source: fs.readFileSync(path.resolve('./src/templates/estoque_minimo.xlsx')) // fs.readFileSync return a Buffer
        });
        let planilha = result.Planilha1
        console.log("🚀 ~ file: productsController.js ~ line 208 ~ getEstoqueMinimo ~ planilha", planilha)
        
        for (let cont = 1; cont < planilha.length; cont++) {
            let item = planilha[cont]
            await estoqueMinimoModel.create({codigo: item.A, quantidade: item.B || 0})  
            console.log('item:', {codigo: item.A, quantidade: item.B})
        }

    } catch(error) {
        console.log('error', error)
    }
}


const handleCreateXlsx = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let newObj = []

            data.map((item, index) => {
                newObj[index] = {
                    codigo: item.codigo,
                    produto: item.nome,
                    estoque_fisico: item.saldo ? item.saldo : '',
                    estoque_reservado: item.saldo_reservado ? item.saldo_reservado : '',
                    unidade: item.unidade,
                    estoque_minimo: item.estoque_minimo || '',
                    localizacao: item.localizacao,
                }
            })
            var xlsx = json2xls(newObj);
            fs.writeFileSync(xlsxDirectory, xlsx, 'binary');

            resolve(xlsx)

        } catch(error){
            reject(error)
        }
    })
}

const handleSendPlanilha = async () => {
    try {
        let data = await productsModel.find();
        await handleCreateXlsx(data);

        let xlsxBuffer = fs.readFileSync(xlsxDirectory);

        mail.sendMail({
            to: ['gustavofraga@teste.com.br'],
            from: 'gustavofraga@teste.com.br',
            subject: `Planilha Tiny`,
            template: 'planilha',
            attachments : [
                {
                    filename: `planilha-tiny.xlsx`,
                    content: xlsxBuffer
                }
            ],
        });
        
    } catch(error) {
        console.log('error', error)
    }
}
module.exports = {
    getProductsTiny,
    getProductsFirstPageTiny,
    deleteAllProducts,
    handleSendPlanilha,
    getEstoqueMinimo
}