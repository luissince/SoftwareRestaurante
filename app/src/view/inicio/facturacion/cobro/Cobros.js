import React from 'react';
import axios from 'axios';
import {
    numberFormat,
    timeForma24,
    spinnerLoading,
    alertDialog,
    alertInfo,
    alertSuccess,
    alertWarning,
    alertError,
    statePrivilegio,
    keyUpSearch
} from '../../../../helper/utils.helper';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Paginacion from '../../../../components/Paginacion';
import ContainerWrapper from '../../../../components/Container';

class Cobros extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            idCobro: '',

            idSucursal: this.props.token.project.idSucursal,
            idUsuario: this.props.token.userToken.idUsuario,

            add: statePrivilegio(this.props.token.userToken.menus[2].submenu[3].privilegio[0].estado),
            view: statePrivilegio(this.props.token.userToken.menus[2].submenu[3].privilegio[1].estado),
            remove: statePrivilegio(this.props.token.userToken.menus[2].submenu[3].privilegio[2].estado),

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
        this.refTxtSearch = React.createRef();

        this.idCodigo = "";
        this.abortControllerTable = new AbortController();
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    componentDidMount() {
        this.loadInit();
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

            const result = await axios.get('/api/cobro/list', {
                signal: this.abortControllerTable.signal,
                params: {
                    "opcion": opcion,
                    "buscar": buscar,
                    "idSucursal": this.state.idSucursal,
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

    onEventNuevoCobro() {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/proceso`,
        })
    }

    onEventAnularCobro(idCobro) {
        alertDialog("Cobro", "¿Está seguro de que desea eliminar la transacción? Esta operación no se puede deshacer.", async (value) => {
            if (value) {
                try {
                    alertInfo("Cobro", "Procesando información...");
                    let result = await axios.delete('/api/cobro/anular', {
                        params: {
                            "idCobro": idCobro,
                            "idUsuario": this.state.idUsuario
                        }
                    })
                    alertSuccess("Cobro", result.data, () => {
                        this.loadInit();
                    })
                } catch (error) {
                    if (error.response) {
                        alertWarning("Cobro", error.response.data)
                    } else {
                        alertError("Cobro", "Se genero un error interno, intente nuevamente.")
                    }
                }
            }
        })
    }

    render() {
        return (
            <ContainerWrapper>
                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5>Cobros o Ingresos <small className="text-secondary">LISTA</small></h5>
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
                            <button className="btn btn-outline-info" onClick={() => this.onEventNuevoCobro()} disabled={!this.state.add}>
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
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered rounded">
                                <thead>
                                    <tr>
                                        <th width="5%" className="text-center">#</th>
                                        <th width="10%">Cliente</th>
                                        <th width="10%">Correlativo</th>
                                        <th width="10%">Creación</th>
                                        <th width="10%">Cuenta</th>
                                        <th width="15%">Observación</th>
                                        <th width="10%">Estado</th>
                                        <th width="10%">Monto</th>
                                        <th width="5%" className="text-center">Detalle</th>
                                        <th width="5%" className="text-center">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.loading ? (
                                            <tr>
                                                <td className="text-center" colSpan="10">
                                                    {spinnerLoading()}
                                                </td>
                                            </tr>
                                        ) : this.state.lista.length === 0 ? (
                                            <tr className="text-center">
                                                <td colSpan="10">¡No hay datos registrados!</td>
                                            </tr>
                                        ) : (
                                            this.state.lista.map((item, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td className="text-center">{item.id}</td>
                                                        <td>{item.documento}{<br />}{item.informacion}</td>
                                                        <td>{item.comprobante}{<br />}{item.serie + "-" + item.numeracion}</td>
                                                        <td>{item.fecha}{<br />}{timeForma24(item.hora)}</td>
                                                        <td>{item.banco}</td>
                                                        <td>{item.detalle}
                                                            <br />
                                                            <small>
                                                                {
                                                                    item.comprobanteRef !== "" ?
                                                                        <Link className='btn-link' to={`/inicio/ventas/detalle?idVenta=${item.idVentaRef}`}>
                                                                            {item.comprobanteRef} <i className='fa fa-external-link-square'></i>
                                                                        </Link>
                                                                        : null
                                                                }
                                                            </small>
                                                            <br />
                                                            <small>{item.productoRef}</small>
                                                            {
                                                                item.estadoRef === 4 ?
                                                                    <>
                                                                        <br />
                                                                        <small className="text-danger">MODIFICADO</small>
                                                                    </>
                                                                    :
                                                                    null
                                                            }
                                                        </td>
                                                        <td>{item.estado === 1 && item.idNotaCredito === null ?
                                                            <span className="text-success">COBRADO</span> :
                                                            item.idNotaCredito != null ?
                                                                <span className="text-warning">MODIFICADO</span> :
                                                                <span className="text-danger">ANULADO</span>}
                                                        </td>
                                                        <td>{numberFormat(item.monto)}</td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-info btn-sm"
                                                                title="Detalle"
                                                                onClick={() => {
                                                                    this.props.history.push({ pathname: `${this.props.location.pathname}/detalle`, search: "?idCobro=" + item.idCobro })
                                                                }}
                                                                disabled={!this.state.view}>
                                                                <i className="fa fa-eye"></i>
                                                            </button>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                title="Eliminar"
                                                                onClick={() => this.onEventAnularCobro(item.idCobro)}
                                                                disabled={!this.state.remove}>
                                                                <i className="fa fa-remove"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
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


export default connect(mapStateToProps, null)(Cobros);