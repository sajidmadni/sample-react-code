import React from 'react';
import { connect } from "react-redux";
import NavbarCustom from "./Navbar";

function TaskLeftSidebarMenu(props) {
    return (
        <React.Fragment>
            <div className="side-menu task-side-menu flex-lg-column me-lg-1" style={{marginTop: "73px" }}>
                <NavbarCustom />
            </div>
        </React.Fragment>
    );
}

const mapStateToProps = (state) => {
    return {};
};


export default connect(mapStateToProps, {})(TaskLeftSidebarMenu);