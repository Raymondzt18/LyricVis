import React, { Component } from 'react'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'
import CopyToClipboard from 'react-copy-to-clipboard'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

class UserPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userInputJSON: "",
        }
    }

    render() {

        return (
            <div className="container">
                <Accordion>
                    <Card>
                        <Accordion.Toggle as={Card.Header} eventKey="0">
                            User Panel
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                                <Row>
                                    <Col sm={3}>
                                        <Nav variant="pills" className="flex-column">
                                            <Nav.Item>
                                                <Nav.Link eventKey="first">JSON Structure</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="second">WIP</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </Col>
                                    <Col sm={9}>
                                        <Tab.Content>
                                            <Tab.Pane eventKey="first">
                                                <Card>
                                                    <Card.Header>
                                                        <CopyToClipboard text={JSON.stringify(this.props.wordObjectMap)}
                                                            onCopy={()=>{console.log("Copied")}}>
                                                            <button className="btn btn-primary">Copy JSON String</button>
                                                        </CopyToClipboard>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <div><pre id="prettyJSON">{JSON.stringify(this.props.wordObjectMap, null, 2)}</pre></div>
                                                    </Card.Body>
                                                </Card>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="second">
                                                <Card>
                                                    <Card.Header>
                                                        <Button variant="primary" onClick={() => { this.props.setNewWordObjectMap(JSON.parse(this.state.userInputJSON)) }}>
                                                            Render Existing
                                                        </Button>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <Form.Control as="textarea" rows="3" onChange={(e) => { this.setState({ userInputJSON: e.target.value }) }}></Form.Control>
                                                    </Card.Body>
                                                </Card>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </Col>
                                </Row>
                            </Tab.Container>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            </div>
        )
    }
}

export default UserPanel