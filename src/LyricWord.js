import React, { Component } from 'react'
import Button from 'react-bootstrap/Button'


class LyricWord extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    handleClick() {
        if(this.props.wordObject.timeStamp < 0){
            return;
        }
        this.props.updateButtonTime(this.props.wordObject.timeStamp);
    }

    render() {

        let className = "btn btn-light rounded-0";
        if (this.props.wordObject.set && !this.props.wordObject.beforePlayHead) {
            className = "btn btn-dark rounded-0"
        }
        if (this.props.wordObject.set && this.props.wordObject.beforePlayHead) {
            className = "btn btn-success rounded-0"
        }

        return (
            <button title={this.props.wordObject.timeStamp} onClick={this.handleClick.bind(this)} className={className}>
                {this.props.wordObject.word}
            </button>

        )
    }
}

export default LyricWord