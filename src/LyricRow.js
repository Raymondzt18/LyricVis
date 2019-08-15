import React, { Component } from 'react'
import Button from 'react-bootstrap/Button'
import LyricWord from './LyricWord'

class LyricRow extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        let lyricWords;

        if (this.props.wordObjectRow != null) {
            lyricWords = this.props.wordObjectRow.map((value, index) => {
                return (<LyricWord updateButtonTime={this.props.updateButtonTime} wordObject={value}></LyricWord>);
            });
        }

        return (
            <div className="row justify-content-md-center">
                {lyricWords}
            </div>

        )
    }
}

export default LyricRow