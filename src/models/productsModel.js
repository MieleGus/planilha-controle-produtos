const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema(
    {
        id: {
            type: Number,
            required: true,
        },
        nome: {
            type: String,
            required: true
        },
        codigo: {
            type: String,
            required: false
        },
        preco: {
            type: Number,
            required: true
        },
        preco_promocional: {
            type: Number,
            required: true
        },
        preco_custo: {
            type: Number,
            required: false
        },
        preco_custo_medio: {
            type: Number,
            required: false
        },
        unidade: {
            type: String,
            required: false
        },
        gtin: {
            type: String,
            required: false
        },
        tipoVariacao: {
            type: String,
            required: true
        },
        localizacao: {
            type: String,
            required: false
        },
        saldo: {
            type: Number,
            required: false
        },
        saldo_reservado: {
            type: Number,
            required: false
        },
        depositos: [
            {
                nome: String,
                desconsiderar: String,
                saldo: Number,
                empresa: String,
            }
        ],
        data_alteracao: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Products', schema);