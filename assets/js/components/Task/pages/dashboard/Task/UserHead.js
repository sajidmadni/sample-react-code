import React, { useState } from 'react';
import { Dropdown, DropdownMenu, DropdownItem, DropdownToggle, Button, Input, Row, Col, Modal, ModalBody } from "reactstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { openUserSidebar, setFullUser } from "../../../../../redux/SecureText/actions";

//import images
import user from '../../../../../../images/users/avatar-4.jpg'
import grp_img from '../../../../../../images/group_img.png'

function UserHead(props) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownOpen1, setDropdownOpen1] = useState(false);
    const [Callmodal, setCallModal] = useState(false);
    const [Videomodal, setVideoModal] = useState(false);
    const [GroupSavemodal, setGroupSaveModal] = useState(false);

    const toggle = () => setDropdownOpen(!dropdownOpen);
    const toggle1 = () => setDropdownOpen1(!dropdownOpen1);
    const toggleCallModal = () => setCallModal(!Callmodal);
    const toggleVideoModal = () => setVideoModal(!Videomodal);
    const toggleGroupSaveModal = () => setGroupSaveModal(!GroupSavemodal);

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

    function saveGroup() {
        var sgName = $("#save_group_name").val();
        if(sgName.length==0) {
            alert("Not Valid Group Name");
        } else if(sgName.length > 50) {
            alert("Please keep the group name length to 50 characters or less.\n");
        } else {
            var ele = $(this);
            var id = $(this).attr('data-id');
            var r="{{path('ajax_save_group',{'id':'id1'})}}";
            r = r.replace('id1', id);
            $.post(r, "name="+sgName, function(data) {
                if(data.error == 1){
                    alert("Error saving group");
                    return;
                }
                ele.parent().parent().parent().remove();
                var renameto = $('#groupContactItemTemplate').clone().html().format(id,sgName,1,"",10);
                $('#GROUPS').children().append(renameto);
                $('.editSClass').unbind("click").on("click", editGroup);

                currentThreadId=id;
                if(State('getTab','')==="STAFF"){
                    getRecentStaffContacts();
                    currentThreadId="AL"+currentThreadId;
                }
                showConversation(currentThreadId, 'true');
                msgHeaderContainer.find('h3').html(sgName);
            }, "json");
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
                                    {(() => {
                                        switch (props.users[props.active_user].status) {
                                            case "online":
                                                return (
                                                    <>
                                                        <i className="ri-record-circle-fill font-size-10 text-success d-inline-block ms-1"></i>
                                                    </>
                                                )

                                            case "away":
                                                return (
                                                    <>
                                                        <i className="ri-record-circle-fill font-size-10 text-warning d-inline-block ms-1"></i>
                                                    </>
                                                )

                                            case "offline":
                                                return (
                                                    <>
                                                        <i className="ri-record-circle-fill font-size-10 text-secondary d-inline-block ms-1"></i>
                                                    </>
                                                )

                                            default:
                                                return;
                                        }
                                    })()}

                                </h5>
                            </div>
                        </div>
                    </Col>
                    <Col sm={8} xs={4} >

                           {/* <li className="list-inline-item">
                                <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                                    <DropdownToggle color="none" className="btn nav-btn " type="button">
                                        <i className="ri-search-line"></i>
                                    </DropdownToggle>
                                    <DropdownMenu className="p-0 dropdown-menu-end dropdown-menu-md">
                                        <div className="search-box p-2">
                                            <Input type="text" className="form-control bg-light border-0" placeholder="Search.." />
                                        </div>
                                    </DropdownMenu>
                                </Dropdown>
                            </li>*/}
                            {/*<li className="list-inline-item d-none d-lg-inline-block me-2 ms-0">
                                <button type="button" onClick={toggleCallModal} className="btn nav-btn" >
                                    <i className="ri-phone-line"></i>
                                </button>
                            </li>*/}
                            {/*<li className="list-inline-item d-none d-lg-inline-block me-2 ms-0">
                                <button type="button" onClick={toggleVideoModal} className="btn nav-btn">
                                    <i className="ri-vidicon-line"></i>
                                </button>
                            </li>*/}

                            {
                                (props.users[props.active_user].isGroup === true) ?
                                        <ul className="list-inline user-chat-nav text-end mb-0">
                                            <li className="list-inline-item d-none d-lg-inline-block">
                                                <Button type="button" title="View Group Details" color="none" onClick={(e) => openUserSidebar(e)} className="nav-btn group-profile-show">
                                                    <i className="ri-group-line"></i>
                                                </Button>
                                            </li>
                                            {
                                                (!props.users[props.active_user].saved) &&
                                                    <li className="list-inline-item d-none d-lg-inline-block">
                                                        <Button type="button"  title="Save Group" color="none" onClick= {toggleGroupSaveModal}  className="nav-btn save-group-chat">
                                                            <i className="ri-save-3-fill"></i>
                                                        </Button>
                                                    </li>
                                            }
                                            {
                                                (props.users[props.active_user].priv && props.users[props.active_user].priv.rename) &&
                                                    <li className="list-inline-item d-none d-lg-inline-block">
                                                        <Button type="button" title="Edit Group" color="none" onClick={(e) => deleteMessage(e)} className="nav-btn edit-group-chat">
                                                            <i className="ri-edit-box-line"></i>
                                                        </Button>
                                                    </li>
                                            }
                                            {
                                                (props.users[props.active_user].priv && props.users[props.active_user].priv.leave) &&
                                                    <li className="list-inline-item d-none d-lg-inline-block">
                                                        <Button type="button" title="Leave Group" color="none" onClick={(e) => deleteMessage(e)} className="nav-btn leave-group-chat">
                                                            <i className="ri-logout-box-r-line"></i>
                                                        </Button>
                                                    </li>
                                            }
                                            {
                                                (props.users[props.active_user].priv && props.users[props.active_user].priv.remove) &&
                                                    <li className="list-inline-item d-none d-lg-inline-block">
                                                        <Button type="button" title="Clear Group" color="none" onClick={(e) => deleteMessage(e)} className="nav-btn delete-user-chat">
                                                            <i className="ri-delete-bin-line"></i>
                                                        </Button>
                                                    </li>
                                            }
                                        </ul>
                                        :
                                        <ul className="list-inline user-chat-nav text-end mb-0">
                                            <li className="list-inline-item d-none d-lg-inline-block">
                                                <Button type="button" title="View Profile" color="none" onClick={(e) => openUserSidebar(e)} className="nav-btn user-profile-show">
                                                    <i className="ri-user-2-line"></i>
                                                </Button>
                                            </li>
                                        </ul>
                                    }
                    </Col>
                </Row>
            </div>

            {/* Start Audiocall Modal */}
            <Modal tabIndex="-1" isOpen={Callmodal} toggle={toggleCallModal} centered>
                <ModalBody>
                    <div className="text-center p-4">
                        <div className="avatar-lg mx-auto mb-4">
                            <img src={user} alt="" className="img-thumbnail rounded-circle" />
                        </div>

                        <h5 className="text-truncate">Doris Brown</h5>
                        <p className="text-muted">Start Audio Call</p>

                        <div className="mt-5">
                            <ul className="list-inline mb-1">
                                <li className="list-inline-item px-2 me-2 ms-0">
                                    <button type="button" className="btn btn-danger avatar-sm rounded-circle" onClick={toggleCallModal}>
                                        <span className="avatar-title bg-transparent font-size-20">
                                            <i className="ri-close-fill"></i>
                                        </span>
                                    </button>
                                </li>
                                <li className="list-inline-item px-2">
                                    <button type="button" className="btn btn-success avatar-sm rounded-circle">
                                        <span className="avatar-title bg-transparent font-size-20">
                                            <i className="ri-phone-fill"></i>
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </ModalBody>
            </Modal>

            {/* save group Modal */}
            <Modal tabIndex="-1" isOpen={GroupSavemodal} toggle={toggleGroupSaveModal} centered>
                <ModalBody>
                    <div className="text-left p-4">
                        <h5 className="text-truncate">Please enter a name for the group.</h5>
                        <h5 className="text-truncate">* It should not be more than 50 characters in length.</h5>
                        <div className="mt-5">
                            <input id="save_group_name" name="save_group_name" />
                        </div>
                        <div className="mt-5">
                            <ul className="list-inline mb-1">
                                <li className="list-inline-item px-2 me-2 ms-0">
                                    <button type="button" className="btn btn-danger avatar-sm rounded-circle" onClick={toggleGroupSaveModal}>
                                        <span className="avatar-title bg-transparent font-size-20">
                                            <i className="ri-close-fill"></i>
                                        </span>
                                    </button>
                                </li>
                                <li className="list-inline-item px-2">
                                    <button type="button" className="btn btn-success avatar-sm rounded-circle">
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

            {/* Start VideoCall Modal */}
            <Modal tabIndex="-1" isOpen={Videomodal} toggle={toggleVideoModal} centered>
                <ModalBody>
                    <div className="text-center p-4">
                        <div className="avatar-lg mx-auto mb-4">
                            <img src={user} alt="" className="img-thumbnail rounded-circle" />
                        </div>

                        <h5 className="text-truncate">Doris Brown</h5>
                        <p className="text-muted">Start Video Call</p>

                        <div className="mt-5">
                            <ul className="list-inline mb-1">
                                <li className="list-inline-item px-2 me-2 ms-0">
                                    <button type="button" className="btn btn-danger avatar-sm rounded-circle" onClick={toggleVideoModal}>
                                        <span className="avatar-title bg-transparent font-size-20">
                                            <i className="ri-close-fill"></i>
                                        </span>
                                    </button>
                                </li>
                                <li className="list-inline-item px-2">
                                    <button type="button" className="btn btn-success avatar-sm rounded-circle">
                                        <span className="avatar-title bg-transparent font-size-20">
                                            <i className="ri-vidicon-fill"></i>
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
    let { users, active_user, groups, active_group } = state.secureText.Chat;
    const { activeTab } = state.secureText.Layout;
    if(activeTab == "group"){
        users = groups;
        active_user = active_group;
    }

    return { ...state.secureText.Layout, users, active_user };
};

export default connect(mapStateToProps, { openUserSidebar, setFullUser })(UserHead);