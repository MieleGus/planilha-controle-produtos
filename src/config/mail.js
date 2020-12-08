const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "fc5c197b9ce119",
      pass: "33230c1d9b0912"
    }
});

const handlebarOptions = {
    viewEngine: {
        extName: '.html',
        partialsDir: path.resolve('./src/templates/'),
        layoutsDir: path.resolve('./src/templates/'),
        defaultLayout: '',
    },
    viewPath: path.resolve('./src/templates/'),
    extName: '.html',
};

transport.use('compile', hbs(handlebarOptions));

module.exports = transport;