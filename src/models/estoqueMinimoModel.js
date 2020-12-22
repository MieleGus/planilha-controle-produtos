const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema(
    {
        codigo: {
            type: String,
            required: false
        },
        quantidade: {
            type: Number,
            required: false,
        },
    },
);

export default mongoose.model('estoque_minimos', schema);