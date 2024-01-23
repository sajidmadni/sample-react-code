import React from 'react';
import { connect } from "react-redux";

import { TabContent, TabPane } from "reactstrap";

//Import Components
import Chats from "./Tabs/Chats";
import Groups from "./Tabs/Groups";
import Contacts from "./Tabs/Contacts";
import Settings from "./Tabs/Settings";

function ChatLeftSidebar(props) {
    const activeTab = props.activeTab;
    return (
        <React.Fragment>
            <div className="chat-leftsidebar me-lg-1">
                <TabContent activeTab={activeTab}>
                    {/* Start chats tab-pane  */}
                    <TabPane tabId="chat" id="pills-chat">
                        {/* chats content */}
                        <Chats recentChatList={props.recentChatList}/>
                    </TabPane>
                    {/* End chats tab-pane */}
                    
                    {/* Start groups tab-pane */}
                    <TabPane tabId="group" id="pills-groups">
                        {/* Groups content */}
                        <Groups recentChatList={props.recentChatList} groupsList={props.groupsList}/>
                    </TabPane>
                    {/* End groups tab-pane */}

                    {/* Start contacts tab-pane */}
                    <TabPane tabId="contacts" id="pills-contacts">
                        {/* Contact content */}
                        <Contacts />
                    </TabPane>
                    {/* End contacts tab-pane */}
                    
                    {/* Start settings tab-pane */}
                    <TabPane tabId="settings" id="pills-setting">
                        {/* Settings content */}
                        <Settings />
                    </TabPane>
                    {/* End settings tab-pane */}
                </TabContent>
                {/* end tab content */}

                </div>
        </React.Fragment>
    );
}

const mapStatetoProps = state => {
    return {
      ...state.secureText.Layout
    };
};

export default connect(mapStatetoProps, null)(ChatLeftSidebar);