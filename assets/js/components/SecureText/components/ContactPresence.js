import React, { Component } from 'react';
import { connect } from "react-redux";

class ContactPresence extends Component {
    constructor(props) {
        super(props);
        this.state = {
            presenceStatus: this.props['args'][0].presence,
            id: this.props['args'][0].id,
            displayPresenceStatus: this.props['args'][0].presence,
            presenceClass: this.props['args'][0].presence == "inactive" ? "dnd" : this.props['args'][0].presence,
            getIsCovered: this.props.isCovered || this.props['args'][0].isCovered ? true : false,
            myPresence: this.props.my_presence ? this.props.my_presence : null
        }
        this.getPresenceStatus = this.getPresenceStatus.bind(this);
        this.getDisplayPresenceStatus = this.getDisplayPresenceStatus.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps['args'][0].presence != this.props['args'][0].presence) {
            this.setState({
                presenceStatus: this.props['args'][0].presence
            });
            this.getPresenceStatus();
            this.getDisplayPresenceStatus();
        }
    }

    componentDidMount() {
        this.getPresenceStatus();
        this.getDisplayPresenceStatus();
    }

    getPresenceStatus(){
        // let presence = this.state.presenceStatus;
        let presence = this.props['args'][0].presence;
        if(presence == "group"){
            this.setState({presenceClass: "fas fa-users text-primary"});
        } else {
            if(this.props['args'][0].id == this.props.my_user && this.state.getIsCovered == true && this.props.my_presence != "dnd"){
                presence = this.state.myPresence;
            }
            switch (presence) {
                case 'dnd':
                    this.setState({presenceClass: "dnd"});
                    break;
                case 'active':
                    this.setState({presenceClass: "active"});
                    break;    
                case 'inactive':
                    this.setState({presenceClass: "dnd"});
                    break;
                case 'leave_of_absence':
                    this.setState({presenceClass: "unavailable"});
                    break;
                case 'unavailable':
                    this.setState({presenceClass: "unavailable"});
                    break;
                case 'covered':
                    this.setState({presenceClass: "covered"});
                    break;    
                default:
                    this.setState({presenceClass: "active"});
                    break;
            }

        }
    }

    getDisplayPresenceStatus(){
        let presence = this.state.presenceStatus;
        if(presence != "group"){
            switch(presence){
                case 'dnd':
                    this.setState({displayPresenceStatus: "Do Not Disturb"});
                    break;
                case 'active':
                    this.setState({displayPresenceStatus: "Available"});
                    break;    
                case 'inactive':
                    this.setState({displayPresenceStatus: "Unavailable"});
                    break;
                case 'leave_of_absence':
                    this.setState({displayPresenceStatus: "Leave of Absence"});
                    break;
                case 'covered':
                    this.setState({displayPresenceStatus: "Covered"});
                    break;    
                default:
                    this.setState({displayPresenceStatus: this.state.presenceStatus});
                    break;
            }
        }
        
    }

    render() {
        return (
            <React.Fragment>
            {
                <i 
                title={this.state.displayPresenceStatus}
                data-presence-props={this.props['args'][0].presence}
                className={"fa fa-circle"+(this.props['args'][0].presence=="covered" ||  this.state.getIsCovered ? "-thin" : "")+ " basePres presence-"+(this.props['args'][0].presence == "leave_of_absence" && this.state.getIsCovered == true ? "unavailable" : this.state.presenceClass)}>
                </i>
            }
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { my_user, my_presence, isCovered } = state.secureText.Chat;
    return { my_user, my_presence, isCovered };
};

export default (connect(mapStateToProps)((ContactPresence)));