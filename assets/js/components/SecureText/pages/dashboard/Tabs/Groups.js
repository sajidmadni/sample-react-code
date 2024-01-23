import React, { Component } from 'react';
import { UncontrolledTooltip, Input, InputGroup, Badge } from 'reactstrap';
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { withTranslation } from 'react-i18next';
import grp_img from '../../../../../../images/group_img.png'

//simple bar
import SimpleBar from "simplebar-react";
//components
import ContactsDialog from './../../../components/ContactsDialog';
import AllMessagesRead from '../../../components/AllMessagesRead';
//actions
import {
    createGroup,
    createTempGroup,
    setActiveTab,
    activeUser,
    fetchGroups,
    activeGroup,
    createTempSingleChat,
    setGroupMessagesThread,
    setTabOpenType,
    loadGroup,
    setUsersLastUnreadMessageId,
    setFirstTimeThreadAPicallStatus,
    setUsersLastTopMessageId
} from "../../../../../redux/SecureText/actions";
import {USE_TIME_FORMAT} from "../../../../../constants/general";

class Groups extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            isOpenCollapse: true,
            groups: this.props.groups,
            selectedContact: [],
            isOpenAlert: false,
            message: "",
            groupName: "",
            groupDesc: "",
            isGroupBtn: 0,
            displayGroup: "none",
            groupBtnLabel: "Create Group",
            //modalBtnLabel: modelBtnSingleMessageText,
            modalBtnLabel: "Initiate Chat",
            loading: true,
            searchContacts: false,
            searchKeywords: "",
            isFirstTimePageLoad: true,
            searchedGroupsList: this.props.groups,
            my_user: this.props.my_user,
        }
        this.toggle = this.toggle.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleChangeGroupName = this.handleChangeGroupName.bind(this);
        this.handleChangeGroupDesc = this.handleChangeGroupDesc.bind(this);
        this.checkGroupExistsInContacts = this.checkGroupExistsInContacts.bind(this);
        this.handleGroupSearch = this.handleGroupSearch.bind(this);
    }

    toggle() {
        this.setState({ modal: !this.state.modal });
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({
                groups: this.props.groups,
                isGroupBtn: this.props.isGroupBtn,
                selectedContact: this.props.selectedContact,
                loading: this.props.loading,
                searchContacts: this.props.searchContacts,
                isFirstTimePageLoad: this.props.isFirstTimePageLoad
            });
            if(prevProps.activeTab != this.props.activeTab){
                this.setState({
                    searchKeywords: ""
                });
                this.props.activeGroup(-1);
            }
            this.applySearchOnState();
        }
    }

    createGroup() {
        let isSingleContactGroup = false;
        if (this.state.selectedContact.length === 1) {
            let contactInitialName = this.state.selectedContact[0].id.substring(0, 2);
            if(contactInitialName === "AG" || contactInitialName === "AD"){
                isSingleContactGroup = true;
            }
        }

        if (this.state.selectedContact.length === 0) {
            this.setState({message: "Please select at least one contact!", isOpenAlert: true});
        } else if (this.state.selectedContact.length === 1 && isSingleContactGroup === false) {       // Send Single User Message
            let contactObj = this.state.selectedContact[0];
            var obj = {
                id: contactObj.id,
                name: contactObj.name,
                profilePicture: "Null",
                isGroup: false,
                unRead: 0,
                isNew: true,
                desc: this.state.groupDesc,
                members: this.state.selectedContact,
                saved: false,
                lastMessage: null,
                msgNew: 0,
                unread: 0,
                messages: []
            }
            this.props.createTempSingleChat(obj);
            this.toggle();
            this.props.setActiveTab('chat');
            this.props.activeUser(0);

        } else if (this.state.selectedContact.length === 1 && isSingleContactGroup === true) {          // Send group message
            let contactObj = this.state.selectedContact[0];
            // Create group message here
            var obj = {
                //groupId: this.state.groups.length + 1,
                id: -1,
                name: contactObj.name,
                profilePicture: "Null",
                isGroup: true,
                unRead: 0,
                isNew: true,
                desc: this.state.groupDesc,
                members: this.state.selectedContact,
                saved: false,
                lastMessage: null,
                msgNew: 0,
                unread: 0,
                messages: []
            }
            //call action for creating a group
            //this.props.createGroup(obj);
            this.props.createTempGroup(obj);
            this.toggle();
            this.props.setActiveTab('chat');
            this.props.activeUser(0);
        } else if (this.state.selectedContact.length > 1) {         // Send group message
            //fetchAndSetUsersMessagesThread
            // Create group message here
            var obj = {
                //groupId: this.state.groups.length + 1,
                id: -1,
                name: "Temp Group",
                profilePicture: "Null",
                isGroup: true,
                unRead: 0,
                isNew: true,
                desc: this.state.groupDesc,
                members: this.state.selectedContact,
                saved: false,
                lastMessage: null,
                msgNew: 0,
                unread: 0,
                messages: []
            }
            //call action for creating a group
            //this.props.createGroup(obj);
            this.props.createTempGroup(obj);
            this.toggle();
            this.props.setActiveTab('chat');
            this.props.activeUser(0);
        }

        setTimeout(
            function () {
                this.setState({ isOpenAlert: false });
            }
                .bind(this),
            3000
        );
    }

    deleteContact(id, e){
        let selected = this.state.selectedContact;
        let readjustData = $.grep(selected, function(e){
            return e.id != id;
        });
        this.setState({ selectedContact: readjustData });
        // Uncheck checkbox
        $("#memberCheck"+id).prop("checked", false);
    }

    handleCheck(e, contactId, getPresence) {
        if(this.state.selectedContact === undefined){
            var selected = [];
        } else {
            var selected = this.state.selectedContact;
        }

        var obj;
        if (e.target.checked) {
            obj = {
                id: contactId,
                name: e.target.value,
                presence: getPresence
            };
            selected.push(obj);
            this.setState({ selectedContact: selected });
            this.changeButtonLabel(selected);
        } else {
            let readjustData = $.grep(selected, function(e){
                return e.id != contactId;
            });
            this.setState({ selectedContact: readjustData });
            this.changeButtonLabel(readjustData);
        }
    }

    changeButtonLabel(selectedContacts){
    }

    checkGroupExistsInContacts(contacts){
        let isGroupExists = false;
        $.each( contacts, function( index, value ){
            if($.isNumeric(value.id) === false){
                isGroupExists = true;
                return isGroupExists;
            }
        });
        return isGroupExists;
    }

    handleChangeGroupName(e) {
        this.setState({ groupName: e.target.value });
    }

    handleChangeGroupDesc(e) {
        this.setState({ groupDesc: e.target.value });
    }

    componentDidMount() {
        this.props.fetchGroups();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.groups !== nextProps.groups) {
            this.setState({
                searchedGroupsList: nextProps.groups,
            });
        }

    }

    handleGroupSearch (e) {
        this.setState({ searchKeywords: e.target.value });
        var search = e.target.value;
        this.applySearchOnState(search);
        if (search === "") this.setState({ searchedGroupsList: this.state.groups })
    }

    applySearchOnState(search=""){
        if(search==""){
            search = this.state.searchKeywords;
        }else if(search=="EMPTY"){
            search = "";
        }
        let conversation = this.state.groups;

        if(conversation && search){
            let filteredArray = [];
            //find conversation name from array
            for (let i = 0; i < conversation.length; i++) {
                if (conversation[i].name.toLowerCase().includes(search.toLowerCase()))
                    filteredArray.push(conversation[i]);
            }

            //set filtered items to state
            this.setState({
                searchedGroupsList: filteredArray
            });
        }
    }

    setGroupMessages(group){
        let id = group.id;
        let my_user_1 =  this.props.my_user;
        let firstUnreadMessageId = 0;
        let lastMessageId = 0;
        let topMessageId = 0;
        let currentSelectedIndex = 0;
        fetch('/ajax_group_messages/'+id+'?new_msg=true&pagination=true&firstUnreadMessageId='+firstUnreadMessageId+'&pagelimit='+this.props.page_per_limit)
            .then(data => data.json())
            .then(data => {
                let conversations = [];
                let dataMessages = data.messages;
                let members = data.members;
                let priv = data.priv;
                let owner = data.owner;
                let markedReadPoint = false;
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
                        fileMessage : (dataMessages[key]["image"] && imageFileType.indexOf(dataMessages[key]["file_ext"]) == -1) ? [ { image : "/getMsgImg/"+dataMessages[key]["id"]+"/"+dataMessages[key]["image"] } ] : "",
                        isGroup: true,
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
                this.props.loadGroup(conversations, members, priv, id, owner);
                this.props.setFirstTimeThreadAPicallStatus(false);
            })
            .then(data => {
                setTimeout(function(){
                    var overlayEle = document.getElementById("overlay_thread");
                    if(typeof(overlayEle) != 'undefined' && overlayEle != null){
                        setTimeout(function(){ overlayEle.style.display = "none"; }, 10);
                    }
                }, 1000);
            });
    }

    openGroupChat(e, group) {
        this.props.setTabOpenType("groups");
        e.preventDefault();
        this.props.setGroupMessagesThread([], group.id);
        this.setGroupMessages(group);


        //find index of current chat in array
        var index = this.props.groups.indexOf(group);
        // set activeUser
        this.props.activeGroup(-1);
        this.props.activeGroup(index);

        // Clear the last Top message array
        this.props.setUsersLastTopMessageId(index, 0 , true)

        var chatList = document.getElementById("group-chat-list");
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
        if (userChat.length > 1) {
            userChat[0].classList.add("user-chat-show");
        }
        var overlayEle = document.getElementById("overlay_thread");
        if(typeof(overlayEle) != 'undefined' && overlayEle != null){
            overlayEle.style.display = "block";
        }

    }

    render() {
        const { t } = this.props;

        return (
            <React.Fragment>
                <div>
                    <div className="p-4 thread_head">
                        <div className="user-chat-nav float-end" style={{display: "flex"}}>
                            <div id="create-group">
                                <ContactsDialog recentChatList={this.props.recentChatList} />
                            </div>
                            <UncontrolledTooltip target="create-group" placement="bottom">
                                Start group chat
                            </UncontrolledTooltip>

                        </div>
                        <h2 className="mb-3 px-3">Groups</h2>
                        {/* Start add group Modal */}
                        
                        {/* End add group Modal */}
                        <div className="px-2 pt-2 search-box chat-search-box">
                            <InputGroup size="lg" className="mb-3 rounded-lg">
                                <span className="input-group-text text-muted bg-light pe-1 ps-3" id="basic-addon1">
                                    <i className="ri-search-line search-icon font-size-18"></i>
                                </span>
                                <Input type="text" value={this.state.searchKeywords}  onChange={(e) => this.handleGroupSearch(e)} className="form-control bg-light left-search-box" placeholder="Search groups" />
                            </InputGroup>
                        </div>
                    </div>

                    {/* Start chat-group-list */}
                    <SimpleBar style={{ maxHeight: "100%" }} className="chat-message-list chat-group-list">
                        {
                                this.state.searchedGroupsList.length > 0 ?
                                    <div >
                                        <ul className="list-unstyled chat-list" id="group-chat-list">
                                            {
                                                this.state.searchedGroupsList.map((group, key) =>
                                                    <li key={key} >
                                                        <Link to="#" onClick={(e) => this.openGroupChat(e, group)}>
                                                            <div className="d-flex align-items-center">
                                                                <div className="chat-user-img me-3 ms-0">
                                                                    <div className="avatar-xs">
                                                                        <div className="chat-user-img online align-self-center me-3 ms-0">
                                                                            <img src={grp_img} className="rounded-circle avatar-xs" alt="" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 overflow-hidden">
                                                                    <h5 className="text-truncate font-size-14 mb-0">
                                                                        {group.name}
                                                                        {
                                                                            group.unRead !== 0
                                                                                ? <Badge color="none" pill className="badge-soft-danger float-end">
                                                                                    {
                                                                                        group.unRead >= 20 ? group.unRead + "+" : group.unRead
                                                                                    }
                                                                                </Badge>
                                                                                : null
                                                                        }

                                                                        {
                                                                            group.isNew && <Badge color="none" pill className="badge-soft-danger float-end">New</Badge>
                                                                        }

                                                                    </h5>
                                                                    <p className="chat-user-message text-truncate mb-0">
                                                                        {
                                                                            group.isTyping ?
                                                                                <>
                                                                                    typing<span className="animate-typing">
                                                                                        <span className="dot ms-1"></span>
                                                                                        <span className="dot ms-1"></span>
                                                                                        <span className="dot ms-1"></span></span>
                                                                                </>
                                                                                :
                                                                                <>
                                                                                    {
                                                                                        group.messages && (group.messages.length > 0 && group.messages[(group.messages).length - 1].isImageMessage === true) ? <i className="ri-image-fill align-middle me-1"></i> : null
                                                                                    }
                                                                                    {
                                                                                        group.messages && (group.messages.length > 0 && group.messages[(group.messages).length - 1].isFileMessage === true) ? <i className="ri-file-text-fill align-middle me-1"></i> : null
                                                                                    }
                                                                                    {group.messages && group.messages.length > 0 ? group.messages[(group.messages).length - 1].message : null}
                                                                                </>
                                                                        }
                                                                     </p>
                                                                </div>
                                                                <div className="font-size-11">{group.messages && group.messages.length > 0 ? moment.utc(group.messages[(group.messages).length - 1].time).local().format(USE_TIME_FORMAT)  : null}</div>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                )
                                            }
                                        </ul>
                                    </div>
                                    : <div className="p-5">No group found</div>
                        }
                    </SimpleBar>
                    {/* End chat-group-list */}
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { groups, active_user, tabOpenBy, my_user, page_per_limit, usersLastUnreadMessageId } = state.secureText.Chat;
    const { activeTab } = state.secureText.Layout;

    return { groups, active_user, tabOpenBy, activeTab, my_user, page_per_limit, usersLastUnreadMessageId };
};

export default connect(mapStateToProps, { createGroup, createTempGroup, setActiveTab, activeUser, fetchGroups, activeGroup, createTempSingleChat, setGroupMessagesThread, setTabOpenType, loadGroup, setUsersLastUnreadMessageId, setFirstTimeThreadAPicallStatus, setUsersLastTopMessageId })(Groups);