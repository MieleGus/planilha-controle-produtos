const axios = require('axios')
require('dotenv/config');
const qs = require('qs');
const moment = require('moment')
import productsModel from '../models/productsModel'

import { ExportToCsv } from 'export-to-csv';

const urlProdutos = 'https://api.tiny.com.br/api2/produtos.pesquisa.php'
const urlEstoque = 'https://api.tiny.com.br/api2/produto.obter.estoque.php'
const urlProdutosAlterados = 'https://api.tiny.com.br/api2/lista.atualizacoes.produtos'
const urlEstoquesAlterados = 'https://api.tiny.com.br/api2/lista.atualizacoes.estoque'

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

let initialDataBodyProdutosAlterados = {
    token: process.env.TOKEN_API_TINY,
    dataAlteracao: moment().format('DD/MM/YYYY'),
    formato: 'json',
}


const timer = ms => new Promise(res => setTimeout(res, ms))

const getProductsFirstPageTiny = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = (await axios.post(urlProdutos, qs.stringify(initialDataBodyProdutos))).data.retorno;
            const numero_paginas = response.numero_paginas

            // if(response.erros.length > 0) {
            //     for(erro of response.erros) {
            //         console.log('erro: ', erro)
            //     }
            //     return;
            // }

            for (let cont = 0; cont < response.produtos.length; cont++){ //trocar length para 3
                let produto = response.produtos[cont].produto

                let produtoExistente = await productsModel.findOne({id: produto.id}).exec()
                if (produtoExistente) {
                    console.log('produto existente!')
                } else {
                    console.log('criando produto!')
                    
                    await productsModel.create(produto)  
                    
                    // let productData = {
                    //     name: produto.nome,
                    //     code: produto.id,
                    //     sku: produto.codigo,
                    //     price: parseFloat(produto.preco)*100,
                    //     facet_values: [{ id: produto.id }]
                    // }
    
                    // await insereProdutoPeopleCommerce(productData)

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

        // if(responseEstoque.erros.length > 0) {
        //     for(erro of response.erros) {
        //         console.log('erro: ', erro)
        //     }
        //     return;
        // }
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

const teste3 = async () => {

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
    headers: ['Produto', 'Estoque físico', 'Estoque reservado', 'Unidade', 'Estoque Mínimo', 'Localização',]
  };

const csvExporter = new ExportToCsv(optionsCSV);

const handleGenerateCSV = async () => {
    try {
        let data = await productsModel.find();
        console.log("🚀 ~ file: productsController.js ~ line 213 ~ handleGenerateCSV ~ data", data)
    } catch(error) {

    }
}

module.exports = {
    getProductsTiny,
    getProductsFirstPageTiny,
    teste3,
    deleteAllProducts,
    handleGenerateCSV
}
//verifica todos ids para inclusao / remocao -> rodar periodicamente
//depois rodar apenas nas paginas atualizadas . 2 metoods.

//ficar rodando método 1 para ver se o produto foi inserido ou removido
//ficar rodando método 2 (produto & estoque) para verificar a alteração


//getProducts -> criando todos produtos e atualizando todos estoques

//verificar alterações de estoque -> atualizaProdutos ok ->?

//verificar alterações de produto



// const csvExporter = (data) => {
//     console.log("exportarCSV -> data", data)
//     let newObj = []

//     data.dadosComissao.map((item, index) => {
//         newObj[index] = {
//             representante_id: item.representante_razao_social || item.representante_nome,
//             grupo: item.grupo_id,
//             associado: item.associado_razao_social || item.associado_nome,
//             placa: item.placa,
//             data_pagamento: moment(item.pagamento).format('DD/MM/YYYY'),
//             tipo: item.tipo,
//             valor_recebido: (item.valor_mensalidade > 0) ? parseFloat(item.valor_mensalidade.toFixed(2)) : '' ,
//             porcentagem_valor: item.valor_mensalidade ? 10.00 : 0.2,
//             valor_comissao: parseFloat(item.valor_comissao.toFixed(2)),
//         }
//     })

//         // newObj.sort(function(a,b){
//         //     a = a.associado_id;
//         //     b = b.associado_id;
//         //     return a-b;
//         // });
//         newObj.push({
//             representante_id: '',
//             grupo:'',
//             associado: '',
//             placa:'',
//             data_pagamento: '',
//             tipo: '',
//             valor_recebido: '',
//             porcentagem_valor: '',
//             valor_comissao: '',
//         })
        
//         newObj.push({
//             representante_id: 'TOTAL:',
//             grupo:'',
//             associado: '',
//             placa:'',
//             data_pagamento: '',
//             tipo: '',
//             valor_recebido: '',
//             porcentagem_valor: '',
//             valor_comissao: parseFloat(data.total_valor_comissao.toFixed(2)),
//         })
//         csvExporterLaudosEVistorias.generateCsv(newObj)
//     }