import axios from "axios";
import Resolve from "../../model/class/resolve";

const instancePrincipal = axios.create({
  baseURL: process.env.REACT_APP_END_POINT,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

instancePrincipal.interceptors.request.use((config) => {
  const data = JSON.parse(window.localStorage.getItem("login"));
  if (data !== null) {
    config.headers.Authorization = "Bearer " + data.token;
  }
  return config;
});

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse
 */
export async function loginApi(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/login/createsession", {
      params: params,
      signal: signal,
    })
  );
}

/**
 * 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse
 */
export async function listarComboCliente(signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/cliente/listcombo", {
      signal: signal,
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse
 */
export async function liberarTerreno(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.post("/api/producto/liberar", params, {
      signal: signal,
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse
 */
export async function getProductId(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/producto/productbyid", {
      signal: signal,
      params: params,
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse
 */
export async function productoDetalle(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/producto/detalle", {
      signal: signal,
      params: params,
    })
  );
}

/**
 * @method POST
 * @param {{}} params
 * @returns SuccessReponse | ErrorResponse
 */
export async function productoSocio(params) {
  return await Resolve.create(
    instancePrincipal.post("/api/producto/socio", params)
  );
}

/**
 * @method POST
 * @param {{}} params
 * @returns SuccessReponse | Object
 */
export async function productoRestablecer(params) {
  return await Resolve.create(
    instancePrincipal.post("/api/producto/restablecer", params)
  );
}

/**
 * @method GET
 * @param {{}} SuccessReponse
 * @returns SuccesReponse | Object
 */
export async function empresaConfig() {
  return await Resolve.create(
    instancePrincipal.get("/api/empresa/config")
  );
}

/**
 * @method GET
 * @param {{}} SuccessReponse
 * @returns SuccesReponse | Object
 */
export async function validToken() {
  return await Resolve.create(
    instancePrincipal.get("/api/login/validtoken")
  );
}

/**
 * 
 * @param {*} data 
 * @param {*} signal 
 * @returns 
 */
export async function addBanco(data, signal = null) {
  return await Resolve.create(
    instancePrincipal.post("/api/banco/", data, {
      signal: signal
    }
    )
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns 
 */
export async function getBancoId(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/banco/id", {
      signal: signal,
      params: params,
    })
  );
}

/**
 * 
 * @param {*} data 
 * @param {*} signal 
 * @returns 
 */
export async function updateBanco(data, signal = null) {
  return await Resolve.create(
    instancePrincipal.put("/api/banco/", data, {
      signal: signal
    }
    )
  );
}

/**
 * 
 * @param {*} params 
 * @returns 
 */
export async function deleteBanco(params) {
  return await Resolve.create(
    instancePrincipal.delete("/api/banco/", {
      params: params
    })
  );
}


/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse
 */
export async function listarBancos(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/banco/list", {
      signal: signal,
      params: params,
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function listarCategoria(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/categoria/list", {
      signal: signal,
      params: params,
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse
 */
export async function trasladarCategoria(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/categoria/traslado", {
      signal: signal,
      params: params,
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns 
 */
export async function listComboCategoria(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/categoria/listcombo', {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function comboSucursales(signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/sucursal/combo", {
      signal: signal,
    })
  );
}

/**
 * 
 * @param {*} idSucursal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function borrarSucursal(idSucursal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/sucursal', {
      params: {
        "idSucursal": idSucursal
      }
    })
  );
}

/**
 * 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function loadEmpresa(signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/empresa/load")
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function getIdCategoria(params, signal = null) {
  return await Resolve.create(
    instancePrincipal.get("/api/categoria/id", {
      signal: signal,
      params: params,
    })
  );
}

/**
 * 
 * @param {*} data 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function addCategoria(data) {
  return await Resolve.create(
    await instancePrincipal.post("/api/categoria/", data)
  );
}

/**
 * 
 * @param {*} data 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function updateCategoria(data) {
  return await Resolve.create(
    await instancePrincipal.put("/api/categoria", data)
  );
}

/**
 * 
 * @param {*} params 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function removeCategoria(params) {
  return await Resolve.create(
    instancePrincipal.delete("/api/categoria", {
      params: params,
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function listCpeSunat(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/factura/cpesunat', {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function sendEmailBoleta(params) {
  return await Resolve.create(
    instancePrincipal.get("/api/cobro/email", {
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function sendEmailNotaCredito(params) {
  return await Resolve.create(
    instancePrincipal.get("/api/notacredito/email", {
      params: params
    })
  );
}

/**
 * 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function getNotifications(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/cobro/notificaciones", {
      signal: signal
    })
  );
}

/**
 * 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function comboProductos() {
  return await Resolve.create(
    instancePrincipal.get("/api/producto/listcombo")
  );
}

/**
 * 
 * @param {*} params 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function listarProductosFilter(params) {
  return await Resolve.create(
    instancePrincipal.get("/api/producto/listfilter", {
      params: params,
    })
  );
}

/**
 * 
 * @param {*} params 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function listarClientesFilter(params) {
  return await Resolve.create(
    instancePrincipal.get("/api/cliente/listfiltrar", {
      params: params,
    })
  );
}

/**
 * 
 * @param {*} data 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function createFactura(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/factura/add', data),
  );
}

/**
 * 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function listMonedaCombo(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/moneda/listcombo", {
      signal: signal
    })
  );
}

/**
 * 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function listImpuestCombo(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/impuesto/listcombo", {
      signal: signal,
    })
  );
}

/**
 * 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function listBancoCombo(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/banco/listcombo", {
      signal: signal,
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function listComprobanteCombo(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/comprobante/listcombo", {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function getFacturaId(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/factura/id", {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function getCobroVentaId(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/factura/venta/cobro", {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function listConceptos(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/concepto/list', {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function getCobroId(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/cobro/id', {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function listClientes(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/cliente/list', {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function addCliente(params, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/cliente/add', params)
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function editCliente(params, signal) {
  return await Resolve.create(
    instancePrincipal.post('/api/cliente/update', params)
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns SuccessReponse | ErrorResponse 
 */
export async function deleteCliente(params, signal) {
  return await Resolve.create(
    instancePrincipal.delete('/api/cliente', {
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns 
 */
export async function getUbigeo(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/ubigeo/", {
      params: params,
    })
  );
}

/**
 * 
 * @param {*} signal 
 * @returns 
 */
export async function listComboTipoDocumento(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/tipodocumento/listcombo", {
      signal: signal,
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns 
 */
export async function getClienteId(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/cliente/id", {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} signal 
 * @returns 
 */
export async function getPredeterminado(signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/cliente/getpredeterminado", {
      signal: signal,
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns 
 */
export async function listImpuesto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/impuesto/list', {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns 
 */
export async function getImpuestoId(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/impuesto/id", {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
export async function addImpuesto(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/impuesto/add', data)
  );
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
export async function editImpuesto(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/impuesto/edit', data)
  );
}

/**
 * 
 * @param {*} params 
 * @returns 
 */
export async function deleteImpuesto(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/impuesto', {
      params: params
    })
  );
}

/**
 * 
 * @param {} params 
 * @returns 
 */
export async function listProducto(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/producto/list', {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
export async function addProducto(data) {
  return await Resolve.create(
    axios.post("/api/producto", data)
  );
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
export async function updateProducto(data) {
  return await Resolve.create(
    axios.put("/api/producto", data)
  );
}

/**
 * 
 * @param {*} params 
 * @returns 
 */
export async function deleteProducto(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/producto', {
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns 
 */
export async function listAlmacen(params, signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/almacen/list', {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns 
 */
export async function getAlmacenId(params, signal) {
  return await Resolve.create(
    instancePrincipal.get("/api/almacen/id", {
      signal: signal,
      params: params
    })
  );
}

/**
 * 
 * @param {*} params 
 * @returns 
 */
export async function deleteAlmacen(params) {
  return await Resolve.create(
    instancePrincipal.delete('/api/almacen/delete', {
      data: params
    })
  );
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
export async function addAlmacen(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/almacen/add', data)
  );
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
export async function updateAlmacen(data) {
  return await Resolve.create(
    instancePrincipal.post('/api/almacen/update', data)
  );
}

/**
 * 
 * @param {*} signal 
 * @returns 
 */
export async function comboAlmacen(signal = null) {
  return await Resolve.create(
    instancePrincipal.get('/api/almacen/combo', {
      signal: signal,
    })
  );
}

/**
 * 
 * @param {*} signal 
 * @returns 
 */
export async function comboMedida(signal) {
  return await Resolve.create(
    instancePrincipal.get('/api/medida/listcombo', {
      signal: signal,
    })
  );
}