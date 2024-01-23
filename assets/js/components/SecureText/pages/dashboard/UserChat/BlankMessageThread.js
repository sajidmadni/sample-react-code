import React, {Component} from 'react';

class BlankMessageThread extends Component {
    render() {
        return (
            <div className="msg_display">
                <h3 className="text-black-50 text-center">Please select a thread to see the conversation. <i className="far fa-comment-dots"></i> </h3>
            </div>
        );
    }
}

export default BlankMessageThread;