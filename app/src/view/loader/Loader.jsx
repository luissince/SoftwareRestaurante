import React from 'react';
import '../../recursos/css/loader.css';
import { connect } from 'react-redux';
import { config, restoreToken } from '../../redux/actions';
import { empresaConfig, validToken } from '../../network/rest/principal.network';

import { CANCELED } from '../../model/types/types';
import ErrorResponse from '../../model/class/error-response';
import SuccessReponse from '../../model/class/response';

class Loader extends React.Component {

    async componentDidMount() {
        const empresa = await empresaConfig();

        if (empresa instanceof SuccessReponse) {

            const valid = await validToken();

            if (valid instanceof SuccessReponse) {
                const userToken = window.localStorage.getItem('login');
                const login = JSON.parse(userToken);

                const project = JSON.parse(window.localStorage.getItem('project'));

                const user = {
                    ...login,
                    project: project
                }

                this.props.restore(user, empresa.data);
            }

            if (valid instanceof ErrorResponse) {
                if (empresa.type === CANCELED) return;

                window.localStorage.removeItem('login');
                window.localStorage.removeItem('project');
                this.props.restore(null, empresa.data);
            }
        }

        if (empresa instanceof ErrorResponse) {
            if (empresa.type === CANCELED) return;

            if (empresa.status === 400) {
                this.props.config();
            } else {
                window.localStorage.removeItem('login');
                window.localStorage.removeItem('project');
                this.props.restore(null, null);
            }
        }
    }

    render() {
        return (
            <>
                <div className="loader text-center">
                    <div className="loader-inner">

                        <div className="lds-roller mb-3">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>

                        <h4 className="text-uppercase font-weight-bold">Cargando...</h4>
                        <p className="font-italic text-muted">Se está estableciendo conexión con el servidor...</p>
                    </div>
                </div>
            </>);
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        config: () => dispatch(config()),
        restore: (user, empresa) => dispatch(restoreToken(user, empresa))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Loader);