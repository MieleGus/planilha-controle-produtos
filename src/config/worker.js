const { CronJob } = require('cron');
const productsController = require('../controllers/productsController');

console.log('running...')
const jobDeleteData = new CronJob('00 06 09 * * *', async function() {
    console.log('chegou job delete data')
    await productsController.deleteAllProducts()
    console.log('saiu job delete data')
}, null, true, 'America/Sao_Paulo');

const jobGetProducts = new CronJob('30 06 09 * * *', async function() {
    console.log('chegou job get products')
    await productsController.getProductsTiny();
    await productsController.handleSendPlanilha()
    console.log('saiu job get products - done ya')
}, null, true, 'America/Sao_Paulo');

//'0 23 * * * *'
//1  ->   '0 17 * * * *'   delete all
//1  ->   '1 17 * * * *'   get products
//1  ->   '0 18 * * * *'   send mail

jobDeleteData.start();
jobGetProducts.start();


