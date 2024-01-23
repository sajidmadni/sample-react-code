import React, { Component } from 'react';
import { connect } from "react-redux";
import { withTranslation } from 'react-i18next';
import SelectContact from "./../components/SelectContact";
import {Alert, Button, Form, Input, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import ContactPresence from "./ContactPresence";
import SimpleBar from "simplebar-react";
import LoadingSpinner from "./LoadingSpinner";
import {
    activeUser,
    activeGroup,
    setGroupMembers,
    removeMemberFromGroup,
    pollChatData
} from "../../../redux/SecureText/actions";
import { ContactsOutlined } from '@material-ui/icons';
import { counter } from '@fortawesome/fontawesome-svg-core';

class AddGroupMemberDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            selectedContact: this.props.currGroup ? this.props.currGroup.members : [],
            isOpenAlert: false,
            message: "",
            Searchloading: false,
            searchKeywords: "",
            isFirstTimePageLoad: true,
            currGroup: this.props.currGroup,
            fetchAndSetGroupThread: this.props.fetchAndSetGroupThread,

        }
        this.toggle = this.toggle.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleContactSearch = this.handleContactSearch.bind(this);
        this.onHandleSearchVal = this.onHandleSearchVal.bind(this);
        this.handleContactClick = this.handleContactClick.bind(this);
        this.addGroupMembers = this.addGroupMembers.bind(this);
        this.initialSelected = [];
    }

    toggle() {
        this.initialSelected = $.extend( [], this.props.currGroup.members );
        this.setState({
            modal: !this.state.modal,
            searchKeywords: "",
            selectedContact: $.extend( [], this.state.currGroup.members )
        });
    }

    handleCheck(e, contactId, getPresence, coverageId = false) {
        if (this.state.selectedContact === undefined) {
            var selected = [];
        } else {
            var selected = this.state.selectedContact;
        }

        var obj;
        if (e.target.checked) {
            obj = {
                id: contactId,
                name: e.target.value,
                covId: coverageId,
                presence: getPresence
            };
            selected.push(obj);      // pushed in to array at first position
            this.setState({selectedContact: selected});
        } else {
            let readjustData = $.grep(selected, function (e) {
                return e.id != contactId;
            });
            this.setState({selectedContact: readjustData});
        }
    }

    handleContactSearch(e) {
        if (e.target.value.length > 2 || e.target.value.length === 0) {
            this.setState({Searchloading: true, loading: false});
            setTimeout(function () {
                this.setState({Searchloading: false});
            }.bind(this), 1000);
            this.setState({
                searchContacts: true,
                searchKeywords: e.target.value,
                isFirstTimePageLoad: false,
            });
        } else {
            this.setState({
                searchContacts: false,
                searchKeywords: "",
                isFirstTimePageLoad: false,
            });

        }
    }

    onHandleSearchVal(searchVal) {
        this.setState({
            searchContacts: true,
            loading: true,
        });
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
    handleContactClick(){

    }
    addGroupMembers() {
        let selectedPhyIds = [];
        this.state.selectedContact.forEach(function(selectedPhy) {
            if(selectedPhy['id']){
                selectedPhyIds.push(selectedPhy['id']);
            }
        });

        let idsToRemove = [];
        this.initialSelected.forEach(function(currMember) {
            if(selectedPhyIds.some(item => currMember.id === item)){
                //idsToAdd.push(currMember.id);
            }else {
                idsToRemove.push(currMember.id);
            }
        });
        
        this.state.selectedContact.forEach(function(selectedPhyVal) {
            this.initialSelected.forEach(function(currMemberVal) {
                // Checked value in the already selected object
                const checkValExists = this.initialSelected.some(function(el) {
                    return el.id === selectedPhyVal['id'];
                });
                // Checked value in current state after adding missing element
                const checkValExistsInCurrentGroup = this.state.currGroup.members.some(function(el) {
                    return el.id === selectedPhyVal['id'];
                });
                
                if(checkValExists == false && checkValExistsInCurrentGroup == false){
                    if(selectedPhyVal['id'].substring(0, 2) == "AD" || selectedPhyVal['id'].substring(0, 2) == "AG"){
                        let addGroupToMembersArr = {
                            id: selectedPhyVal['id'],
                            last: "",
                            first: "",
                            name: selectedPhyVal['name'],
                            degree: "",
                            department: "",
                            presence: selectedPhyVal['presence'],
                            isCovered:false,
                        };
                        this.state.currGroup.members.push(addGroupToMembersArr);
                    } else {
                        this.state.currGroup.members.push(selectedPhyVal);
                    }
                    this.setState({
                        currGroup: this.state.currGroup.members
                    });
                }
            }.bind(this));
        }.bind(this));

        let thisProps = this.props;
        let currGroupId = this.props.currGroup.id;

        if((this.state.currGroup.id < 0 )){
                let membersData = this.state.selectedContact;
                let dataToAdd = [];
                let initialSelected = this.initialSelected;
                membersData.forEach(function(currMember) {
                    if(initialSelected.some(item => currMember.id === item)){
                        //
                    }else {
                        dataToAdd.push(currMember.id);
                    }
                });
                this.props.setGroupMembers(membersData, this.state.currGroup.id);
                idsToRemove.forEach(function (itemId) {
                    thisProps.removeMemberFromGroup(currGroupId, itemId);
                });
                this.toggle();
        }else {
            let formData = new FormData();
            formData.append('ids', JSON.stringify(selectedPhyIds));
            formData.append('group_id', this.state.currGroup.id);
            const requestOptions = {
                method: 'POST',
                body: formData
            };
            fetch('/ajax_add_multiple_group', requestOptions)
                .then(data => data.json())
                .then(data => {
                    this.state.fetchAndSetGroupThread(selectedPhyIds);
                });

            //remove the existing if user has permission
            if(this.props.currGroup.priv.remove==true){
                idsToRemove.forEach(function (itemId) {
                    $.getJSON("/ajax_removefrm_group/"+ currGroupId +"?phyid="+itemId, function (data) {
                        if (data.status == "1") {
                            thisProps.removeMemberFromGroup(currGroupId, itemId);
                        }
                    });
                });
            }
            this.toggle();
            // Update state with the newly added members in to group
            this.props.pollChatData();
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({
                currGroup: this.props.currGroup
            });
        }
    }

    render()
    {
        return (
            <React.Fragment>
                <Button type="button" title="Add members" color="none" onClick={this.toggle}
                        className="nav-btn add-group-member-chat">
                    <i className="ri-user-add-line"></i>
                </Button>
                <Modal size="lg" isOpen={this.state.modal} centered toggle={this.toggle}>
                    <ModalHeader tag="h5" className="modal-title font-size-15 mb-0"
                                 toggle={this.toggle}>Select members</ModalHeader>
                    <ModalBody className="p-4 pb-0">
                        <Form>
                            <div className="mb-0">
                                <Alert isOpen={this.state.isOpenAlert} color="danger">
                                    {this.state.message}
                                </Alert>

                                <ul className="contact-selected">
                                    {
                                        (!this.state.selectedContact) ? "" :
                                            this.state.selectedContact.map((selContact, contactKey) =>
                                                selContact ?
                                                    <li className="contact-selected_li" key={selContact.id}>
                                                        <span className="ml-3">{selContact.name}
                                                            <ContactPresence args={[{
                                                                presence: selContact.presence,
                                                                id: selContact.id,
                                                                isCovered: selContact.isCovered || selContact.covId  ? true : false
                                                            }]}/>
                                                        </span>
                                                    </li>
                                                : ""
                                            )
                                    }
                                </ul>
                                <div>
                                    <Input type="text" id="search-contacts-field" autoComplete="off"
                                           className="form-control form-control-lg bg-light border-light"
                                           placeholder="Please enter 3 or more characters to search contacts"
                                           onKeyUp={this.handleContactSearch}/>
                                </div>
                                <SimpleBar style={{maxHeight: "300px"}}>
                                    {/* contacts */}
                                    <div id="addContacts">
                                        {
                                            this.state.isFirstTimePageLoad || this.state.searchKeywords === "" || this.state.searchKeywords.length > 2 ?
                                                <div>
                                                    {
                                                        this.state.Searchloading ? <LoadingSpinner/> :
                                                            <SelectContact
                                                                args={{
                                                                    loading: this.state.loading,
                                                                    searchKeywords: this.state.searchKeywords,
                                                                    selectedContact: this.state.selectedContact,
                                                                    isSideBar: false
                                                                }}
                                                                handleCheck={this.handleCheck}
                                                                handleSearchVal={this.onHandleSearchVal}
                                                                handleContactClick={this.handleContactClick}
                                                            />
                                                    }
                                                </div>
                                                : "Please enter 3 or more characters to search contacts"
                                        }
                                    </div>
                                </SimpleBar>
                            </div>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="button" color="link" onClick={this.toggle}>Close</Button>
                        <Button type="button" color="primary" onClick={this.addGroupMembers}>Update</Button>
                    </ModalFooter>
                </Modal>
            </React.Fragment>
        );
    }
}
const mapStateToProps = (state) => {
    const { users, groups, active_user, active_group, tabOpenBy } = state.secureText.Chat;
    let currGroup = (tabOpenBy == "groups") ? groups[active_group] : users[active_user];    
    return { groups, active_user, currGroup, tabOpenBy };
};

export default (connect(mapStateToProps, {  activeUser, activeGroup, setGroupMembers, removeMemberFromGroup, pollChatData })(withTranslation()(AddGroupMemberDialog)));