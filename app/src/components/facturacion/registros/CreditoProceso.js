import React from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import {
    numberFormat,
    makeid,
    keyNumberFloat,
    isNumeric,
    formatMoney,
    spinnerLoading,
    showModal,
    hideModal,
    viewModal,
    clearModal,
    ModalAlertInfo,
    ModalAlertSuccess,
    ModalAlertWarning,
    ModalAlertDialog
} from '../../tools/Tools';
import { connect } from 'react-redux';

class CreditoProceso extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inicial: '',
            venta: {},
            detalle: [],
            plazos: [],
            bancos: [],
            comprobantes: [],

            impuestos: [],
            medidas: [],

            idImpuestoPlazo: '',
            idMedidaPlazo: '',
            expandedOpcionesPlazo: true,
            idBancoPlazo: '',
            idComprobantePlazo: '',
            metodoPagoPlazo: '',
            observacionPlazo: '',
            plazosSumados: 0,

            idImpuestoCuota: '',
            idMedidaCuota: '',
            expandedOpcionesCuota: true,
            idBancoCuota: '',
            idComprobanteCuota: '',
            metodoPagoCuota: '',
            observacionCuota: '',
            montoCuota: '',

            idImpuestoAdelanto: '',
            idMedidaAdelanto: '',
            expandedOpcionesAdelanto: true,
            idBancoAdelanto: '',
            idComprobanteAdelanto: '',
            metodoPagoAdelanto: '',
            observacionAdelanto: '',
            montoAdelanto: '',
            idPlazo: '',

            idUsuario: this.props.token.userToken.idUsuario,
            idProyecto: this.props.token.project.idProyecto,

            loading: true,
            messageWarning: '',
            msgLoading: 'Cargando datos...',
        }

        this.refImpuestoPlazo = React.createRef();
        this.refMedidaPlazo = React.createRef();
        this.refCollpsePlazo = React.createRef();
        this.refCollpseContentPlazo = React.createRef();
        this.refComprobantePlazo = React.createRef();
        this.refBancoPlazo = React.createRef();
        this.refMetodoPagoPlazo = React.createRef();

        this.refImpuestoCuota = React.createRef();
        this.refMedidaCuota = React.createRef();
        this.refCollpseCuota = React.createRef();
        this.refCollpseContentCuota = React.createRef();
        this.refComprobanteCuota = React.createRef();
        this.refBancoCuota = React.createRef();
        this.refMetodoPagoCuota = React.createRef();
        this.refMontoCuota = React.createRef();

        this.refImpuestoAdelanto = React.createRef();
        this.refMedidaAdelanto = React.createRef();
        this.refCollpseAdelanto = React.createRef();
        this.refCollpseContentAdelanto = React.createRef();
        this.refComprobanteAdelanto = React.createRef();
        this.refBancoAdelanto = React.createRef();
        this.refMetodoPagoAdelanto = React.createRef();
        this.refMontoAdelanto = React.createRef();

        this.abortControllerTable = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        this.loadInit();

        viewModal("modalPlazo", async () => {
            this.refBancoPlazo.current.focus();
        });

        clearModal("modalPlazo", async () => {
            const impuestoFilter = this.state.impuestos.filter(item => item.preferida === 1);

            const medidaFilter = this.state.medidas.filter(item => item.preferida === 1);

            if (this.refCollpseContentPlazo.current.classList.contains("show")) {
                this.refCollpsePlazo.current.classList.add("collapsed");
                this.refCollpseContentPlazo.current.classList.remove("show");
                this.refCollpsePlazo.current.attributes["aria-expanded"].value = false;
            }

            await this.setStateAsync({
                idBancoPlazo: '',
                idComprobantePlazo: '',
                metodoPagoPlazo: '',
                observacionPlazo: '',
                plazosSumados: 0,
                idMedidaPlazo: medidaFilter.length > 0 ? medidaFilter[0].idMedida : '',
                idImpuestoPlazo: impuestoFilter.length > 0 ? impuestoFilter[0].idImpuesto : '',
                expandedOpcionesPlazo: true,
            });
        });

        viewModal("modalCuota", async () => {
            this.refBancoCuota.current.focus();
        });

        clearModal("modalCuota", async () => {
            const impuestoFilter = this.state.impuestos.filter(item => item.preferida === 1);

            const medidaFilter = this.state.medidas.filter(item => item.preferida === 1);

            if (this.refCollpseContentCuota.current.classList.contains("show")) {
                this.refCollpseCuota.current.classList.add("collapsed");
                this.refCollpseContentCuota.current.classList.remove("show");
                this.refCollpseCuota.current.attributes["aria-expanded"].value = false;
            }

            await this.setStateAsync({
                idBancoCuota: '',
                idComprobanteCuota: '',
                metodoPagoCuota: '',
                observacionCuota: '',
                montoCuota: '',
                idMedidaCuota: medidaFilter.length > 0 ? medidaFilter[0].idMedida : '',
                idImpuestoCuota: impuestoFilter.length > 0 ? impuestoFilter[0].idImpuesto : '',
                expandedOpcionesCuota: true,
            });
        });

        viewModal("modalAdelanto", async () => {
            this.refBancoAdelanto.current.focus();
        });

        clearModal("modalAdelanto", async () => {
            const impuestoFilter = this.state.impuestos.filter(item => item.preferida === 1);

            const medidaFilter = this.state.medidas.filter(item => item.preferida === 1);

            if (this.refCollpseContentAdelanto.current.classList.contains("show")) {
                this.refCollpseAdelanto.current.classList.add("collapsed");
                this.refCollpseContentAdelanto.current.classList.remove("show");
                this.refCollpseAdelanto.current.attributes["aria-expanded"].value = false;
            }

            await this.setStateAsync({
                idBancoAdelanto: '',
                idComprobanteAdelanto: '',
                metodoPagoAdelanto: '',
                observacionAdelanto: '',
                montoAdelanto: '',
                idPlazo: '',
                idMedidaAdelanto: medidaFilter.length > 0 ? medidaFilter[0].idMedida : '',
                idImpuestoAdelanto: impuestoFilter.length > 0 ? impuestoFilter[0].idImpuesto : '',
                expandedOpcionesAdelanto: true,
            });
        });
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    loadInit() {
        const url = this.props.location.search;
        const idVenta = new URLSearchParams(url).get("idVenta");
        if (idVenta !== null) {
            this.loadDataId(idVenta)
        } else {
            this.props.history.goBack();
        }
    }

    async loadDataId(id) {
        try {
            await this.setStateAsync({
                venta: {},
                detalle: [],
                plazos: [],
                bancos: [],
                comprobantes: [],
                impuestos: [],
                medidas: [],

                idImpuestoPlazo: '',
                idMedidaPlazo: '',
                expandedOpcionesPlazo: true,
                idBancoPlazo: '',
                metodoPagoPlazo: '',
                observacionPlazo: '',
                plazosSumados: 0,

                idImpuestoCuota: '',
                idMedidaCuota: '',
                expandedOpcionesCuota: true,
                idBancoCuota: '',
                idComprobanteCuota: '',
                metodoPagoCuota: '',
                observacionCuota: '',
                montoCuota: '',

                idImpuestoAdelanto: '',
                idMedidaAdelanto: '',
                expandedOpcionesAdelanto: true,
                idBancoAdelanto: '',
                idComprobanteAdelanto: '',
                metodoPagoAdelanto: '',
                observacionAdelanto: '',
                montoAdelanto: '',
                idPlazo: '',

                loading: true,
                messageWarning: '',
                msgLoading: 'Cargando datos...',
            })

            let credito = await axios.get("/api/factura/credito/detalle", {
                signal: this.abortControllerTable.signal,
                params: {
                    "idVenta": id
                }
            });

            const facturado = await axios.get("/api/comprobante/listcombo", {
                signal: this.abortControllerTable.signal,
                params: {
                    "tipo": "1"
                }
            });

            const comprobante = await axios.get("/api/comprobante/listcombo", {
                signal: this.abortControllerTable.signal,
                params: {
                    "tipo": "5"
                }
            });

            const banco = await axios.get("/api/banco/listcombo", {
                signal: this.abortControllerTable.signal,
            });

            let medida = await axios.get('/api/medida/listcombo', {
                signal: this.abortControllerTable.signal,
            });

            const impuesto = await axios.get("/api/impuesto/listcombo", {
                signal: this.abortControllerTable.signal,
            });

            const plazosSelected = credito.data.plazos.map((item) => {
                return {
                    ...item,
                    selected: false
                }
            });

            const comprobanteFilter = [...comprobante.data, ...facturado.data].filter(item => item.preferida === 1);

            const impuestoFilter = impuesto.data.filter(item => item.preferida === 1);

            const medidaFilter = medida.data.filter(item => item.preferida === 1);

            await this.setStateAsync({
                inicial: credito.data.inicial,
                venta: credito.data.venta,
                detalle: credito.data.detalle,
                plazos: plazosSelected,
                bancos: banco.data,
                comprobantes: [...comprobante.data, ...facturado.data],
                medidas: medida.data,
                impuestos: impuesto.data,

                idMedidaPlazo: medidaFilter.length > 0 ? medidaFilter[0].idMedida : '',
                idImpuestoPlazo: impuestoFilter.length > 0 ? impuestoFilter[0].idImpuesto : '',

                idMedidaCuota: medidaFilter.length > 0 ? medidaFilter[0].idMedida : '',
                idImpuestoCuota: impuestoFilter.length > 0 ? impuestoFilter[0].idImpuesto : '',

                idMedidaAdelanto: medidaFilter.length > 0 ? medidaFilter[0].idMedida : '',
                idImpuestoAdelanto: impuestoFilter.length > 0 ? impuestoFilter[0].idImpuesto : '',

                idComprobantePlazo: comprobanteFilter.length === 1 ? comprobanteFilter[0].idComprobante : '',
                idComprobanteCuota: comprobanteFilter.length === 1 ? comprobanteFilter[0].idComprobante : '',
                idComprobanteAdelanto: comprobanteFilter.length === 1 ? comprobanteFilter[0].idComprobante : '',

                loading: false,
            });
        } catch (error) {
            if (error.message !== "canceled") {
                this.props.history.goBack();
            }
        }
    }

    async onEventOpenModal() {
        if (this.state.venta.credito === 1) {

            if (this.state.idComprobanteCuota === "") {
                const comprobanteFilter = this.state.comprobantes.filter(item => item.preferida === 1);
                await this.setStateAsync({ idComprobanteCuota: comprobanteFilter.length === 1 ? comprobanteFilter[0].idComprobante : '' })
            }

            showModal("modalCuota")
        } else {
            let validate = this.state.plazos.reduce((acumulador, item) => item.selected ? acumulador + 1 : acumulador + 0, 0);

            if (validate <= 0) {
                await this.setStateAsync({ messageWarning: "Seleccione algún crédito a cobrar." })
                return;
            }

            if (this.state.idComprobantePlazo === "") {
                const comprobanteFilter = this.state.comprobantes.filter(item => item.preferida === 1);
                await this.setStateAsync({ idComprobantePlazo: comprobanteFilter.length === 1 ? comprobanteFilter[0].idComprobante : '' })
            }

            showModal("modalPlazo")
        }
    }

    async onEventOpenModalCobro(idPlazo) {
        if (this.state.idComprobanteAdelanto === "") {
            const comprobanteFilter = this.state.comprobantes.filter(item => item.preferida === 1);
            await this.setStateAsync({ idComprobanteAdelanto: comprobanteFilter.length === 1 ? comprobanteFilter[0].idComprobante : '' })
        }

        await this.setStateAsync({ idPlazo: idPlazo })

        showModal("modalAdelanto")
    }

    async onEventCobrarCuota() {
        if (this.state.idComprobanteCuota === '') {
            this.refComprobanteCuota.current.focus();
            return;
        }

        if (this.state.idBancoCuota === '') {
            this.refBancoCuota.current.focus();
            return;
        }

        if (this.state.metodoPagoCuota === '') {
            this.refMetodoPagoCuota.current.focus();
            return;
        }

        if (!isNumeric(this.state.montoCuota)) {
            this.refMontoCuota.current.focus();
            return;
        }

        if (this.state.idImpuestoCuota === "") {
            if (!this.refCollpseContentCuota.current.classList.contains("show")) {
                this.refCollpseCuota.current.classList.remove("collapsed");
                this.refCollpseContentCuota.current.classList.add("show");
                this.refCollpseCuota.current.attributes["aria-expanded"].value = true;
                await this.setStateAsync({
                    expandedOpcionesCuota: !(this.refCollpseCuota.current.attributes["aria-expanded"].value.toLowerCase() === 'true')
                });
            }

            this.refImpuestoCuota.current.focus();
            return;
        }

        if (this.state.idMedidaCuota === "") {
            if (!this.refCollpseContentCuota.current.classList.contains("show")) {
                this.refCollpseCuota.current.classList.remove("collapsed");
                this.refCollpseContentCuota.current.classList.add("show");
                this.refCollpseCuota.current.attributes["aria-expanded"].value = true;
                await this.setStateAsync({
                    expandedOpcionesCuota: !(this.refCollpseCuota.current.attributes["aria-expanded"].value.toLowerCase() === 'true')
                });
            }

            this.refMedidaCuota.current.focus();
            return;
        }

        ModalAlertDialog("Cobro", "¿Estás seguro de continuar?", async (event) => {
            if (event) {
                try {
                    ModalAlertInfo("Cobro", "Procesando información...")
                    hideModal("modalCuota");

                    let result = await axios.post("/api/cobro/cuota", {
                        "idComprobante": this.state.idComprobanteCuota,
                        "idCliente": this.state.venta.idCliente,
                        "idUsuario": this.state.idUsuario,
                        'idMoneda': this.state.venta.idMoneda,
                        "idBanco": this.state.idBancoCuota,
                        "idVenta": this.state.venta.idVenta,
                        "idProyecto": this.state.idProyecto,
                        "metodoPago": this.state.metodoPagoCuota,
                        "estado": 1,
                        "observacion": this.state.observacionCuota.trim().toUpperCase(),
                        "montoCuota": this.state.montoCuota,
                        "idImpuesto": this.state.idImpuestoCuota,
                        "idMedida": this.state.idMedidaCuota
                    })

                    ModalAlertSuccess("Cobro", result.data, () => {
                        this.loadInit();
                    });
                } catch (error) {
                    ModalAlertWarning("Cobro", "Se produjo un error un interno, intente nuevamente.");
                }
            }
        });
    }

    async onEventCobrarPlazo() {
        if (this.state.idComprobantePlazo === '') {
            this.refComprobantePlazo.current.focus();
            return;
        }

        if (this.state.idBancoPlazo === "") {
            this.refBancoPlazo.current.focus();
            return;
        }

        if (this.state.metodoPagoPlazo === "") {
            this.refMetodoPagoPlazo.current.focus();
            return;
        }

        if (this.state.idImpuestoPlazo === "") {
            if (!this.refCollpseContentPlazo.current.classList.contains("show")) {
                this.refCollpsePlazo.current.classList.remove("collapsed");
                this.refCollpseContentPlazo.current.classList.add("show");
                this.refCollpsePlazo.current.attributes["aria-expanded"].value = true;
                await this.setStateAsync({
                    expandedOpcionesPlazo: !(this.refCollpsePlazo.current.attributes["aria-expanded"].value.toLowerCase() === 'true')
                });
            }

            this.refImpuestoPlazo.current.focus();
            return;
        }

        if (this.state.idMedidaPlazo === "") {
            if (!this.refCollpseContentPlazo.current.classList.contains("show")) {
                this.refCollpsePlazo.current.classList.remove("collapsed");
                this.refCollpseContentPlazo.current.classList.add("show");
                this.refCollpsePlazo.current.attributes["aria-expanded"].value = true;
                await this.setStateAsync({
                    expandedOpcionesPlazo: !(this.refCollpsePlazo.current.attributes["aria-expanded"].value.toLowerCase() === 'true')
                });
            }

            this.refMedidaPlazo.current.focus();
            return;
        }


        ModalAlertDialog("Cobro", "¿Estás seguro de continuar?", async (event) => {
            if (event) {
                try {
                    ModalAlertInfo("Cobro", "Procesando información...")
                    hideModal("modalPlazo");
                    let result = await axios.post("/api/cobro/plazo", {
                        "idComprobante": this.state.idComprobantePlazo,
                        "idCliente": this.state.venta.idCliente,
                        "idUsuario": this.state.idUsuario,
                        'idMoneda': this.state.venta.idMoneda,
                        "idBanco": this.state.idBancoPlazo,
                        "idVenta": this.state.venta.idVenta,
                        "idProyecto": this.state.idProyecto,
                        "metodoPago": this.state.metodoPagoPlazo,
                        "estado": 1,
                        "observacion": this.state.observacionPlazo.trim().toUpperCase(),
                        "plazosSumados": this.state.plazosSumados,
                        "plazos": this.state.plazos,
                        "idImpuesto": this.state.idImpuestoPlazo,
                        "idMedida": this.state.idMedidaPlazo
                    })

                    ModalAlertSuccess("Cobro", result.data, () => {
                        this.loadInit();
                    });
                } catch (error) {
                    ModalAlertWarning("Cobro", "Se produjo un error un interno, intente nuevamente.")
                }
            }
        });
    }

    async onEventCobrarAdelanto() {
        if (this.state.idComprobanteAdelanto === '') {
            this.refComprobanteAdelanto.current.focus();
            return;
        }

        if (this.state.idBancoAdelanto === '') {
            this.refBancoAdelanto.current.focus();
            return;
        }

        if (this.state.metodoPagoAdelanto === '') {
            this.refMetodoPagoAdelanto.current.focus();
            return;
        }

        if (!isNumeric(this.state.montoAdelanto)) {
            this.refMontoAdelanto.current.focus();
            return;
        }

        if (this.state.idImpuestoAdelanto === "") {
            if (!this.refCollpseContentAdelanto.current.classList.contains("show")) {
                this.refCollpseAdelanto.current.classList.remove("collapsed");
                this.refCollpseContentAdelanto.current.classList.add("show");
                this.refCollpseAdelanto.current.attributes["aria-expanded"].value = true;
                await this.setStateAsync({
                    expandedOpcionesAdelanto: !(this.refCollpseAdelanto.current.attributes["aria-expanded"].value.toLowerCase() === 'true')
                });
            }

            this.refImpuestoAdelanto.current.focus();
            return;
        }

        if (this.state.idMedidaAdelanto === "") {
            if (!this.refCollpseContentAdelanto.current.classList.contains("show")) {
                this.refCollpseAdelanto.current.classList.remove("collapsed");
                this.refCollpseContentAdelanto.current.classList.add("show");
                this.refCollpseAdelanto.current.attributes["aria-expanded"].value = true;
                await this.setStateAsync({
                    expandedOpcionesAdelanto: !(this.refCollpseAdelanto.current.attributes["aria-expanded"].value.toLowerCase() === 'true')
                });
            }

            this.refMedidaAdelanto.current.focus();
            return;
        }


        ModalAlertDialog("Cobro", "¿Estás seguro de continuar?", async (event) => {
            if (event) {

                try {
                    ModalAlertInfo("Cobro", "Procesando información...")
                    hideModal("modalAdelanto");

                    let result = await axios.post("/api/cobro/adelanto", {
                        "idComprobante": this.state.idComprobanteAdelanto,
                        "idCliente": this.state.venta.idCliente,
                        "idUsuario": this.state.idUsuario,
                        'idMoneda': this.state.venta.idMoneda,
                        "idBanco": this.state.idBancoAdelanto,
                        "idVenta": this.state.venta.idVenta,
                        "idProyecto": this.state.idProyecto,
                        "metodoPago": this.state.metodoPagoAdelanto,
                        "estado": 1,
                        "observacion": this.state.observacionAdelanto.trim().toUpperCase(),
                        "montoCuota": this.state.montoAdelanto,
                        "idPlazo": this.state.idPlazo,
                        "idImpuesto": this.state.idImpuestoAdelanto,
                        "idMedida": this.state.idMedidaAdelanto
                    })

                    ModalAlertSuccess("Cobro", result.data, () => {
                        this.loadInit();
                    });
                } catch (error) {
                    ModalAlertWarning("Cobro", "Se produjo un error un interno, intente nuevamente.");

                }
            }
        });
    }

    handleCheck = async (event) => {
        let updatedList = [...this.state.plazos];
        let ipos = 0;
        let object = {};
        for (let item of updatedList) {
            if (item.idPlazo === parseInt(event.target.value)) {
                item.selected = event.target.checked;
                object = item;
                break;
            }
            ipos++;
        }

        for (let i = 0; i < updatedList.length; i++) {
            if (parseInt(updatedList[i].estado) === 0) {
                updatedList[i].selected = false;
            }
        }

        for (let i = 0; i < updatedList.length; i++) {
            if (parseInt(updatedList[i].estado) === 0) {
                updatedList[i].selected = true;

                if (ipos === i) {
                    break;
                }

                if (parseInt(object.idPlazo) === parseInt(updatedList[i].idPlazo)) {
                    updatedList[i].selected = event.target.checked;
                    break;
                }
            }
        }

        let suma = updatedList.reduce((acumulador, item) => item.selected && parseInt(item.estado) === 0 ? acumulador + item.monto : acumulador + 0, 0);

        await this.setStateAsync({
            plazos: updatedList,
            plazosSumados: suma,
            messageWarning: ''
        })
    }

    async onEventImprimir() {
        const data = {
            "idSede": "SD0001",
            "idVenta": this.state.venta.idVenta,
            "proyecto": this.props.token.project.nombre,
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
        let params = new URLSearchParams({ "params": ciphertext });
        window.open("/api/factura/repcreditolote?" + params, "_blank");
    }

    async onEventImprimirLetra(idPlazo) {
        const data = {
            "idSede": "SD0001",
            "idVenta": this.state.venta.idVenta,
            "idPlazo": idPlazo,
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'key-report-inmobiliaria').toString();
        let params = new URLSearchParams({ "params": ciphertext });
        window.open("/api/cobro/repletramatricial?" + params, "_blank");
    }

    render() {
        const {
            documento,
            informacion,
            telefono,
            celular,
            email,
            direccion,
            nombre,
            serie,
            numeracion,
            numCuota,
            codiso,
            credito,
            total,
            cobrado
        } = this.state.venta;

        return (
            <>
                {/* Inicio modal */}
                <div className="modal fade" id="modalPlazo" data-backdrop="static">
                    <div className="modal-dialog modal-md">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h6 className="modal-title">Registrar cobro</h6>
                                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <div className="input-group-text"><i className="bi bi-receipt"></i></div>
                                            </div>
                                            <select
                                                title="Comprobantes de venta"
                                                className="form-control"
                                                ref={this.refComprobantePlazo}
                                                value={this.state.idComprobantePlazo}
                                                onChange={(event) => this.setState({ idComprobantePlazo: event.target.value })}>
                                                <option value="">-- Comprobantes --</option>
                                                {
                                                    this.state.comprobantes.map((item, index) => (
                                                        <option key={index} value={item.idComprobante}>{item.nombre + " (" + item.serie + ")"}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <a
                                            onClick={async () => await this.setStateAsync({
                                                expandedOpcionesPlazo: !(this.refCollpsePlazo.current.attributes["aria-expanded"].value.toLowerCase() === 'true')
                                            })}
                                            ref={this.refCollpsePlazo}
                                            className="icon-link collapsed"
                                            data-bs-toggle="collapse"
                                            href="#collapseOpcionesPlazo"
                                            role="button"
                                            aria-expanded="false"
                                            aria-controls="collapseOpcionesPlazo">
                                            Opciones {this.state.expandedOpcionesPlazo ? <i className="fa fa-plus-square"></i> : <i className="fa fa-minus-square"></i>}
                                        </a>
                                    </div>
                                </div>

                                <div ref={this.refCollpseContentPlazo} className="collapse" id="collapseOpcionesPlazo">
                                    <div className="form-row">
                                        <div className="form-group col-md-6">
                                            <select
                                                title="Lista de lotes"
                                                className="form-control"
                                                value={this.state.idImpuestoPlazo}
                                                ref={this.refImpuestoPlazo}
                                                onChange={(event) => this.setState({ idImpuestoPlazo: event.target.value })}
                                            >
                                                <option value="">-- Impuesto --</option>
                                                {
                                                    this.state.impuestos.map((item, index) => (
                                                        <option key={index} value={item.idImpuesto}>{item.nombre}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        <div className="form-group col-md-6">
                                            <select
                                                title="Lista de lotes"
                                                className="form-control"
                                                value={this.state.idMedidaPlazo}
                                                ref={this.refMedidaPlazo}
                                                onChange={(event) => this.setState({ idMedidaPlazo: event.target.value })}
                                            >
                                                <option value="">-- Unidad --</option>
                                                {
                                                    this.state.medidas.map((item, index) => (
                                                        <option key={index} value={item.idMedida}>{item.nombre}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>Cuenta bancaria <i className="fa fa-asterisk text-danger small"></i></label>
                                        <div className="input-group">
                                            <select
                                                className="form-control"
                                                ref={this.refBancoPlazo}
                                                value={this.state.idBancoPlazo}
                                                onChange={(event) =>
                                                    this.setState({
                                                        idBancoPlazo: event.target.value
                                                    })
                                                }>
                                                <option value="">- Seleccione -</option>
                                                {
                                                    this.state.bancos.map((item, index) => (
                                                        <option key={index} value={item.idBanco}>{item.nombre}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group col-md-6">
                                        <label>Metodo de pago <i className="fa fa-asterisk text-danger small"></i></label>
                                        <select
                                            className="form-control"
                                            ref={this.refMetodoPagoPlazo}
                                            value={this.state.metodoPagoPlazo}
                                            onChange={(event) =>
                                                this.setState({
                                                    metodoPagoPlazo: event.target.value,
                                                })}>
                                            <option value="">- Seleccione -</option>
                                            <option value="1">Efectivo</option>
                                            <option value="2">Consignación</option>
                                            <option value="3">Transferencia</option>
                                            <option value="4">Cheque</option>
                                            <option value="5">Tarjeta crédito</option>
                                            <option value="6">Tarjeta débito</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <label>Observación</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ingrese alguna observación..."
                                            value={this.state.observacionPlazo}
                                            onChange={(event) =>
                                                this.setState({ observacionPlazo: event.target.value })
                                            } />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-3">
                                        <label>Valor a cobrar:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="0.00"
                                            value={formatMoney(this.state.plazosSumados)}
                                            disabled />
                                    </div>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.onEventCobrarPlazo()}>Guardar</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal */}

                {/* Inicio modal */}
                <div className="modal fade" id="modalCuota" data-backdrop="static">
                    <div className="modal-dialog modal-md">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h6 className="modal-title">Registrar cobro</h6>
                                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <div className="input-group-text"><i className="bi bi-receipt"></i></div>
                                            </div>
                                            <select
                                                title="Comprobantes de venta"
                                                className="form-control"
                                                ref={this.refComprobanteCuota}
                                                value={this.state.idComprobanteCuota}
                                                onChange={(event) => {
                                                    this.setState({ idComprobanteCuota: event.target.value })
                                                }}>
                                                <option value="">-- Comprobantes --</option>
                                                {
                                                    this.state.comprobantes.map((item, index) => (
                                                        <option key={index} value={item.idComprobante}>{item.nombre}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <a
                                            onClick={async () => await this.setStateAsync({
                                                expandedOpcionesCuota: !(this.refCollpseCuota.current.attributes["aria-expanded"].value.toLowerCase() === 'true')
                                            })}
                                            ref={this.refCollpseCuota}
                                            className="icon-link collapsed"
                                            data-bs-toggle="collapse"
                                            href="#collapseOpcionesCuota"
                                            role="button"
                                            aria-expanded="false"
                                            aria-controls="collapseOpcionesCuota">
                                            Opciones {this.state.expandedOpcionesCuota ? <i className="fa fa-plus-square"></i> : <i className="fa fa-minus-square"></i>}
                                        </a>
                                    </div>
                                </div>

                                <div ref={this.refCollpseContentCuota} className="collapse" id="collapseOpcionesCuota">
                                    <div className="form-row">
                                        <div className="form-group col-md-6">
                                            <select
                                                title="Lista de lotes"
                                                className="form-control"
                                                value={this.state.idImpuestoCuota}
                                                ref={this.refImpuestoCuota}
                                                onChange={(event) => this.setState({ idImpuestoCuota: event.target.value })}
                                            >
                                                <option value="">-- Impuesto --</option>
                                                {
                                                    this.state.impuestos.map((item, index) => (
                                                        <option key={index} value={item.idImpuesto}>{item.nombre}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        <div className="form-group col-md-6">
                                            <select
                                                title="Lista de lotes"
                                                className="form-control"
                                                value={this.state.idMedidaCuota}
                                                ref={this.refMedidaCuota}
                                                onChange={(event) => this.setState({ idMedidaCuota: event.target.value })}
                                            >
                                                <option value="">-- Unidad --</option>
                                                {
                                                    this.state.medidas.map((item, index) => (
                                                        <option key={index} value={item.idMedida}>{item.nombre}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>Cuenta bancaria <i className="fa fa-asterisk text-danger small"></i></label>
                                        <div className="input-group">
                                            <select
                                                className="form-control"
                                                ref={this.refBancoCuota}
                                                value={this.state.idBancoCuota}
                                                onChange={(event) =>
                                                    this.setState({
                                                        idBancoCuota: event.target.value
                                                    })
                                                }>
                                                <option value="">- Seleccione -</option>
                                                {
                                                    this.state.bancos.map((item, index) => (
                                                        <option key={index} value={item.idBanco}>{item.nombre}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group col-md-6">
                                        <label>Metodo de pago <i className="fa fa-asterisk text-danger small"></i></label>
                                        <select
                                            className="form-control"
                                            ref={this.refMetodoPagoCuota}
                                            value={this.state.metodoPagoCuota}
                                            onChange={(event) =>
                                                this.setState({
                                                    metodoPagoCuota: event.target.value,
                                                })}>
                                            <option value="">- Seleccione -</option>
                                            <option value="1">Efectivo</option>
                                            <option value="2">Consignación</option>
                                            <option value="3">Transferencia</option>
                                            <option value="4">Cheque</option>
                                            <option value="5">Tarjeta crédito</option>
                                            <option value="6">Tarjeta débito</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <label>Observación</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ingrese alguna observación..."
                                            value={this.state.observacionCuota}
                                            onChange={(event) =>
                                                this.setState({ observacionCuota: event.target.value })
                                            } />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-3">
                                        <label>Valor a cobrar:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="0.00"
                                            ref={this.refMontoCuota}
                                            value={this.state.montoCuota}
                                            onChange={(event) =>
                                                this.setState({ montoCuota: event.target.value })
                                            }
                                            onKeyPress={keyNumberFloat}
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.onEventCobrarCuota()}>Guardar</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal */}

                {/* Inicio modal */}
                <div className="modal fade" id="modalAdelanto" data-backdrop="static">
                    <div className="modal-dialog modal-md">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h6 className="modal-title">Registrar adelanto</h6>
                                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <div className="input-group-text"><i className="bi bi-receipt"></i></div>
                                            </div>
                                            <select
                                                title="Comprobantes de venta"
                                                className="form-control"
                                                ref={this.refComprobanteAdelanto}
                                                value={this.state.idComprobanteAdelanto}
                                                onChange={(event) => {
                                                    this.setState({ idComprobanteAdelanto: event.target.value })
                                                }}>
                                                <option value="">-- Comprobantes --</option>
                                                {
                                                    this.state.comprobantes.map((item, index) => (
                                                        <option key={index} value={item.idComprobante}>{item.nombre}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <a
                                            onClick={async () => await this.setStateAsync({
                                                expandedOpcionesAdelanto: !(this.refCollpseAdelanto.current.attributes["aria-expanded"].value.toLowerCase() === 'true')
                                            })}
                                            ref={this.refCollpseAdelanto}
                                            className="icon-link collapsed"
                                            data-bs-toggle="collapse"
                                            href="#collapseOpcionesAdelanto"
                                            role="button"
                                            aria-expanded="false"
                                            aria-controls="collapseOpcionesAdelanto">
                                            Opciones {this.state.expandedOpcionesAdelanto ? <i className="fa fa-plus-square"></i> : <i className="fa fa-minus-square"></i>}
                                        </a>
                                    </div>
                                </div>

                                <div ref={this.refCollpseContentAdelanto} className="collapse" id="collapseOpcionesAdelanto">
                                    <div className="form-row">
                                        <div className="form-group col-md-6">
                                            <select
                                                title="Lista de lotes"
                                                className="form-control"
                                                value={this.state.idImpuestoAdelanto}
                                                ref={this.refImpuestoAdelanto}
                                                onChange={(event) => this.setState({ idImpuestoAdelanto: event.target.value })}
                                            >
                                                <option value="">-- Impuesto --</option>
                                                {
                                                    this.state.impuestos.map((item, index) => (
                                                        <option key={index} value={item.idImpuesto}>{item.nombre}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        <div className="form-group col-md-6">
                                            <select
                                                title="Lista de lotes"
                                                className="form-control"
                                                value={this.state.idMedidaAdelanto}
                                                ref={this.refMedidaAdelanto}
                                                onChange={(event) => this.setState({ idMedidaAdelanto: event.target.value })}
                                            >
                                                <option value="">-- Unidad --</option>
                                                {
                                                    this.state.medidas.map((item, index) => (
                                                        <option key={index} value={item.idMedida}>{item.nombre}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>Cuenta bancaria <i className="fa fa-asterisk text-danger small"></i></label>
                                        <div className="input-group">
                                            <select
                                                className="form-control"
                                                ref={this.refBancoAdelanto}
                                                value={this.state.idBancoAdelanto}
                                                onChange={(event) =>
                                                    this.setState({
                                                        idBancoAdelanto: event.target.value
                                                    })
                                                }>
                                                <option value="">- Seleccione -</option>
                                                {
                                                    this.state.bancos.map((item, index) => (
                                                        <option key={index} value={item.idBanco}>{item.nombre}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group col-md-6">
                                        <label>Metodo de pago <i className="fa fa-asterisk text-danger small"></i></label>
                                        <select
                                            className="form-control"
                                            ref={this.refMetodoPagoAdelanto}
                                            value={this.state.metodoPagoAdelanto}
                                            onChange={(event) =>
                                                this.setState({
                                                    metodoPagoAdelanto: event.target.value,
                                                })}>
                                            <option value="">- Seleccione -</option>
                                            <option value="1">Efectivo</option>
                                            <option value="2">Consignación</option>
                                            <option value="3">Transferencia</option>
                                            <option value="4">Cheque</option>
                                            <option value="5">Tarjeta crédito</option>
                                            <option value="6">Tarjeta débito</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-12">
                                        <label>Observación</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ingrese alguna observación..."
                                            value={this.state.observacionAdelanto}
                                            onChange={(event) =>
                                                this.setState({ observacionAdelanto: event.target.value })
                                            } />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-3">
                                        <label>Valor adelantar:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="0.00"
                                            ref={this.refMontoAdelanto}
                                            value={this.state.montoAdelanto}
                                            onChange={(event) =>
                                                this.setState({ montoAdelanto: event.target.value })
                                            }
                                            onKeyPress={keyNumberFloat}
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.onEventCobrarAdelanto()}>Guardar</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal */}

                {
                    this.state.loading ?
                        <div className="clearfix absolute-all bg-white">
                            {spinnerLoading(this.state.msgLoading)}
                        </div> : null
                }

                {
                    this.state.messageWarning === '' ? null :
                        <div className="alert alert-warning" role="alert">
                            <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                        </div>
                }

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>
                                <span role="button" onClick={() => this.props.history.goBack()}><i className="bi bi-arrow-left-short"></i></span> Créditos
                                <small className="text-secondary"> Lista</small>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group">
                            <button type="button" className="btn btn-success" disabled={this.state.venta.credito === 1 ? false : true} onClick={() => this.onEventOpenModal()}><i className="fa fa-save"></i> Cobrar</button>
                            {" "}
                            <button type="button" className="btn btn-light" onClick={() => this.onEventImprimir()}><i className="fa fa-print"></i> Imprimir</button>
                            {" "}
                            <button type="button" className="btn btn-light"><i className="fa fa-file-archive-o"></i> Adjuntar</button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <p className="lead">Cliente</p>
                        <div className="form-group">
                            <div className="pt-1 pb-1">Cliente: <strong>{documento + " " + informacion}</strong></div>
                            <div className="pt-1 pb-1">Teléfono y celular: <strong>{telefono + " " + celular}</strong></div>
                            <div className="pt-1 pb-1">Email: <strong>{email}</strong></div>
                            <div className="pt-1 pb-1">Dirección: <strong>{direccion}</strong></div>
                            <div className="pt-1 pb-1">Comprobante: <strong>{nombre + " " + serie + "-" + numeracion}</strong></div>
                            <div className="pt-1 pb-1">Observación: </div>
                        </div>
                    </div>
                    <div className="col">
                        <p className="lead">Cobros</p>
                        <div className="form-group">
                            <div className="pt-1 pb-1">Inicial: <strong>{this.state.inicial === 0 ? "Sin Inicial" : numberFormat(this.state.inicial, codiso)}</strong></div>
                            <div className="pt-1 pb-1">N° de Cuotas: <strong>{credito === 1 ? "Variable" : numCuota === 1 ? numCuota + " Cuota" : numCuota + " Cuotas"}</strong></div>
                            <div className="pt-1 pb-1">Monto Total: <strong>{numberFormat(total, codiso)}</strong></div>
                            <div className="pt-1 pb-1">Monto Cobrado: <span className="text-success">{numberFormat(cobrado, codiso)}</span></div>
                            <div className="pt-1 pb-1">Monto Restante: <span className="text-danger">{numberFormat(total - cobrado, codiso)}</span></div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <p className="lead">Detalle</p>
                        <div className="table-responsive">
                            <table className="table table-light">
                                <thead>
                                    <tr className="table-active">
                                        <th width="5%" className="text-center">#</th>
                                        <th width="20%">Detalle</th>
                                        <th width="15%" className="text-center">Unidad</th>
                                        <th width="10%" className="text-center">Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.detalle.map((item, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{(index + 1)}</td>
                                                <td className="text-left">{item.lote}{<br />}{<small>{item.manzana}</small>}</td>
                                                <td className="text-center">{item.medida}</td>
                                                <td className="text-center">{item.cantidad}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <p className="lead">Cuotas</p>
                        <div className="table-responsive">
                            <table className="table table-light">
                                <thead>
                                    <tr className="table-active">
                                        <th width="5%" className="text-center">N°</th>
                                        <th width="15%">Fecha de Cobro</th>
                                        <th width="15%">Cuota</th>
                                        <th width="10%">Estado</th>
                                        <th width="15%">Monto</th>
                                        <th width="15%">Observación</th>
                                        <th width="5%" className="text-center">Opción</th>
                                        <th width="5%" className="text-center">Cobrar</th>
                                        <th width="5%" className="text-center">Imprimir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.plazos.length === 0 ?
                                            <tr className="text-center">
                                                <td colSpan="10">No hay cobros realizados</td>
                                            </tr>
                                            :
                                            this.state.plazos.map((item, index) => {
                                                let montoActual = item.monto;
                                                return <React.Fragment key={makeid((index + 1))}>
                                                    <tr className="table-success">
                                                        <td className="text-center">{index + 1}</td>
                                                        <td>{item.fecha}</td>
                                                        <td>{"CUOTA " + item.cuota}</td>
                                                        <td className={`${item.estado === 0 ? "text-danger" : "text-success"}`}>{item.estado === 0 ? "Por Cobrar" : "Cobrado"}</td>
                                                        <td>{numberFormat(item.monto, codiso)}</td>
                                                        <td></td>
                                                        <td className="text-center">
                                                            {
                                                                credito === 1 ? item.estado === 1 ?
                                                                    <input
                                                                        className="form-check-input m-0 transform-scale1-2"
                                                                        type="checkbox"
                                                                        disabled
                                                                        checked={true}
                                                                    />
                                                                    :
                                                                    <input
                                                                        className="form-check-input m-0 transform-scale1-2"
                                                                        type="checkbox"
                                                                        value={item.idPlazo}
                                                                        checked={item.selected}
                                                                        onChange={this.handleCheck}
                                                                    />
                                                                    : "-"
                                                            }
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                type="button"
                                                                className="btn btn-warning btn-sm"
                                                                onClick={() => this.onEventOpenModalCobro(item.idPlazo)}
                                                                disabled={item.estado === 1 ? true : false}>
                                                                <i className="fa fa-money"></i>
                                                            </button>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                type="button"
                                                                className="btn btn-light btn-sm"
                                                                onClick={() => this.onEventImprimirLetra(item.idPlazo)}
                                                            // disabled={item.estado === 1 ? false : true}
                                                            >
                                                                <i className="fa fa-print"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    <tr><td colSpan="7" className="pb-0">Cobros Asociados</td></tr>
                                                    <tr>
                                                        <td className="pb-0 text-center">#</td>
                                                        <td className="pb-0">Comprobante</td>
                                                        <td className="pb-0">Banco</td>
                                                        <td className="pb-0">Fecha</td>
                                                        <td className="pb-0">Cobrado</td>
                                                        <td className="pb-0">Restante</td>
                                                    </tr>
                                                    {

                                                        item.cobros.map((cobro, index) => {
                                                            montoActual = montoActual - cobro.precio;
                                                            return <tr key={index}>
                                                                <td className="small text-center">{(index + 1)}</td>
                                                                <td className="small">{cobro.nombre}{<br />}{cobro.serie + "-" + cobro.numeracion}</td>
                                                                <td className="small">{cobro.banco}</td>
                                                                <td className="small">{cobro.fecha}{<br />}{cobro.hora}</td>
                                                                <td className="small">{numberFormat(cobro.precio, cobro.codiso)}</td>
                                                                <td className="small">{numberFormat(montoActual, cobro.codiso)}</td>
                                                            </tr>
                                                        })
                                                    }
                                                    <tr>
                                                        <td colSpan="9">
                                                            <hr />
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(CreditoProceso);