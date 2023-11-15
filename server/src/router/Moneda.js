const express = require('express');
const router = express.Router();
const moneda = require('../services/Moneda');

router.get('/list', async function (req, res) {
    return await moneda.list(req, res);
});

router.post('/add', async function (req, res) {
    return await moneda.add(req, res);
});

router.post('/update', async function (req, res) {
   return await moneda.update(req, res);
});

router.get('/id', async function (req, res) {
    return await moneda.id(req, res);
});

router.delete('/', async function (req, res) {
   return await moneda.delete(req, res);
});

router.get('/listcombo', async function (req, res) {
   return await moneda.listcombo(req, res);
});

module.exports = router;