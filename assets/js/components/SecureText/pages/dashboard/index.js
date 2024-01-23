import React, { Component } from 'react';
import { connect } from "react-redux";

//Import Components
import ChatLeftSidebar from "./ChatLeftSidebar";
import UserChat from "./UserChat/";
import BlankMessageThread from "./UserChat/BlankMessageThread";
import {setMyUserId} from "../../../../redux/SecureText/chat/actions";

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = { }
    }

    componentDidMount(){
        this.setMyUserId();
    }

    setMyUserId() {
        const userId = $("a[name='myPresence']").attr("id");
        const userPresence = $("a[name='myPresence']").data("presence");
        const userName = $("a[name='myPresence']").text().trim();
        const isCovered = $("a[name='myPresence']").data("covered");
        this.props.setMyUserId(userId, userPresence, userName, isCovered);
    }

    render() {
        return (
            <React.Fragment>
                {/* chat left sidebar */}
                <ChatLeftSidebar recentChatList={this.props.users} groupsList={this.props.groups} />
                {/* user chat */}

                {
                    ((this.props.activeTab =="chat" && this.props.active_user != -1  && this.props.users.length > 0) || (this.props.activeTab =="group" && this.props.active_group != -1 && this.props.groups.length > 0)) ?
                        <UserChat recentChatList={(this.props.activeTab =="group")?this.props.groups:this.props.users} active_user={(this.props.activeTab =="group")?this.props.active_group:this.props.active_user} />
                    :
                        <BlankMessageThread />
                }

            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { users, active_user, groups, active_group } = state.secureText.Chat;
    const { activeTab } = state.secureText.Layout;
    return { activeTab, users, active_user, groups, active_group };
};

export default connect(mapStateToProps, { setMyUserId })(Index);