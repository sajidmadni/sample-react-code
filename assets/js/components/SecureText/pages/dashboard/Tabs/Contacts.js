import React, { Component } from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledTooltip, Form, Label, Input, InputGroup, } from 'reactstrap';
import SimpleBar from "simplebar-react";

import { connect } from "react-redux";

import { withTranslation } from 'react-i18next';
import SelectContact from "../../../components/SelectContact";

//use sortedContacts variable as global variable to sort contacts
let sortedContacts = [
    {
        group: "A",
        children: [{ name: "Demo" }]
    }
]

class Contacts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            contacts: this.props.contacts,
            selectedContact: [],
            loading: true,
            searchContacts: false,
            searchKeywords: "",
            isFirstTimePageLoad: true,
            isSearch: false
        }
        this.toggle = this.toggle.bind(this);
        this.sortContact = this.sortContact.bind(this);
        this.handleContactSearch = this.handleContactSearch.bind(this);
        this.onHandleSearchVal = this.onHandleSearchVal.bind(this);
        this.handleContactClick = this.handleContactClick.bind(this);
    }

    handleContactClick(){
        //
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState({
                contacts: this.props.contacts,
                loading: this.props.loading,
                searchContacts: this.props.searchContacts,
                searchKeywords: this.props.searchKeywords,
                isFirstTimePageLoad: this.props.isFirstTimePageLoad,
                isSearch: this.props.isSearch,
            });
        }
    }

    toggle() {
        this.setState({ modal: !this.state.modal });
    }

    sortContact() {
        let data = this.state.contacts.reduce((r, e) => {
            try {
                // get first letter of name of current element
                let group = e.name[0];
                // if there is no property in accumulator with this letter create it
                if (!r[group]) r[group] = { group, children: [e] }
                // if there is push current element to children array for that letter
                else r[group].children.push(e);
            } catch (error) {
                return sortedContacts;
            }
            // return accumulator
            return r;
        }, {})

        // since data at this point is an object, to get array of values
        // we use Object.values method
        let result = Object.values(data);
        this.setState({ contacts: result });
        sortedContacts = result;
        return result;
    }

    componentDidMount() {
        this.sortContact();
    }

    componentWillUnmount() {
        this.sortContact();
    }

    handleContactSearch (e) {
        if(e.target.value.length > 2 || e.target.value.length === 0){
            this.setState({
                searchContacts: true,
                loading: true,
                searchKeywords: e.target.value,
                isFirstTimePageLoad: true,
                isSearch: true
            });
        } else{
            this.setState({
                searchContacts: false,
                loading: false,
                searchKeywords: "",
                isFirstTimePageLoad: false,
                isSearch: false
            });

        }
    }

    onHandleSearchVal(searchVal){
        this.setState({
            searchContacts: true,
            loading: true,
            //searchKeywords: "",
            // selectedContact: []
        });

    }

    render() {
        const { t } = this.props;
        return (
            <React.Fragment>
                <div>
                    <div className="p-4">
                        <h4 className="mb-4">Contacts</h4>

                        {/* Start Add contact Modal */}
                        <Modal isOpen={this.state.modal} centered toggle={this.toggle}>
                            <ModalHeader tag="h5" className="font-size-16" toggle={this.toggle}>
                                {t('Add Contacts')}
                            </ModalHeader>
                            <ModalBody className="p-4">
                                <Form>
                                    <div className="mb-4">
                                        <Label className="form-label" htmlFor="addcontactemail-input">{t('Email')}</Label>
                                        <Input type="email" className="form-control" id="addcontactemail-input" placeholder="Enter Email" />
                                    </div>
                                    <div>
                                        <Label className="form-label" htmlFor="addcontact-invitemessage-input">{t('Invatation Message')}</Label>
                                        <textarea className="form-control" id="addcontact-invitemessage-input" rows="3" placeholder="Enter Message"></textarea>
                                    </div>
                                </Form>
                            </ModalBody>
                            <ModalFooter>
                                <Button type="button" color="link" onClick={this.toggle}>Close</Button>
                                <Button type="button" color="primary">Invite Contact</Button>
                            </ModalFooter>
                        </Modal>
                        {/* End Add contact Modal */}

                        <div className="search-box chat-search-box">
                            <InputGroup size="lg" className="bg-light rounded-lg">
                                <Button color="link" className="text-decoration-none text-muted pr-1" type="button">
                                    <i className="ri-search-line search-icon font-size-18"></i>
                                </Button>
                                <Input type="text" className="form-control bg-light left-search-box" placeholder={t('Search users..')} onKeyUp={this.handleContactSearch} />
                            </InputGroup>
                        </div>
                        {/* End search-box */}
                    </div>
                    {/* end p-4 */}

                    {/* Start contact lists */}
                    <SimpleBar style={{ maxHeight: "100%" }} id="chat-room" className="p-4 chat-message-list chat-group-list">
                        {
                            this.state.isFirstTimePageLoad || this.state.searchKeywords !== ""  ?
                            <SelectContact
                                args={[ {loading: this.state.loading, searchKeywords: this.state.searchKeywords, selectedContact: this.state.selectedContact, isSideBar: true} ]}
                                handleCheck={this.handleCheck}
                                handleSearchVal={this.onHandleSearchVal}
                                searchKeywords={this.state.searchKeywords}
                                handleContactClick={this.handleContactClick}
                            /> : ""
                        }

                    </SimpleBar>
                    {/* end contact lists */}
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { contacts } = state.secureText.Chat;
    return { contacts };
};

export default connect(mapStateToProps, null)(withTranslation()(Contacts));