import React, { Component } from 'react';
import {Button, Input, InputGroup, UncontrolledTooltip} from "reactstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

//simplebar
import SimpleBar from "simplebar-react";

//actions
import {
    setconversationNameInOpenChat,
    activeUser,
    fetchConversations,
    setMessagesThread,
    pollChatData,
    loadGroup,
    openNewThread,
    setTabOpenType,
    setUsersLastUnreadMessageId,
    setFirstTimeThreadAPicallStatus,
    setUsersLastTopMessageId
} from "../../../../../redux/SecureText/actions"
import grp_img from '../../../../../../images/group_img.png'
import ContactPresence from "../../../components/ContactPresence";
import ContactsDialog from './../../../components/ContactsDialog';
import AllMessagesRead from '../../../components/AllMessagesRead';
import {SIMPLE_DATE_ONLY_FORMAT, TODAY_TIME_FORMAT, USE_TIME_FORMAT} from "../../../../../constants/general";
const imageFileType = ["jpeg", "png", "jpg"];

class Chats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchChat: "",
            recentChatList: this.props.recentChatList,
            active_user: this.props.active_user,
            my_user: this.props.my_user,
            firstUnreadMessageId: 0
        }
        this.handleChange = this.handleChange.bind(this);
        this.openUserChat = this.openUserChat.bind(this);
    }

    componentDidMount() {
        this.pollChatData();
        this.timer = setInterval(() => {
                        // Check if temp group exists then don't poll chat data. recentChat.id is for group and recentChat.isNew is for single chat
                        let isTempGroupExists = false;
                        this.state.recentChatList.map((recentChat, keyChat) => {
                            if( (recentChat.id < 0 && recentChat.name === "Temp Group") || (recentChat.isTempSingle) ){
                                return isTempGroupExists = true;
                                // break;
                            }
                        })
                        if(!isTempGroupExists){
                            this.pollChatData()
                        }                        
                    } , 60000);
      //  this.props.fetchConversations();
        var li = document.getElementById("conversation" + this.props.active_user);
        if (li) {
            li.classList.add("active");
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.timer = null;
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({
                recentChatList: this.props.recentChatList,
                firstUnreadMessageId: this.state.firstUnreadMessageId
            });
            if(prevProps.activeTab != this.props.activeTab){
                this.setState({
                    searchChat: ""
                });
                this.props.activeUser(-1);
            }
            this.applySearchOnState();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.recentChatList !== nextProps.recentChatList) {
            this.setState({
                recentChatList: nextProps.recentChatList,
            });
        }
        if (this.props.active_user !== nextProps.active_user) {
            this.setState({
                active_user: nextProps.active_user,
            });
            var li = document.getElementById("conversation" + nextProps.active_user);
            if (li) {
                li.classList.add("active");
            }
            var li = document.getElementById("conversation" + this.props.active_user);
            if (li) {
                li.classList.remove("active");
            }
        }
    }

    pollChatData(){
        let that = this;
        this.props.pollChatData().then(()=>{
            if(this.props.active_user >= 0){
                let currChat = this.props.users[this.props.active_user];
                if(typeof currChat !== 'undefined' && currChat.msgNew > 0 ){
                    if(currChat.isGroup){
                        that.fetchAndSetGroupMessagesThread(currChat);
                    }else {
                        that.fetchAndSetUsersMessagesThread(currChat);
                    }
                    that.markThreadAsRead(currChat);
                }
            }
        });
    }

    handleChange(e) {
        this.setState({ searchChat: e.target.value });
        var search = e.target.value;
        this.applySearchOnState(search);
        //if input value is blanck then assign whole recent chatlist to array
        if (search === "") this.setState({ recentChatList: this.props.recentChatList })
    }

    applySearchOnState(search=""){
        if(search==""){
            search = this.state.searchChat;
        }
        let conversation = this.state.recentChatList;
        let filteredArray = [];
        //find conversation name from array
        for (let i = 0; i < conversation.length; i++) {
            if (conversation[i].name.toLowerCase().includes(search.toLowerCase()))
                filteredArray.push(conversation[i]);
        }
        //set filtered items to state
        this.setState({ recentChatList: filteredArray })
    }

    fetchAndSetUsersMessagesThread(chat, currentSelectedIndex = null){
        let selectedMessageThread = currentSelectedIndex != null ? this.props.users[currentSelectedIndex] : this.props.users[this.props.active_user];
        let unreadMessagesCount = selectedMessageThread.msgNew ? selectedMessageThread.msgNew : 0;
        let varFirstUnreadMessageId = 0;
        let id = chat.id;
        selectedMessageThread.unreadMessageId = varFirstUnreadMessageId;
        this.props.setFirstTimeThreadAPicallStatus(true);
        // Check if thread has more unread number of messages than per page limit or not?
        // If yes, Get the first unread message id and pass along with ajax_group_messages request
        if(unreadMessagesCount > this.props.page_per_limit){
            fetch('/ajax_get_first_user_unread_message/'+id)
            .then(data => data.json())
            .then(data => {
                if(data && data[0]){
                    varFirstUnreadMessageId = data[0].id;
                    this.setState({
                        firstUnreadMessageId: varFirstUnreadMessageId,
                    });
                    selectedMessageThread.unreadMessageId = varFirstUnreadMessageId;
                    if(currentSelectedIndex != null){
                        this.props.setUsersLastUnreadMessageId(currentSelectedIndex, varFirstUnreadMessageId);
                    }
                    this.fetchAndSetUserMessagesThreadCalled(chat, currentSelectedIndex, varFirstUnreadMessageId);
                } else {
                    this.fetchAndSetUserMessagesThreadCalled(chat, currentSelectedIndex, varFirstUnreadMessageId);
                }
            });
        } else {
            this.fetchAndSetUserMessagesThreadCalled(chat, currentSelectedIndex, varFirstUnreadMessageId);
        }
    }

    fetchAndSetUserMessagesThreadCalled(chat, currentSelectedIndex, firstUnreadMessageId){
        let id = chat.id;
        let that = this;
        if(id > 0){   // -1 for temp group that not stored in the database yet
            let formData = new FormData();
            formData.append('group', 'STAFF');
            formData.append('id', id);
            formData.append('pagelimit', this.props.page_per_limit);
            // formData.append('offset', 0);
            formData.append('firstUnreadMessageId', firstUnreadMessageId);
            formData.append('pagination', true);
            const requestOptions = {
                method: 'POST',
                body: formData
            };

            let markedReadPoint = false;
            fetch('/msg/ajax_filter_msg_group'+'?new_msg=true', requestOptions)
            .then(data => data.json())
            .then(data => {
                let conversations = [];
                let topMessageId = 0;
                let counter = 0;
                let lastMessageId = 0;
                Object.keys(data).forEach(function(key) {
                    if(counter == 0){
                        topMessageId = data[key]['detail']['id'];
                    }
                    if(!markedReadPoint && data[key]['outbound']==false && data[key]['detail']["confirmedAt"] == null ){
                        markedReadPoint = true;
                        conversations.push({ id : 33, customLabel:true, label: /*chat.msgNew+*/" New message(s)", customClass : "unreadLabel" });
                    }
                    if(data[key]['detail']["createdAt"]){

                    }
                    let messageData = {
                        id: data[key]['detail']['id'],
                        message: data[key]['detail']['text'],
                        time: data[key]['detail']['createdAt'],
                        userType: (data[key]['outbound']) ?"sender":"receiver",
                        sender : data[key]['from']['id'],
                        senderName : data[key]['from']['name'],
                        receiver : data[key]['to']['id'],
                        receiverName : data[key]['to']['name'],
                        //isImageMessage : (data[key]['detail']["image"]) ? true: false,
                        //imageMessage : (data[key]['detail']["image"]) ? [ { image : data[key]['detail']["image"] } ] : "",
                        //isFileMessage : false,
                        isImageMessage : (data[key]['detail']["image"] && imageFileType.indexOf(data[key]['detail']["file_ext"]) != -1) ? true: false,
                        imageMessage : (data[key]['detail']["image"] && imageFileType.indexOf(data[key]['detail']["file_ext"]) != -1) ? [ { image : data[key]['detail']["image"] } ] : "",
                        isFileMessage : (data[key]['detail']["image"] && imageFileType.indexOf(data[key]['detail']["file_ext"]) == -1) ? true: false,
                        fileMessage : (data[key]['detail']["image"] && imageFileType.indexOf(data[key]['detail']["file_ext"]) == -1) ? [ { image : data[key]['detail']["image"] } ] : ""
                    };
                    conversations.push(messageData);
                    lastMessageId = data[key]['detail']['id'];
                    counter++;
                });
                //if(Object.entries(conversations).toString() !== Object.entries(k2).toString())
                if(currentSelectedIndex != null && firstUnreadMessageId != 0){
                    this.props.setUsersLastUnreadMessageId(currentSelectedIndex, lastMessageId);
                }
                if(currentSelectedIndex != null && topMessageId != 0){
                    this.props.setUsersLastTopMessageId(currentSelectedIndex, topMessageId);
                }
                this.props.setMessagesThread(conversations, id);
                this.props.setFirstTimeThreadAPicallStatus(false);
            })
            .then(data => {
                setTimeout(function(){
                    var overlayEle = document.getElementById("overlay_thread");
                    if(typeof(overlayEle) != 'undefined' && overlayEle != null){
                        setTimeout(function(){ overlayEle.style.display = "none"; }, 10);
                    }
                }, 1000);
            })
            .then(data => {
                that.markThreadAsRead(chat);
            });
        }
    }

    fetchAndSetGroupMessagesThread(chat, currentSelectedIndex = null){
        let selectedMessageThread = currentSelectedIndex != null ? this.props.users[currentSelectedIndex] : this.props.users[this.props.active_user];
        let unreadMessagesCount = selectedMessageThread.unread ? selectedMessageThread.unread : 0;
        let id = chat.id;
        let my_user_1 =  this.props.my_user;
        let varFirstUnreadMessageId = 0;
        selectedMessageThread.unreadMessageId = varFirstUnreadMessageId;
        this.props.setFirstTimeThreadAPicallStatus(true);
        // Check if thread has more unread number of messages than per page limit or not?
        // If yes, Get the first unread message id and pass along with ajax_group_messages request
        if(unreadMessagesCount > this.props.page_per_limit){            
            fetch('/ajax_get_first_unread_message/'+id)
            .then(data => data.json())
            .then(data => {
                if(data && data[0]){
                    varFirstUnreadMessageId = data[0].id;
                    this.setState({
                        firstUnreadMessageId: varFirstUnreadMessageId,
                    });
                    selectedMessageThread.unreadMessageId = varFirstUnreadMessageId;
                    if(currentSelectedIndex != null){
                        this.props.setUsersLastUnreadMessageId(currentSelectedIndex, varFirstUnreadMessageId);
                    }
                    this.fetchAndSetGroupMessagesThreadCalled(chat, id, my_user_1, varFirstUnreadMessageId, currentSelectedIndex);
                } else {
                    this.fetchAndSetGroupMessagesThreadCalled(chat, id, my_user_1, varFirstUnreadMessageId, currentSelectedIndex);
                }
            });        
        } else {
            this.fetchAndSetGroupMessagesThreadCalled(chat, id, my_user_1, varFirstUnreadMessageId, currentSelectedIndex);
        }
    }

    fetchAndSetGroupMessagesThreadCalled(chat, id, my_user_1, firstUnreadMessageId, currentSelectedIndex){
        let that = this;
        if(id > 0){   // -1 for temp group that not stored in the database yet
            let markedReadPoint = false;
            fetch('/ajax_group_messages/'+id+'?new_msg=true&pagination=true&firstUnreadMessageId='+firstUnreadMessageId+'&pagelimit='+this.props.page_per_limit)
                .then(data => data.json())
                .then(data => {
                    let conversations = [];
                    let dataMessages = data.messages;
                    let members = data.members;
                    let priv = data.priv;
                    let lastMessageId = 0;
                    let topMessageId = 0;
                    Object.keys(dataMessages).forEach(function(key) {
                        if(!markedReadPoint && my_user_1 != dataMessages[key]['senderPhysician'] && dataMessages[key]['confirmedAt'] == null ){
                            markedReadPoint = true;
                            conversations.push({ id : 33, customLabel:true, label: /*chat.msgNew+*/" New message(s)", customClass : "unreadLabel" });
                        }
                        if(key == 0){
                            topMessageId = dataMessages[key]['id'];
                        }

                        let messageData = {
                            id: dataMessages[key]['id'],
                            message: dataMessages[key]['text'],
                            time: dataMessages[key]['createdAt'],
                            sender : dataMessages[key]['senderPhysician'],
                            senderName : dataMessages[key]['fullname'],
                            isImageMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) != -1) ? true: false,
                            imageMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) != -1) ? [ { image : "/getMsgImg/"+dataMessages[key]["id"]+"/"+dataMessages[key]["image"] } ] : "",
                            isFileMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) == -1) ? true: false,
                            fileMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) == -1) ? [ { image : "/getMsgImg/"+dataMessages[key]["id"]+"/"+dataMessages[key]["image"] } ] : ""
                        };
                        conversations.push(messageData);
                        lastMessageId = dataMessages[key]['id'];
                    });
                    if(currentSelectedIndex != null && firstUnreadMessageId != 0){
                        this.props.setUsersLastUnreadMessageId(currentSelectedIndex, lastMessageId);
                    }
                    if(currentSelectedIndex != null && topMessageId != 0){
                        this.props.setUsersLastTopMessageId(currentSelectedIndex, topMessageId);
                    }
                    this.props.loadGroup(conversations, members, priv, id);
                    this.props.setFirstTimeThreadAPicallStatus(false);
                })
                .then(data => {
                    setTimeout(function(){
                        var overlayEle = document.getElementById("overlay_thread");
                        if(typeof(overlayEle) != 'undefined' && overlayEle != null){
                            setTimeout(function(){ overlayEle.style.display = "none"; }, 10);
                        }
                    }, 1000);
                })
                .then(data => {
                    that.markThreadAsRead(chat);
                });
        }
    }

    markThreadAsRead(chat){
        let messages = chat.messages;
        if(messages.length > 0){
            let lastMessage = messages[messages.length - 1];
            let formData = new FormData();
            formData.append('id', lastMessage.id);
            const requestOptions = {
                method: 'POST',
                body: formData
            };
            fetch('/api.php/pm/markThreadRead', requestOptions)
                .then(data => data.json())
                .then(data => {
                    getMessageCounts();          //  Render notifications polling to reset header unread counter
                    this.props.pollChatData();
                });
        }
    }

    openUserChat(e, chat) {
        this.props.setTabOpenType("chats");
        e.preventDefault();
        this.props.setMessagesThread([], chat.id);

        //find index of current chat in array
        var index = this.props.recentChatList.indexOf(chat);
        // set activeUser
        this.props.activeUser(index);
        // Clear the last Top message array
        this.props.setUsersLastTopMessageId(index, 0 , true)
        if(chat.isGroup){
            this.fetchAndSetGroupMessagesThread(chat, index);
        }else {
            this.fetchAndSetUsersMessagesThread(chat, index);
        }

        // Set new thread is open true
        this.props.openNewThread(true);

        var chatList = document.getElementById("chat-list");
        var clickedItem = e.target;
        var currentli = null;

        if (chatList) {
            var li = chatList.getElementsByTagName("li");
            //remove coversation user
            for (var i = 0; i < li.length; ++i) {
                if (li[i].classList.contains('active')) {
                    li[i].classList.remove('active');
                }
            }
            //find clicked coversation user
            for (var k = 0; k < li.length; ++k) {
                if (li[k].contains(clickedItem)) {
                    currentli = li[k];
                    break;
                }
            }
        }

        //activation of clicked coversation user
        if (currentli) {
            currentli.classList.add('active');
        }

        var userChat = document.getElementsByClassName("user-chat");
        if (userChat[0] !== undefined) {
            userChat[0].classList.add("user-chat-show");
        }
        var overlayEle = document.getElementById("overlay_thread");
        if(chat.id > 0 && typeof(overlayEle) != 'undefined' && overlayEle != null){
            overlayEle.style.display = "block";
        }
        //removes unread badge if user clicks
        var unread = document.getElementById("unRead" + chat.id);
        if (unread) {
            unread.style.display = "none";
        }
    }

    render() {
        return (
            <React.Fragment>
                <div>
                    <div className="px-4 pt-4 thread_head">
                        <div className="user-chat-nav float-end" style={{display: "flex"}}>
                            <div id="mark-all-msg-read">
                                <AllMessagesRead />
                            </div>
                            <UncontrolledTooltip target="mark-all-msg-read" placement="bottom">
                                Read all messages
                            </UncontrolledTooltip>
                            <div id="create-chat">
                                <ContactsDialog recentChatList={this.props.recentChatList} />
                            </div>
                            <UncontrolledTooltip target="create-chat" placement="bottom">
                                Start new chat
                            </UncontrolledTooltip>
                        </div>
                        <h2 className="mb-3 px-3">Recent chats</h2>

                        <div className="px-2 pt-2 search-box chat-search-box" style={{ paddingTop: "18px !important"}}>
                            <InputGroup size="lg" className="mb-3 rounded-lg">
                                <span className="input-group-text text-muted bg-light pe-1 ps-3" id="basic-addon1">
                                    <i className="ri-search-line search-icon font-size-18"></i>
                                </span>
                                <Input type="text" value={this.state.searchChat} onChange={(e) => this.handleChange(e)} className="form-control bg-light left-search-box" placeholder="Search users" />
                            </InputGroup>
                        </div>
                        {/* Search Box */}
                    </div>

                    {/* Start chat-message-list  */}
                    <div className="px-2">
                        <SimpleBar style={{ maxHeight: "100%" }} className="chat-message-list">

                            <ul className="list-unstyled chat-list chat-user-list" id="chat-list">
                                {
                                    this.state.recentChatList.map((chat, key) =>
                                        <li key={key} id={"conversation" + key} className={chat.msgNew ? "unread" : chat.isTyping ? "typing" : key === this.state.active_user ? "active" : ""}>
                                            <Link to="#" onClick={(e) => this.openUserChat(e, chat)}>
                                                <div className="d-flex">
                                                    {
                                                        chat.id === "Null" ?
                                                            <div className={"chat-user-img " + chat.status + " align-self-center me-3 ms-0"}>
                                                                <div className="avatar-xs">
                                                                    <span className="avatar-title rounded-circle bg-soft-primary text-primary">
                                                                        {chat.name.charAt(0)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            :
                                                            <div className={"chat-user-img " + chat.status + " align-self-center me-3 ms-0"}>
                                                                <img src={(chat.isGroup === true) ? grp_img :"physicians/getPhysicianImg/"+chat.id} className="rounded-circle avatar-xs" alt="" />
                                                                {
                                                                    chat.isGroup === true? "" :
                                                                        <div style={{position: "absolute",top: "29px",right: "-4px"}}><ContactPresence args={[ {presence: chat.presence, id: chat.id, isCovered: chat.isCovered || chat.covId ? true : false} ]} /></div>
                                                                }
                                                            </div>
                                                    }

                                                    <div className="flex-1 overflow-hidden">
                                                        <h5 className="text-truncate font-size-15 mb-1" style={{ paddingRight: "5px" }}>{chat.name}</h5>
                                                        <p className="chat-user-message text-truncate mb-0">
                                                            {
                                                                chat.isTyping ?
                                                                    <>
                                                                        typing<span className="animate-typing">
                                                                            <span className="dot ms-1"></span>
                                                                            <span className="dot ms-1"></span>
                                                                            <span className="dot ms-1"></span>
                                                                        </span>
                                                                    </>
                                                                    :
                                                                    <>
                                                                        {
                                                                            chat.messages && (chat.messages.length > 0 && chat.messages[(chat.messages).length - 1].isImageMessage === true) ? <i className="ri-image-fill align-middle me-1"></i> : null
                                                                        }
                                                                        {
                                                                            chat.messages && (chat.messages.length > 0 && chat.messages[(chat.messages).length - 1].isFileMessage === true) ? <i className="ri-file-text-fill align-middle me-1"></i> : null
                                                                        }
                                                                        {chat.messages && chat.messages.length > 0 ? chat.messages[(chat.messages).length - 1].message : null}
                                                                    </>
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="font-size-11">{chat.messages && chat.messages.length > 0 ? (moment.utc(chat.messages[(chat.messages).length - 1].time).local().isSame(moment(), 'day') ? moment.utc(chat.messages[(chat.messages).length - 1].time).local().format(TODAY_TIME_FORMAT) : moment.utc(chat.messages[(chat.messages).length - 1].time).local().format(SIMPLE_DATE_ONLY_FORMAT))  : null}</div>

                                                    {chat.msgNew == 0 ? null :
                                                        <div className="unread-message" id={"unRead" + chat.id}>
                                                            <span className="badge badge-soft-danger rounded-pill">{ 1 || chat.messages && chat.messages.length > 0 ? chat.msgNew >= 20 ? chat.msgNew + "+" : chat.msgNew : ""}</span>
                                                        </div>
                                                    }
                                                </div>
                                            </Link>
                                        </li>
                                    )
                                }
                            </ul>
                        </SimpleBar>

                    </div>
                    {/* End chat-message-list */}
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { active_user, users, tabOpenBy, my_user, page_per_limit, usersLastUnreadMessageId } = state.secureText.Chat;
    const { isNewThreadOpen, activeTab } = state.secureText.Layout;
    return { ...state.secureText.Chat, active_user, users, isNewThreadOpen, tabOpenBy, activeTab, my_user, page_per_limit, usersLastUnreadMessageId };
};

export default connect(mapStateToProps, { setconversationNameInOpenChat, activeUser, fetchConversations, setMessagesThread, pollChatData, loadGroup, openNewThread, setTabOpenType, setUsersLastUnreadMessageId, setFirstTimeThreadAPicallStatus, setUsersLastTopMessageId })(Chats);