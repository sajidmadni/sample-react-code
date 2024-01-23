import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import LeftSidebarMenu from "./LeftSidebarMenu";

class NonAuth extends Component {
    constructor(props) {
        super(props);
        this.state={};
    }

    componentDidMount(){
        document.title = "Messages";
    }
    render() {
        return (
            <React.Fragment>
                <div className="task-content layout-wrapper d-lg-flex">
                    {/* left sidebar menu */}
                    <LeftSidebarMenu />
                    {/* render page content */}
                    {this.props.children}
                </div>
            </React.Fragment>
        );
    }
}

export default (withRouter(NonAuth));