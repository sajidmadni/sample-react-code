import React, { Component } from 'react';
import { connect } from "react-redux";

import TaskListLeftSidebar from "./TaskListLeftSidebar";
import TaskList from "./Task/";

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = { }
    }
    render() {
        return (
            <React.Fragment>
                <TaskList />
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { users, active_user, groups, active_group } = state.secureText.Chat;
    const { activeTab } = state.secureText.Layout;
    const { tasks } = state.smartTasks.Task;
    return { activeTab, users, active_user, groups, active_group, tasks };
};

export default connect(mapStateToProps, {  })(Index);