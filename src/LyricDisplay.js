import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import ModalBody from 'react-bootstrap/ModalBody'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import LyricRow from './LyricRow'
import Scroll from 'react-scroll'


class LyricDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    scrollLine(rowNum) {
        console.log("rowNum: " + rowNum)
        let scroller = Scroll.scroller;
        let rowName = 'row_' + rowNum
        scroller.scrollTo(rowName, {
            duration: 200,
            delay: 0,
            smooth: true,
            containerId: 'lyricBody',
            offset: -150, // Scrolls to element + 50 pixels down the page
        })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentRow != this.props.currentRow) {
            this.scrollLine(this.props.currentRow)
        }
    }

    render() {
        let lyricBody;

        let Element = Scroll.Element;

        if (this.props.wordObjectMatrix != null) {
            lyricBody = this.props.wordObjectMatrix.map((value, index) => {
                return (<Element name={'row_' + index}><LyricRow updateButtonTime={this.props.updateButtonTime} wordObjectRow={value}></LyricRow></Element>);
            });
        }

        return (
            <div id="lyricDisplay" className="fillHeight">
                <div className="container fillHeight">
                    <div className="card fillHeight">
                        <div className="card-header">
                            <LyricModal parseLyrics={this.props.parseLyrics}></LyricModal>
                        </div>
                        <div id="lyricBody" className="card-body overflow-auto">
                            {
                                lyricBody
                            }
                        </div>
                        <div className="card-footer">

                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

class LyricModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            addedLyrics: ""
        }
    }

    closeModal() {
        this.setState({
            showModal: false,
        });
    }

    openModal() {
        this.setState({
            showModal: true,
        });
    }

    render() {

        return (
            <>
                <Button variant="primary" onClick={this.openModal.bind(this)}>
                    Input Lyrics
                </Button>

                <Modal show={this.state.showModal} onHide={this.closeModal.bind(this)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Input Lyrics</Modal.Title>
                    </Modal.Header>
                    <Modal.Body><Form.Control as="textarea" rows="3" onChange={(e) => { this.setState({ addedLyrics: e.target.value }) }}></Form.Control></Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={() => { this.props.parseLyrics(this.state.addedLyrics); this.setState({ showModal: false }) }}>
                            Render Lyrics
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}

export default LyricDisplay