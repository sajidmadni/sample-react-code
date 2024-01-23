import React, { Component } from 'react';
import loader from '../../../../images/loader.gif'

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
                // <img className="loader-img" src={ loader }  alt="Loading Image" />
                <div className="sk-folding-cube" style={{ marginTop: "60px" }}>
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

export default  LoadingSpinner;