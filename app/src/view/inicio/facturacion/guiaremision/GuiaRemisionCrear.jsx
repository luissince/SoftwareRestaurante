import React from 'react';
import ContainerWrapper from '../../../../components/Container';
import CustomComponent from '../../../../model/class/custom-component';

class GuiaRemisionCrear extends CustomComponent {

    render() {
        return (
            <ContainerWrapper>

                <div className='row'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <div className="form-group">
                            <h5> Guía Remisión <small className='text-secondary'> Crear </small> </h5>
                        </div>
                    </div>
                </div>

            </ContainerWrapper>
        );
    }
}

export default GuiaRemisionCrear;