import React, { Component } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import {connect} from "react-redux";
import {filterTasksBySelection, setActiveTab} from "../../../redux/Task/tasks/actions";
import {LeftSideBarData} from "./LeftSideBarData";
import {ALL} from "../../../redux/Task/tasks/constants";

class NavbarCustom extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            showFiltersList: true
        }
        this.handleShowFiltersToggle = this.handleShowFiltersToggle.bind(this);
    }
    handleShowFiltersToggle() {
        if(this.state.showFiltersList){
            this.setState({ showFiltersList: false });
            $("#filter_drop_icon").removeClass("fa-angle-up").addClass("fa-angle-down");
        }else{
            this.setState({ showFiltersList: true });
            $("#filter_drop_icon").removeClass("fa-angle-down").addClass("fa-angle-up");
        }
    }

    toggleFilter(tab) {
      //  this.props.setActiveTab(tab);
        this.props.filterTasksBySelection(this.props.tasks, tab, this.props.current_user_id);
    }

    render() {
        return (
            <Navbar expand="lg">
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto" defaultActiveKey="#ALL">
                        {
                            LeftSideBarData.map((navitem, index) => (
                                <NavDropdown title={
                                    <div style={{display: "inline-block", color: "#0074bf"}}>
                                        <b>Filters</b>
                                        <i id="filter_drop_icon" className="fas fa-angle-up" style={{paddingLeft: "92px", fontSize: "11px"}} aria-hidden="true" onClick={this.handleShowFiltersToggle}></i>
                                    </div>} id="basic-nav-dropdown" show={this.state.showFiltersList}>
                                    {
                                        navitem.subNav.map((item, index) => {
                                            return (
                                                <NavDropdown.Item onClick={() => this.toggleFilter(item.id)} id={item.id} to={item.id} key={item.id} href={"#"+item.id}> <i className={item.iconClass} aria-hidden="true"></i>  {item.title}</NavDropdown.Item>
                                            );
                                        })
                                    }
                                </NavDropdown>
                            ))
                        }
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}
const mapStateToProps = (state) => {
    const { tasks, activeTab, current_user_id } = state.smartTasks.Task;
    return { tasks, activeTab, current_user_id };
};

export default connect(mapStateToProps, {
    setActiveTab, filterTasksBySelection
})(NavbarCustom);