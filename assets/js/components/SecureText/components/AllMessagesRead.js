import React, { Component } from 'react';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from "reactstrap";
import { connect } from "react-redux";
//actions
import * as actionCreators from "../../../redux/SecureText/actions";
// Toaster
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class AllMessagesRead extends Component {
    constructor(props) {
        super(props);
        this.state = {
            markMessageReadModal: false,
            disabledAllReadIcon: true
        }
        this.toggleMarkMessageReadModal = this.toggleMarkMessageReadModal.bind(this);
        this.markAllMessagesRead = this.markAllMessagesRead.bind(this);
    }

    toggleMarkMessageReadModal(){
        this.setState({
            markMessageReadModal: !this.state.markMessageReadModal,
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            let isAllRead = true;
            this.props.users.map((value, key) => {
                if(value.msgNew > 0){
                    isAllRead = false;
                }
            });
            // Update state
            this.setState({disabledAllReadIcon: isAllRead});
        }

     }

    markAllMessagesRead(){
        // Simple call mark all messages read end point
        const getAPIResponse = this.props.markAllMessagesRead();
        let currentComponent = this;    // Need to cache the reference to this outside of that API call

        getAPIResponse.then(function(result) {
            currentComponent.setState({
                markMessageReadModal: !currentComponent.state.markMessageReadModal,
            });
            if(result.error){
                toast.warning(result.error, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    transition: Slide
                });
            } else {
                toast.success(result.response.msg, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    transition: Slide
                });
                currentComponent.props.pollChatData();          //  Render polling to reset unread counter
                $('#messageBadgeCount').addClass('hidden');     //  Hide top blue message counter icon
            }
         })
    }

    render() {
        return (
            <React.Fragment>
            <div>
                <Button type="button" disabled={this.state.disabledAllReadIcon} onClick= {this.toggleMarkMessageReadModal} color="link" style={{ color: this.state.disabledAllReadIcon ? "#6C7271" :"#00a89e"}} className="text-decoration-none font-size-22 py-0">
                    <i className="fas fa-check-double"></i>
                </Button>
                <ToastContainer
                    position="top-right"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                {/* save group Modal */}
                <Modal isOpen={this.state.markMessageReadModal} centered toggle={this.toggleMarkMessageReadModal}>
                    <ModalHeader tag="h5" className="font-size-16" toggle={this.toggleMarkMessageReadModal}>
                        Marked as Read
                    </ModalHeader>
                    <ModalBody className="p-4">
                        <p>All your secure messages including group messages will be marked as read.</p>
                    </ModalBody>
                    <ModalFooter>
                        <button type="button" className="btn btn-primary" onClick={this.toggleMarkMessageReadModal}>Cancel</button>
                        <button type="button" className="btn btn-success" onClick={this.markAllMessagesRead}>OK</button>
                    </ModalFooter>
                </Modal>
            </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { users } = state.secureText.Chat;
    return { users };
};

export default (connect(mapStateToProps, actionCreators)(AllMessagesRead));