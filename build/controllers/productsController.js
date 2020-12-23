"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require('dotenv/config');

var productsModel = require('../models/productsModel');

var estoqueMinimoModel = require('../models/estoqueMinimoModel');

var json2xls = require('json2xls');

var excelToJson = require('convert-excel-to-json');

var axios = require('axios');

var qs = require('qs');

var moment = require('moment');

var mail = require('../config/mail');

var fs = require('fs');

var path = require('path');

var urlProdutos = 'https://api.tiny.com.br/api2/produtos.pesquisa.php';
var urlEstoque = 'https://api.tiny.com.br/api2/produto.obter.estoque.php';
var xlsxDirectory = path.resolve('src/assets/planilha-tiny.xlsx');

var timer = function timer(ms) {
  return new Promise(function (res) {
    return setTimeout(res, ms);
  });
};

var initialDataBodyProdutos = {
  token: process.env.TOKEN_API_TINY,
  pesquisa: '',
  pagina: 1,
  formato: 'json'
};
var initialDataBodyEstoque = {
  token: process.env.TOKEN_API_TINY,
  formato: 'json'
};

var getProductsFirstPageTiny = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new Promise( /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
                var response, numero_paginas, cont, produto, produtoExistente, estoque_minimo;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return axios.post(urlProdutos, qs.stringify(initialDataBodyProdutos));

                      case 3:
                        response = _context.sent.data.retorno;
                        numero_paginas = response.numero_paginas;
                        cont = 0;

                      case 6:
                        if (!(cont < response.produtos.length)) {
                          _context.next = 30;
                          break;
                        }

                        produto = response.produtos[cont].produto;
                        _context.next = 10;
                        return productsModel.findOne({
                          id: produto.id
                        }).exec();

                      case 10:
                        produtoExistente = _context.sent;

                        if (!produtoExistente) {
                          _context.next = 15;
                          break;
                        }

                        console.log('produto existente!');
                        _context.next = 27;
                        break;

                      case 15:
                        console.log('criando produto!');
                        _context.next = 18;
                        return productsModel.create(produto);

                      case 18:
                        _context.next = 20;
                        return estoqueMinimoModel.findOne({
                          codigo: produto.codigo
                        }).exec();

                      case 20:
                        estoque_minimo = _context.sent;

                        if (!estoque_minimo) {
                          _context.next = 25;
                          break;
                        }

                        console.log("🚀 ~ file: productsController.js ~ line 64 ~ returnnewPromise ~ estoque_minimo", estoque_minimo);
                        _context.next = 25;
                        return productsModel.findOneAndUpdate({
                          id: produto.id
                        }, {
                          estoque_minimo: estoque_minimo.quantidade
                        });

                      case 25:
                        _context.next = 27;
                        return getEstoqueTiny(produto.id);

                      case 27:
                        cont++;
                        _context.next = 6;
                        break;

                      case 30:
                        _context.next = 32;
                        return timer(1250);

                      case 32:
                        return _context.abrupt("return", resolve(numero_paginas));

                      case 35:
                        _context.prev = 35;
                        _context.t0 = _context["catch"](0);
                        console.log("error", _context.t0);
                        reject(_context.t0);

                      case 39:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee, null, [[0, 35]]);
              }));

              return function (_x, _x2) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function getProductsFirstPageTiny() {
    return _ref.apply(this, arguments);
  };
}();

