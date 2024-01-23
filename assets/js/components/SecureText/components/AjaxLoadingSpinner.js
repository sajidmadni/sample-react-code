import React, { Component } from 'react';
import loader from '../../../../images/loader.gif'

class AjaxLoadingSpinner extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }


    render() {
        return (
            <React.Fragment>
            {
                // <img className="loader-img" src={ loader }  alt="Loading Image" />
                <div className="sk-folding-cube sk-folding-cube-ajax">
                    <div className="sk-cube1 sk-cube"></div>
                    <div className="sk-cube2 sk-cube"></div>
                    <div className="sk-cube4 sk-cube"></div>
                    <div className="sk-cube3 sk-cube"></div>
                </div>
            }
            </React.Fragment>
        );
    }
}

export default  AjaxLoadingSpinner;