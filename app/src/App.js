import React from 'react';
import Login from './components/login/Login';
import Inicio from './components/inicio/Inicio';
import Principal from './components/principal/Principal';
import NotFound from './components/error/NotFound';
import { connect } from 'react-redux';
import { restoreToken } from './redux/actions';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

const Loader = () => {
    return <div>Cargando....</div>
}

class App extends React.Component {

    constructor(props) {
        super(props);
        this.menuRef = React.createRef();
    }

    async componentDidMount() {
        try {
            let userToken = await localStorage.getItem('login');
            this.props.restore(userToken);
        } catch (e) {
            this.props.restore(null);
        }
    }

    componentDidUpdate() {

    }

    setOpen = () => {
        this.setState({ isModal: !this.state.isModal }, () => {
            this.menuRef.current.handleToggleSidebar(this.state.isModal);
        });
    }

    setMinimun = () => {
        this.setState({ isModal: !this.state.isModal }, () => {
            this.menuRef.current.handleCollapsedSidebar(this.state.isModal);
        });
    }

    render() {
        return (
            <BrowserRouter>
                {
                    this.props.token.isLoading ?
                        (
                            <Loader />
                        )
                        :
                        (
                            <Switch>
                                <Route
                                    path="/"
                                    exact={true}>
                                    <Redirect to="/login" />
                                </Route>
                                <Route
                                    path="/login"
                                    exact={true}
                                    render={(props) => <Login {...props} />}
                                />
                                <Route
                                    path="/principal"
                                    exact={true}
                                    render={(props) => <Principal {...props} />}
                                />
                                <Route
                                    path="/inicio"
                                    render={(props) => <Inicio {...props} />}
                                />
                                <Route component={NotFound} />
                            </Switch>
                        )
                }
            </BrowserRouter>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.reducer
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        restore: (user) => dispatch(restoreToken(user))
    }
}

// export default App;
export default connect(mapStateToProps, mapDispatchToProps)(App);