var getProductsOtherPagesTiny = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(numero_paginas) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            return _context4.abrupt("return", new Promise( /*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve, reject) {
                var cont, response, _cont, produto, produtoExistente, estoque_minimo;

                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.prev = 0;
                        cont = 2;

                      case 2:
                        if (!(cont <= numero_paginas)) {
                          _context3.next = 39;
                          break;
                        }

                        console.log('iniciou first page');
                        console.log('cont other page', cont);
                        initialDataBodyProdutos.pagina = cont;
                        _context3.next = 8;
                        return axios.post(urlProdutos, qs.stringify(initialDataBodyProdutos));

                      case 8:
                        response = _context3.sent.data.retorno;
                        _cont = 0;

                      case 10:
                        if (!(_cont < response.produtos.length)) {
                          _context3.next = 34;
                          break;
                        }

                        produto = response.produtos[_cont].produto;
                        _context3.next = 14;
                        return productsModel.findOne({
                          id: produto.id
                        }).exec();

                      case 14:
                        produtoExistente = _context3.sent;

                        if (!produtoExistente) {
                          _context3.next = 19;
                          break;
                        }

                        console.log('produto existente!');
                        _context3.next = 31;
                        break;

                      case 19:
                        console.log('criando produto!');
                        _context3.next = 22;
                        return productsModel.create(produto);

                      case 22:
                        _context3.next = 24;
                        return estoqueMinimoModel.findOne({
                          codigo: produto.codigo
                        }).exec();

                      case 24:
                        estoque_minimo = _context3.sent;

                        if (!estoque_minimo) {
                          _context3.next = 29;
                          break;
                        }

                        console.log("🚀 ~ file: productsController.js ~ line 64 ~ returnnewPromise ~ estoque_minimo", estoque_minimo);
                        _context3.next = 29;
                        return productsModel.findOneAndUpdate({
                          id: produto.id
                        }, {
                          estoque_minimo: estoque_minimo.quantidade
                        });

                      case 29:
                        _context3.next = 31;
                        return getEstoqueTiny(produto.id);

                      case 31:
                        _cont++;
                        _context3.next = 10;
                        break;

                      case 34:
                        _context3.next = 36;
                        return timer(1250);

                      case 36:
                        cont++;
                        _context3.next = 2;
                        break;

                      case 39:
                        return _context3.abrupt("return", resolve('ok'));

                      case 42:
                        _context3.prev = 42;
                        _context3.t0 = _context3["catch"](0);
                        console.log('getProductsOtherPagesTiny', getProductsOtherPagesTiny);
                        reject(_context3.t0);

                      case 46:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3, null, [[0, 42]]);
              }));

              return function (_x4, _x5) {
                return _ref4.apply(this, arguments);
              };
            }()));

          case 1:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function getProductsOtherPagesTiny(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var getEstoqueTiny = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(produto_id) {
    var responseEstoque, cont;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            _context5.next = 3;
            return axios.post(urlEstoque, qs.stringify(_objectSpread(_objectSpread({}, initialDataBodyEstoque), {}, {
              id: produto_id
            })));

          case 3:
            responseEstoque = _context5.sent.data.retorno;
            cont = 0;

          case 5:
            if (!(cont < responseEstoque.produto.depositos.length)) {
              _context5.next = 12;
              break;
            }

            _context5.next = 8;
            return productsModel.findOneAndUpdate({
              id: produto_id
            }, {
              saldo: responseEstoque.produto.saldo,
              saldo_reservado: responseEstoque.produto.saldoReservado,
              depositos: responseEstoque.produto.depositos[cont].deposito
            });

          case 8:
            console.log("estoque atualizado");

          case 9:
            cont++;
            _context5.next = 5;
            break;

          case 12:
            _context5.next = 14;
            return timer(1250);

          case 14:
            _context5.next = 19;
            break;

          case 16:
            _context5.prev = 16;
            _context5.t0 = _context5["catch"](0);
            console.log('err get estoque', _context5.t0);

          case 19:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 16]]);
  }));

  return function getEstoqueTiny(_x6) {
    return _ref5.apply(this, arguments);
  };
}();

var getProductsTiny = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
    var numero_paginas, teste;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            console.log('iniciou first page');
            _context6.next = 4;
            return getProductsFirstPageTiny();

          case 4:
            numero_paginas = _context6.sent;
            console.log("numero_paginas", numero_paginas);
            console.log('terminou first page');
            _context6.next = 9;
            return getProductsOtherPagesTiny(numero_paginas);

          case 9:
            teste = _context6.sent;
            console.log("teste", teste);
            console.log('terminou other pages');
            _context6.next = 17;
            break;

          case 14:
            _context6.prev = 14;
            _context6.t0 = _context6["catch"](0);
            console.log("err", _context6.t0);

          case 17:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[0, 14]]);
  }));

  return function getProductsTiny() {
    return _ref6.apply(this, arguments);
  };
}();

var deleteAllProducts = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            try {
              productsModel.deleteMany({}).then(function () {
                console.log("Data deleted");
              })["catch"](function (error) {
                console.log(error);
              });
            } catch (error) {
              console.log("error delete all products", error);
            }

          case 1:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function deleteAllProducts() {
    return _ref7.apply(this, arguments);
  };
}();

var getEstoqueMinimo = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
    var result, planilha, cont, item;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            result = excelToJson({
              source: fs.readFileSync(path.resolve('./src/templates/estoque_minimo.xlsx')) // fs.readFileSync return a Buffer

            });
            planilha = result.Planilha1;
            console.log("🚀 ~ file: productsController.js ~ line 208 ~ getEstoqueMinimo ~ planilha", planilha);
            cont = 1;

          case 5:
            if (!(cont < planilha.length)) {
              _context8.next = 13;
              break;
            }

            item = planilha[cont];
            _context8.next = 9;
            return estoqueMinimoModel.create({
              codigo: item.A,
              quantidade: item.B || 0
            });

          case 9:
            console.log('item:', {
              codigo: item.A,
              quantidade: item.B
            });

          case 10:
            cont++;
            _context8.next = 5;
            break;

          case 13:
            _context8.next = 18;
            break;

          case 15:
            _context8.prev = 15;
            _context8.t0 = _context8["catch"](0);
            console.log('error', _context8.t0);

          case 18:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 15]]);
  }));

  return function getEstoqueMinimo() {
    return _ref8.apply(this, arguments);
  };
}();

var handleCreateXlsx = function handleCreateXlsx(data) {
  return new Promise( /*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(resolve, reject) {
      var newObj, xlsx;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              try {
                newObj = [];
                data.map(function (item, index) {
                  newObj[index] = {
                    codigo: item.codigo,
                    produto: item.nome,
                    estoque_fisico: item.saldo ? item.saldo : '',
                    estoque_reservado: item.saldo_reservado ? item.saldo_reservado : '',
                    unidade: item.unidade,
                    estoque_minimo: item.estoque_minimo || '',
                    localizacao: item.localizacao
                  };
                });
                xlsx = json2xls(newObj);
                fs.writeFileSync(xlsxDirectory, xlsx, 'binary');
                resolve(xlsx);
              } catch (error) {
                reject(error);
              }

            case 1:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9);
    }));

    return function (_x7, _x8) {
      return _ref9.apply(this, arguments);
    };
  }());
};

var handleSendPlanilha = /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
    var data, xlsxBuffer;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            _context10.next = 3;
            return productsModel.find();

          case 3:
            data = _context10.sent;
            _context10.next = 6;
            return handleCreateXlsx(data);

          case 6:
            xlsxBuffer = fs.readFileSync(xlsxDirectory);
            mail.sendMail({
              to: ['gustavofraga@teste.com.br'],
              from: 'gustavofraga@teste.com.br',
              subject: "Planilha Tiny",
              template: 'planilha',
              attachments: [{
                filename: "planilha-tiny-".concat(moment().format('DD-MM-YYYY'), ".xlsx"),
                content: xlsxBuffer
              }]
            });
            _context10.next = 13;
            break;

          case 10:
            _context10.prev = 10;
            _context10.t0 = _context10["catch"](0);
            console.log('error', _context10.t0);

          case 13:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[0, 10]]);
  }));

  return function handleSendPlanilha() {
    return _ref10.apply(this, arguments);
  };
}();

module.exports = {
  getProductsTiny: getProductsTiny,
  getProductsFirstPageTiny: getProductsFirstPageTiny,
  deleteAllProducts: deleteAllProducts,
  handleSendPlanilha: handleSendPlanilha,
  getEstoqueMinimo: getEstoqueMinimo
};