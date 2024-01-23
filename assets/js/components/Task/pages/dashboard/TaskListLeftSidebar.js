import React from 'react';
import { connect } from "react-redux";

import { TabContent, TabPane } from "reactstrap";
import Tasks from "./Tabs/Tasks";

function TaskListLeftSidebar(props) {
    const activeTab = props.activeTab;
    return (
        <React.Fragment>
            <div className="chat-leftsidebar me-lg-1">
                <TabContent activeTab={activeTab}>
                    <TabPane tabId="chat" id="pills-chat">
                        <Tasks recentChatList={props.recentChatList}/>
                    </TabPane>
                </TabContent>
            </div>
        </React.Fragment>
    );
}

const mapStatetoProps = state => {
    return {
      ...state.smartTasks.Layout
    };
};

export default connect(mapStatetoProps, null)(TaskListLeftSidebar);