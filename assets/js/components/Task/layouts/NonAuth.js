import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import TaskLeftSidebarMenu from "./TaskLeftSidebarMenu";

class NonAuth extends Component {
    constructor(props) {
        super(props);
        this.state={};
    }

    componentDidMount(){
        document.title = "Tasks";
    }
    render() {
        return (
            <React.Fragment>
                <div className="layout-wrapper d-lg-flex">
                    {/* left sidebar menu */}
                    <TaskLeftSidebarMenu />
                    {/* render page content */}
                    {this.props.children}
                </div>
            </React.Fragment>
        );
    }
}

export default (withRouter(NonAuth));