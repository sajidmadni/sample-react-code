import React, { Component } from 'react';
import { Input, InputGroup } from "reactstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

//simplebar
import SimpleBar from "simplebar-react";

//actions
import {
    setconversationNameInOpenChat,
    activeUser,
    fetchConversations,
    setMessagesThread, setRecipientsList
} from "../../../../../redux/SecureText/actions";
import {
    createSmartTask,
    fetchSmartTasks
} from "../../../../../redux/Task/actions";
import grp_img from '../../../../../../images/group_img.png'

class Tasks extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps) {
    }

    componentWillReceiveProps(nextProps) {
    }
    render() {
        return (
            <React.Fragment>
                <div>
                    <div className="px-4 pt-4">
                        <h4 className="mb-4">Tasks</h4>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { active_user } = state.secureText.Chat;
    const { tasks } = state.smartTasks.Task;
    return { active_user, tasks };
};

export default connect(mapStateToProps, { setconversationNameInOpenChat, activeUser, fetchConversations, setMessagesThread, createSmartTask, fetchSmartTasks })(Tasks);