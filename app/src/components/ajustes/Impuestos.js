import React from 'react';
import axios from 'axios';
import {
    isNumeric,
    keyNumberInteger,
    timeForma24,
    showModal,
    hideModal,
    viewModal,
    clearModal,
    ModalAlertDialog,
    ModalAlertInfo,
    ModalAlertSuccess,
    ModalAlertWarning,
    spinnerLoading,
    statePrivilegio,
    keyUpSearch
} from '../../helper/Tools';
import { connect } from 'react-redux';
import Paginacion from '../../helper/Paginacion';
import ContainerWrapper from '../container';

class Impuestos extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            idImpuesto: '',
            nombre: '',
            porcentaje: '',
            codigo: '',
            estado: true,
            idUsuario: this.props.token.userToken.idUsuario,

            add: statePrivilegio(this.props.token.userToken.menus[5].submenu[5].privilegio[0].estado),
            edit: statePrivilegio(this.props.token.userToken.menus[5].submenu[5].privilegio[1].estado),
            remove: statePrivilegio(this.props.token.userToken.menus[5].submenu[5].privilegio[2].estado),

            loadModal: false,
            nameModal: 'Nuevo Impuesto',
            messageWarning: '',
            msgModal: 'Cargando datos...',

            loading: false,
            lista: [],
            restart: false,

            opcion: 0,
            paginacion: 0,
            totalPaginacion: 0,
            filasPorPagina: 10,
            messageTable: 'Cargando información...',
            messagePaginacion: 'Mostranto 0 de 0 Páginas'
        }
        this.refNombre = React.createRef();
        this.refPorcentaje = React.createRef();
        this.refCodigo = React.createRef();

        this.refTxtSearch = React.createRef();

        this.idCodigo = "";
        this.abortControllerTable = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    async componentDidMount() {
        this.loadInit();

        viewModal("modalImpuesto", () => {
            this.abortControllerModal = new AbortController();

            if (this.idCodigo !== "") this.loadDataId(this.idCodigo);
        });

        clearModal("modalImpuesto", async () => {
            this.abortControllerModal.abort();
            await this.setStateAsync({
                idImpuesto: '',
                nombre: '',
                porcentaje: '',
                codigo: '',
                estado: true,

                loadModal: false,
                nameModal: 'Nuevo Impuesto',
                messageWarning: '',
                msgModal: 'Cargando datos...',
            });
            this.idCodigo = "";
        });
    }

    componentWillUnmount() {
        this.abortControllerTable.abort();
    }

    loadInit = async () => {
        if (this.state.loading) return;

        await this.setStateAsync({ paginacion: 1, restart: true });
        this.fillTable(0, "");
        await this.setStateAsync({ opcion: 0 });

    }

    async searchText(text) {
        if (this.state.loading) return;

        if (text.trim().length === 0) return;

        await this.setStateAsync({ paginacion: 1, restart: false });
        this.fillTable(1, text.trim());
        await this.setStateAsync({ opcion: 1 });
    }

    paginacionContext = async (listid) => {
        await this.setStateAsync({ paginacion: listid, restart: false });
        this.onEventPaginacion();
    }

    onEventPaginacion = () => {
        switch (this.state.opcion) {
            case 0:
                this.fillTable(0, "");
                break;
            case 1:
                this.fillTable(1, this.refTxtSearch.current.value);
                break;
            default: this.fillTable(0, "");
        }
    }

    fillTable = async (opcion, buscar) => {
        try {
            await this.setStateAsync({ loading: true, lista: [], messageTable: "Cargando información...", messagePaginacion: "Mostranto 0 de 0 Páginas" });

            const result = await axios.get('/api/impuesto/list', {
                signal: this.abortControllerTable.signal,
                params: {
                    "opcion": opcion,
                    "buscar": buscar,
                    "posicionPagina": ((this.state.paginacion - 1) * this.state.filasPorPagina),
                    "filasPorPagina": this.state.filasPorPagina
                }
            });

            let totalPaginacion = parseInt(Math.ceil((parseFloat(result.data.total) / this.state.filasPorPagina)));
            let messagePaginacion = `Mostrando ${result.data.result.length} de ${totalPaginacion} Páginas`;

            await this.setStateAsync({
                loading: false,
                lista: result.data.result,
                totalPaginacion: totalPaginacion,
                messagePaginacion: messagePaginacion
            });
        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    loading: false,
                    lista: [],
                    totalPaginacion: 0,
                    messageTable: "Se produjo un error interno, intente nuevamente por favor.",
                    messagePaginacion: "Mostranto 0 de 0 Páginas",
                });
            }
        }
    }

    async openModal(id) {
        if (id === '') {
            showModal('modalImpuesto')
            await this.setStateAsync({ nameModal: "Nuevo Impuesto" });
        } else {
            showModal('modalImpuesto')
            this.idCodigo = id;
            await this.setStateAsync({ idImpuesto: id, nameModal: "Editar Impuesto", loadModal: true });
        }
    }

    loadDataId = async (id) => {
        try {
            const result = await axios.get("/api/impuesto/id", {
                signal: this.abortControllerModal.signal,
                params: {
                    idImpuesto: id
                }
            });

            await this.setStateAsync({
                idImpuesto: result.data.idImpuesto,
                nombre: result.data.nombre,
                porcentaje: result.data.porcentaje.toString(),
                codigo: result.data.codigo,
                estado: result.data.estado === 1 ? true : false,
                loadModal: false
            });

        } catch (error) {
            if (error.message !== "canceled") {
                await this.setStateAsync({
                    msgModal: "Se produjo un error interno, intente nuevamente"
                });
            }
        }
    }

    async onEventGuardar() {
        if (this.state.nombre === "") {
            await this.setStateAsync({ messageWarning: "Ingrese el nombre." });
            this.refNombre.current.focus();
        } else if (!isNumeric(this.state.porcentaje)) {
            await this.setStateAsync({ messageWarning: "Ingrese el porcentaje." });
            this.refPorcentaje.current.focus();
        } else {
            try {
                ModalAlertInfo("Impuesto", "Procesando información...");
                hideModal("modalImpuesto");
                if (this.state.idImpuesto !== "") {
                    const result = await axios.post('/api/impuesto/edit', {
                        "idImpuesto": this.state.idImpuesto,
                        "nombre": this.state.nombre,
                        "porcentaje": this.state.porcentaje,
                        "codigo": this.state.codigo,
                        "estado": this.state.estado,
                        "idUsuario": this.state.idUsuario,
                    });

                    ModalAlertSuccess("Impuesto", result.data, () => {
                        this.onEventPaginacion();
                    });
                } else {
                    const result = await axios.post('/api/impuesto/add', {
                        "nombre": this.state.nombre,
                        "porcentaje": this.state.porcentaje,
                        "codigo": this.state.codigo,
                        "estado": this.state.estado,
                        "idUsuario": this.state.idUsuario,
                    });

                    ModalAlertSuccess("Impuesto", result.data, () => {
                        this.loadInit();
                    });
                }
            } catch (err) {
                ModalAlertWarning("Impuesto", "Se produjo un error un interno, intente nuevamente.");
            }
        }
    }

    onEventDelete(idImpuesto) {
        ModalAlertDialog("Impuesto", "¿Estás seguro de eliminar la moneda?", async (event) => {
            if (event) {
                try {
                    ModalAlertInfo("Impuesto", "Procesando información...")
                    let result = await axios.delete('/api/impuesto', {
                        params: {
                            "idImpuesto": idImpuesto
                        }
                    })
                    ModalAlertSuccess("Impuesto", result.data, () => {
                        this.loadInit();
                    })
                } catch (error) {
                    if (error.response !== undefined) {
                        ModalAlertWarning("Impuesto", error.response.data)
                    } else {
                        ModalAlertWarning("Impuesto", "Se genero un error interno, intente nuevamente.")
                    }
                }
            }
        })
    }

    render() {
        return (
            <ContainerWrapper>
                {/* inicio modal */}
                <div className="modal fade" id="modalImpuesto" data-bs-keyboard="false" data-bs-backdrop="static">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{this.state.nameModal}</h5>
                                <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {this.state.loadModal ?
                                    <div className="clearfix absolute-all bg-white">
                                        {spinnerLoading(this.state.msgModal)}
                                    </div>
                                    : null}

                                {
                                    this.state.messageWarning === '' ? null :
                                        <div className="alert alert-warning" role="alert">
                                            <i className="bi bi-exclamation-diamond-fill"></i> {this.state.messageWarning}
                                        </div>
                                }

                                <div className="form-group">
                                    <label htmlFor="nombre" className="col-form-label">Nombre: <i className="fa fa-asterisk text-danger small"></i></label>
                                    <input
                                        type="text"
                                        placeholder="Digite..."
                                        className="form-control"
                                        id="nombre"
                                        ref={this.refNombre}
                                        value={this.state.nombre}
                                        onChange={(event) => this.setState({ nombre: event.target.value })} />
                                </div>

                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="serie">Porcentaje: <i className="fa fa-asterisk text-danger small"></i></label>
                                        <input
                                            type="text"
                                            placeholder="Digite..."
                                            className="form-control"
                                            id="serie"
                                            ref={this.refPorcentaje}
                                            value={this.state.porcentaje}
                                            onChange={(event) => this.setState({ porcentaje: event.target.value })}
                                            onKeyPress={keyNumberInteger} />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="numeracion">Código:</label>
                                        <input
                                            type="text"
                                            placeholder="Digite..."
                                            className="form-control"
                                            id="numeracion"
                                            ref={this.refCodigo}
                                            value={this.state.codigo}
                                            onChange={(event) => this.setState({ codigo: event.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <div className="custom-control custom-switch">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="switch1"
                                            checked={this.state.estado}
                                            onChange={(value) => this.setState({ estado: value.target.checked })} />
                                        <label className="custom-control-label" htmlFor="switch1">Activo o Inactivo</label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => this.onEventGuardar()}>Guardar</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* fin modal */}

                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                            <h5>Impuestos <small className="text-secondary">LISTA</small></h5>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="bi bi-search"></i></div>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar..."
                                    ref={this.refTxtSearch}
                                    onKeyUp={(event) => keyUpSearch(event, () => this.searchText(event.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-sm-12">
                        <div className="form-group">
                            <button className="btn btn-outline-info" onClick={() => this.openModal('')} disabled={!this.state.add}>
                                <i className="bi bi-file-plus"></i> Nuevo Registro
                            </button>
                            {" "}
                            <button className="btn btn-outline-secondary" onClick={() => this.loadInit()}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12 col-sm-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered rounded">
                                <thead>
                                    <tr>
                                        <th width="5%" className="text-center">#</th>
                                        <th width="40%" >Nombre</th>
                                        <th width="15%" >Porcentaje</th>
                                        <th width="15%" >Código</th>
                                        <th width="15%" >Estado</th>
                                        <th width="5%" className="text-center">Editar</th>
                                        <th width="5%" className="text-center">Anular</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="8">
                                                    {spinnerLoading()}
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr>
                                                <td className="text-center" colSpan="8">¡No hay comprobantes registrados!</td>
                                            </tr>
                                        ) :
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td className="text-center">{item.id}</td>
                                                        <td>{item.nombre}</td>
                                                        <td>{item.porcentaje + "%"}</td>
                                                        <td>{item.codigo}</td>
                                                        <td className="text-center"><div className={`badge ${item.estado === 1 ? "badge-info" : "badge-danger"}`}>{item.estado === 1 ? "ACTIVO" : "INACTIVO"}</div></td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-warning btn-sm"
                                                                title="Editar"
                                                                onClick={() => this.openModal(item.idImpuesto)}
                                                                disabled={!this.state.edit}>
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                title="Anular"
                                                                onClick={() => this.onEventDelete(item.idImpuesto)}
                                                                disabled={!this.state.remove}>
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12 col-md-5">
                        <div className="dataTables_info mt-2" role="status" aria-live="polite">{this.state.messagePaginacion}</div>
                    </div>
                    <div className="col-sm-12 col-md-7">
                        <div className="dataTables_paginate paging_simple_numbers">
                            <nav aria-label="Page navigation example">
                                <ul className="pagination justify-content-end">
                                    <Paginacion
                                        loading={this.state.loading}
                                        totalPaginacion={this.state.totalPaginacion}
                                        paginacion={this.state.paginacion}
                                        fillTable={this.paginacionContext}
                                        restart={this.state.restart}
                                    />
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </ContainerWrapper>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

export default connect(mapStateToProps, null)(Impuestos);