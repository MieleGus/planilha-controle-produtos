"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('cron'),
    CronJob = _require.CronJob;

var productsController = require('../controllers/productsController');

var jobDeleteData = new CronJob('58 23 * * * *', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log('chegou job delete data');
          _context.next = 3;
          return productsController.handleSendPlanilha();

        case 3:
          console.log('saiu job delete data');

        case 4:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
})), null, true, 'America/Sao_Paulo');
var jobGetProducts = new CronJob('59 23 * * * *', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log('chegou job get products');
          _context2.next = 3;
          return productsController.handleSendPlanilha();

        case 3:
          console.log('saiu job get products - done ya');

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
})), null, true, 'America/Sao_Paulo'); //'0 23 * * * *'
//1  ->   '0 17 * * * *'   delete all
//1  ->   '1 17 * * * *'   get products
//1  ->   '0 18 * * * *'   send mail

jobDeleteData.start();
jobGetProducts.start();
jobDiario3.start();
jobDiario4.start();