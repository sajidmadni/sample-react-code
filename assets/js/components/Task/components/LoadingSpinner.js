import React, { Component } from 'react';
import loader from '../../../../images/loader.gif';

class LoadingSpinner extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }


    render() {
        return (
            <React.Fragment>
            {
                <img className="loader-img" src={ loader }  alt="Loading Image" />
            }
            </React.Fragment>
        );
    }
}

export default  LoadingSpinner;