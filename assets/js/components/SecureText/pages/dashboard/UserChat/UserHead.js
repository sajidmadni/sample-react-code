import React, {useEffect, useState} from 'react';
import { Button, Row, Col, Modal, ModalBody } from "reactstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import {
    clearFromRecentChatList,
    loadGroup,
    openUserSidebar, removeGroupFromList,
    setFullUser,
    updateTempGroup
} from "../../../../../redux/SecureText/actions";

//import images
import grp_img from '../../../../../../images/group_img.png'
import ContactPresence from "../../../components/ContactPresence";
import AddGroupMemberDialog from "../../../components/AddGroupMemberDialog";
import ContactsDialog from './../../../components/ContactsDialog';

function UserHead(props) {
    const [GroupSavemodal, setGroupSaveModal] = useState(false);
    const [GroupLeavemodal, setGroupLeaveModal] = useState(false);
    const [Clearmodal, setClearModal] = useState(false);
    const [showGroupNameEmptyError, setShowGroupNameEmptyError] = useState(false);
    const [saveGroupErrorMessage, setSaveGroupErrorMessage] = useState("");
    const imageFileType = ["jpeg", "png", "jpg"];

    const toggleGroupSaveModal = () => setGroupSaveModal(!GroupSavemodal);
    const toggleGroupLeaveModal = () => setGroupLeaveModal(!GroupLeavemodal);
    const toggleClearModal = () => setClearModal(!Clearmodal);

    function setGroupMessages(group){
        let id = group.id;
        console.log("Get user caht in user head js file");
        let makeQueryString = "&pagelimit="+props.page_per_limit+"&topMessageId=0&pagination=true";
        fetch('/ajax_group_messages/'+id+'?new_msg=true'+makeQueryString)
            .then(data => data.json())
            .then(data => {
                let conversations = [];
                let dataMessages = data.messages;
                let members = data.members;
                let priv = data.priv;
                let owner = data.owner;
                Object.keys(dataMessages).forEach(function(key) {
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
                });
                props.loadGroup(conversations, members, priv, id, owner);
            });
    }

    function fetchAndSetGroupThread(group){
        let id = group.id;
        if(id > 0){
            setGroupMessages(group);
        }
    }
    
    const openUserSidebar = (e) => {
        e.preventDefault();
        props.openUserSidebar();
    }

    function closeUserChat(e) {
        e.preventDefault();
        var userChat = document.getElementsByClassName("user-chat");
        if (userChat) {
            userChat[0].classList.remove("user-chat-show");
        }
    }

    function deleteMessage() {
        let allUsers = props.users;
        let copyallUsers = allUsers;
        copyallUsers[props.active_user].messages = [];

        props.setFullUser(copyallUsers);
    }

    function saveGroup(e) {
        e.preventDefault();
        var sgName = $("#save_group_name").val().trim();
        if(sgName.length==0) {
            setShowGroupNameEmptyError(true);
            setSaveGroupErrorMessage("Not a valid group name.")
        } else if(sgName.length > 50) {
            setShowGroupNameEmptyError(true);
            setSaveGroupErrorMessage("Please keep the group name length to 50 characters or less")
        } else {
            setShowGroupNameEmptyError(false);
            setSaveGroupErrorMessage("")
            let id = $("#current_group_sel").val();
            var r = "/ajax_save_group/"+id;
            $.post(
                r,
                "name="+sgName,
                function(data) {
                            if(data.error == 1){
                                alert("Error saving group");
                                return;
                            }

                        toggleGroupSaveModal();
                        $("#conversation"+props.active_user+" h5").html(sgName);
                        $(".user-chat .user-profile-show").text(sgName);
                        $(".user-profile-sidebar h5:first").text(sgName);
                        if ($(".nav-btn.save-group-chat").length) {
                            $(".nav-btn.save-group-chat").remove();
                        }
                 },
                "json");
        }
    }

    function editGroup(e){
        e.preventDefault();
        var currName = props.users[props.active_user].name;
        toggleGroupSaveModal();
        setTimeout(function(){
            $("#save_group_name").val(currName);
        }, 1000);
    }

    function leaveGroup(e){
        e.preventDefault();
        let id = $("#current_group_sel").val();
        var r = "/ajax_group_leave/"+id;

        $.getJSON(r, function (data) {
            if (data.status === 1) {
                props.removeGroupFromList(props.users[props.active_user].id);
                toggleGroupLeaveModal();
            } else {
                alert('You cannot leave this group.');
            }
        });
    }

    function clearChat(e){
        e.preventDefault();
        let id = props.users[props.active_user].id;
        if(id < 0){
            props.clearFromRecentChatList(props.users[props.active_user].id);
            toggleClearModal();
        }else{
            let removedContacts = JSON.parse(localStorage.getItem('user_'+props.my_user));
            if(!removedContacts){
                removedContacts = [];
            }
            removedContacts.push(id);
            localStorage.setItem('user_'+props.my_user, JSON.stringify(removedContacts));
            removedContacts = JSON.parse(localStorage.getItem('user_'+props.my_user));
            if(removedContacts.indexOf(id) >= 0){
                props.clearFromRecentChatList(props.users[props.active_user].id);
                toggleClearModal();
            }
        }
    }

    const handleGroupNameKeyUp = (e) => {
        var groupNamevalue = e.target.value.trim()
        groupNamevalue = groupNamevalue.length;
        if(groupNamevalue == ""){
            setShowGroupNameEmptyError(true);
            setSaveGroupErrorMessage("Not a valid group name.");
        } else if(groupNamevalue > 50) {
            setShowGroupNameEmptyError(true);
            setSaveGroupErrorMessage("Please keep the group name length to 50 characters or less");
        } else {
            setShowGroupNameEmptyError(false);
            setSaveGroupErrorMessage("")
        }
    }

    return (
        <React.Fragment>
            <div className="p-3 p-lg-4 border-bottom">
                <Row className="align-items-center">
                    <Col sm={4} xs={8}>
                        <div className="d-flex align-items-center">
                            <div className="d-block d-lg-none me-2 ms-0">
                                <Link to="#" onClick={(e) => closeUserChat(e)} className="user-chat-remove text-muted font-size-16 p-2">
                                    <i className="ri-arrow-left-s-line"></i></Link>
                            </div>
                            {
                                props.users[props.active_user].profilePicture !== "Null" ?
                                    <div className="me-3 ms-0">
                                        <img src={ (props.users[props.active_user].isGroup === true) ? grp_img :"physicians/getPhysicianImg/"+props.users[props.active_user].id } className="rounded-circle avatar-xs" alt="" />
                                        {
                                            props.users[props.active_user].isGroup === true? "" :
                                                <div style={{position:"absolute",top:"27px",left:"42px"}}><ContactPresence args={[ {presence: props.users[props.active_user].presence, id: props.users[props.active_user].id, isCovered: props.users[props.active_user].isCovered || props.users[props.active_user].covId ? true : false} ]} /></div>
                                        }
                                    </div>
                                    : <div className="chat-user-img align-self-center me-3">
                                        <div className="avatar-xs">
                                            <span className="avatar-title rounded-circle bg-soft-primary text-primary">
                                                {props.users[props.active_user].name.charAt(0)}
                                            </span>
                                        </div>
                                    </div>
                            }

                            <div className="flex-1 overflow-hidden">
                                <h5 className="font-size-16 mb-0 text-truncate">
                                    <Link to="#" onClick={(e) => openUserSidebar(e)} className="text-reset user-profile-show">
                                        {props.users[props.active_user].name}
                                    </Link>
                                </h5>
                            </div>
                        </div>
                    </Col>
                    <Col sm={8} xs={4} >
                            {
                                (props.users[props.active_user].isGroup === true) ?
                                        <ul className="list-inline user-chat-nav text-end mb-0">
                                            <li className="list-inline-item  d-lg-inline-block">
                                                <Button type="button" title="View Group Details" color="none" onClick={(e) => openUserSidebar(e)} className="nav-btn group-profile-show">
                                                    <i className="ri-group-line"></i>
                                                </Button>
                                                <input type="hidden" id="current_group_sel" value={props.users[props.active_user].id} />
                                            </li>
                                            {
                                                (props.users[props.active_user].priv && props.users[props.active_user].priv.add) &&
                                                    <li className="list-inline-item  d-lg-inline-block">
                                                        <AddGroupMemberDialog
                                                            fetchAndSetGroupThread={fetchAndSetGroupThread}
                                                        />
                                                    </li>
                                            }
                                            {
                                                (!props.users[props.active_user].saved && props.users[props.active_user].id > 0) &&
                                                    <li className="list-inline-item  d-lg-inline-block">
                                                        <Button type="button"  title="Save Group" color="none" onClick= {toggleGroupSaveModal}  className="nav-btn save-group-chat">
                                                            <i className="ri-save-3-fill"></i>
                                                        </Button>
                                                    </li>
                                            }
                                            {
                                                (props.users[props.active_user].priv && props.users[props.active_user].priv.rename && props.users[props.active_user].id > 0) &&
                                                    <li className="list-inline-item  d-lg-inline-block">
                                                        <Button type="button" title="Edit Group" color="none" onClick={(e) => editGroup(e)}  className="nav-btn edit-group-chat">
                                                            <i className="ri-edit-box-line"></i>
                                                        </Button>
                                                    </li>
                                            }
                                            {
                                                (props.users[props.active_user].priv && props.users[props.active_user].priv.leave && props.users[props.active_user].members && props.users[props.active_user].members.length > 1 && props.users[props.active_user].id > 0) &&
                                                    <li className="list-inline-item  d-lg-inline-block">
                                                        <Button type="button" title="Leave Group" color="none" onClick={toggleGroupLeaveModal} className="nav-btn leave-group-chat">
                                                            <i className="ri-logout-box-r-line"></i>
                                                        </Button>
                                                    </li>
                                            }
                                            {
                                                (props.activeTab == "chat") &&
                                                    <li className="list-inline-item  d-lg-inline-block">
                                                        <Button type="button" title="Clear" color="none" onClick={toggleClearModal} className="nav-btn delete-user-chat">
                                                            <i className="ri-delete-bin-line"></i>
                                                        </Button>
                                                    </li>
                                            }
                                        </ul>
                                        :
                                        <ul className="list-inline user-chat-nav text-end mb-0">
                                            <li className="list-inline-item d-lg-inline-block">
                                                <Button type="button" title="View Profile" color="none" onClick={(e) => openUserSidebar(e)} className="nav-btn user-profile-show">
                                                    <i className="ri-user-2-line"></i>
                                                </Button>
                                            </li>
                                            {
                                                <li className="list-inline-item d-lg-inline-block">
                                                    <ContactsDialog recentChatList={props.users} selectedContact={[{id: props.users[props.active_user].id, name: props.users[props.active_user].name, presence: props.users[props.active_user].presence }]} isFromSingleThread={true}/>
                                                </li>
                                            }

                                            {
                                                (props.activeTab == "chat") &&
                                                <li className="list-inline-item d-lg-inline-block">
                                                    <Button type="button" title="Clear" color="none" onClick={toggleClearModal} className="nav-btn delete-user-chat">
                                                        <i className="ri-delete-bin-line"></i>
                                                    </Button>
                                                </li>
                                            }

                                        </ul>
                                    }
                    </Col>
                </Row>
            </div>

            {/* save group Modal */}
            <Modal tabIndex="-1" isOpen={GroupSavemodal} toggle={toggleGroupSaveModal} centered>
                <ModalBody>
                    <div className="text-left p-4">
                        <h4 className="text-truncate">Please enter a name for the group.</h4>
                        <h4 className="text-truncate">* It should not be more than 50 characters in length.</h4>
                        <div className="mt-5">
                            <input id="save_group_name" name="save_group_name" onKeyUp={handleGroupNameKeyUp} />
                            {
                                showGroupNameEmptyError ? <span style={{ color: "red", fontSize: "12px" }}><br />{saveGroupErrorMessage}</span> : ""
                            }
                        </div>
                        <div style={{ marginTop: "2rem" }}>
                            <ul className="list-inline mb-1">
                                <li className="list-inline-item px-2 me-2 ms-0">
                                    <button type="button" className="btn btn-danger avatar-sm rounded-circle" onClick={toggleGroupSaveModal}>
                                        <span className="avatar-title bg-transparent font-size-20">
                                            <i className="ri-close-fill"></i>
                                        </span>
                                    </button>
                                </li>
                                <li className="list-inline-item px-2">
                                    <button type="button" onClick={(e) => saveGroup(e)} className="btn btn-success avatar-sm rounded-circle">
                                        <span className="avatar-title bg-transparent font-size-20">
                                            <i className="ri-check-line"></i>
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </ModalBody>
            </Modal>

            {/* Leave group Modal */}
            <Modal tabIndex="-1" isOpen={GroupLeavemodal} toggle={toggleGroupLeaveModal} centered>
                <ModalBody>
                    <div className="text-left p-4">
                        <h4 className="text-truncate">Are you sure you want to leave this conversation?</h4>
                        <div className="mt-5">
                            <ul className="list-inline mb-1">
                                <li className="list-inline-item px-2 me-2 ms-0">
                                    <button type="button" className="btn btn-danger avatar-sm rounded-circle" onClick={toggleGroupLeaveModal}>
                                        <span className="avatar-title bg-transparent font-size-20">
                                            <i className="ri-close-fill"></i>
                                        </span>
                                    </button>
                                </li>
                                <li className="list-inline-item px-2">
                                    <button type="button" onClick={(e) => leaveGroup(e)} className="btn btn-success avatar-sm rounded-circle">
                                        <span className="avatar-title bg-transparent font-size-20">
                                            <i className="ri-check-line"></i>
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </ModalBody>
            </Modal>

            {/* Clear group Modal */}
            <Modal tabIndex="-1" isOpen={Clearmodal} toggle={toggleClearModal} centered>
                <ModalBody>
                    <div className="text-left p-4">
                        <h4 className="text-truncate">Are you sure you want to delete this conversation?</h4>
                        <div className="mt-5">
                            <ul className="list-inline mb-1">
                                <li className="list-inline-item px-2 me-2 ms-0">
                                    <button type="button" className="btn btn-danger avatar-sm rounded-circle" onClick={toggleClearModal}>
                                        <span className="avatar-title bg-transparent font-size-20">
                                            <i className="ri-close-fill"></i>
                                        </span>
                                    </button>
                                </li>
                                <li className="list-inline-item px-2">
                                    <button type="button" onClick={(e) => clearChat(e)} className="btn btn-success avatar-sm rounded-circle">
                                        <span className="avatar-title bg-transparent font-size-20">
                                            <i className="ri-check-line"></i>
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
}


const mapStateToProps = (state) => {
    let { users, active_user, groups, active_group, my_user, page_per_limit } = state.secureText.Chat;
    const { activeTab } = state.secureText.Layout;
    if(activeTab == "group"){
        users = groups;
        active_user = active_group;
    }

    return { ...state.secureText.Layout, users, active_user, activeTab, my_user, page_per_limit };
};

export default connect(mapStateToProps, { openUserSidebar, setFullUser, updateTempGroup, removeGroupFromList, clearFromRecentChatList, loadGroup})(UserHead);