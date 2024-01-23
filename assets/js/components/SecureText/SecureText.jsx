import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Row, Col, Modal, Button} from "react-bootstrap";

class SecureText extends Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <div>
                <div id="content" >
                    <Container fluid>
                        <Row className="d-flex content-row-mt height-80vh">
                            <Left/>
                            <Right/>
                        </Row>
                    </Container>
                </div>
            </div>
        );
    }
}

export default SecureText;