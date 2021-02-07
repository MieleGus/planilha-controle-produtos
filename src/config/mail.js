require('dotenv/config');
const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const transport = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASSWORD
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
