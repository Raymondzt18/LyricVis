import React, { Component } from 'react'
import Waveplayer from './Waveplayer'
import LyricDisplay from './LyricDisplay'
import UserPanel from './UserPanel'
import Franc from 'franc'

class LyricAuthorApp extends Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.state = {
            currentWIDCount: 0,
            currentRow: 0, //Use to keep track of auto scroll
            wordObjectMap: null, //maps wid_1...wid_n to {wordObject}
            wordObjectMatrix: null //[[{wordObject},{wordObject},...,{wordObject}], [{wordObject},{wordObject},...,{wordObject}], [{wordObject},{wordObject},...,{wordObject}]]
        }
    }

    incrementCurrentWord(timeStamp) {
        if (this.state.wordObjectMap) {
            let currentWord = this.state.wordObjectMap['wid_' + this.state.currentWIDCount];
            currentWord.set = true;
            currentWord.timeStamp = timeStamp;
            let nextWIDCount = this.state.currentWIDCount + 1
            //If map has wid, try to skip all empty spaces
            if (this.state.wordObjectMap.hasOwnProperty('wid_' + nextWIDCount)) {
                while (this.state.wordObjectMap['wid_' + nextWIDCount].word == ' ') {
                    this.state.wordObjectMap['wid_' + nextWIDCount].set = true;
                    this.state.wordObjectMap['wid_' + nextWIDCount].timeStamp = timeStamp;
                    nextWIDCount++;
                    if (!this.state.wordObjectMap.hasOwnProperty['wid_' + nextWIDCount]) {
                        break;
                    }
                }
            }
            this.setState({
                currentWIDCount: nextWIDCount,
                currentRow: this.state.wordObjectMap.hasOwnProperty('wid_' + nextWIDCount) ? this.state.wordObjectMap['wid_' + nextWIDCount].row : this.state.currentRow
            });
            return true;
        }
        return false; //if fails
    }

    decrementCurrentWord() {
        if (this.currentWIDCount <= 0) {
            console.log("Can't decrement anymore");
            return false
        }

        if (this.state.wordObjectMap) {
            let currentWIDCount = this.state.currentWIDCount - 1;
            while (this.state.wordObjectMap['wid_' + currentWIDCount].word == ' ') {
                this.state.wordObjectMap['wid_' + currentWIDCount].set = false;
                this.state.wordObjectMap['wid_' + currentWIDCount].timeStamp = -1;
                currentWIDCount--;
            }

            let currentWord = this.state.wordObjectMap['wid_' + currentWIDCount];
            currentWord.set = false;
            currentWord.timeStamp = -1;
            this.setState({
                currentWIDCount: this.state.currentWIDCount - 1,
                currentRow: this.state.wordObjectMap.hasOwnProperty('wid_' + currentWIDCount) ? this.state.wordObjectMap['wid_' + currentWIDCount] : this.state.currentRow
            });
            return true;
        }
        return false;
    }

    setCurrentWordObjectMap(currentWordObjectMap) {
        this.setState({
            wordObjectMap: currentWordObjectMap
        });
    }

    //Completely reset state according to user JSON string
    setNewWordObjectMap(newWordObjectMap) {
        this.setCurrentWordObjectMap(newWordObjectMap);
        let newWordObjectMatrix = this.buildWordObjectMatrix(newWordObjectMap);
        let newWIDCount = 0;

        for (let property in newWordObjectMap) {
            if (newWordObjectMap.hasOwnProperty(property)) {
                if (!newWordObjectMap[property].set) {
                    //newWIDCount++;
                    break;
                }
                newWIDCount++;
            }
        }

        this.setState({
            currentWIDCount: newWIDCount,
            currentRow: newWordObjectMap.hasOwnProperty['wid_' + newWIDCount] ? newWordObjectMap['wid_' + newWIDCount].row : newWordObjectMap['wid_' + (newWIDCount - 1)].row,
            wordObjectMap: newWordObjectMap,
            wordObjectMatrix: newWordObjectMatrix
        }, () => { this.myRef.current.loadMarkers() });
    }

    //Build WordObjectMatrix from map
    buildWordObjectMatrix(newWordObjectMap) {

        let resultMatrix = [];
        let resultRow = [];
        let rowCount = 0;
        for (let property in newWordObjectMap) {
            if (newWordObjectMap.hasOwnProperty(property)) {
                if (newWordObjectMap[property].row > rowCount) {
                    while (newWordObjectMap[property].row > rowCount) {
                        rowCount++;
                    }
                    resultMatrix.push(resultRow);
                    resultRow = [];
                    resultRow.push(newWordObjectMap[property]);
                } else {
                    resultRow.push(newWordObjectMap[property]);
                }
            }
        }
        resultMatrix.push(resultRow);
        return resultMatrix;
    }

    updateWordTimeStamp(wid, timeStamp) {
        this.state.wordObjectMap[wid].timeStamp = timeStamp;
        this.setState({
            wordObjectMap: this.state.wordObjectMap
        });
    }

    parseLyrics(addedLyrics) {
        if (!addedLyrics) {
            console.log("No lyrics added")
            return;
        }

        let lang = Franc(addedLyrics);
        let delimiter = ' '
        if (lang == 'cmn') {
            delimiter = ''
        }

        let userInput = addedLyrics;
        let wordObjectMatrix = [];
        let widToWordObjectMap = {}

        let arrLines = userInput.split('\n'); //Array of lyric lines

        let count = 0;
        for (let i in arrLines) {
            let wordRow = arrLines[i].split(delimiter); //Array of lyric words in a row
            let wordObjectRow = [];
            for (let j in wordRow) {
                let newWid = 'wid_' + count++;
                let newWordObject = {
                    wid: newWid,
                    word: wordRow[j],
                    row: i,
                    col: j,
                    timeStamp: -1,
                    set: false,
                    beforePlayHead: false
                }
                widToWordObjectMap[newWid] = newWordObject;
                wordObjectRow.push(newWordObject);
            }
            wordObjectMatrix.push(wordObjectRow);
        }
        this.setState({
            wordObjectMap: widToWordObjectMap,
            wordObjectMatrix: wordObjectMatrix
        }, () => {
            console.log(this.state.wordObjectMap);
            console.log(this.state.wordObjectMatrix);
        });
    }

    updateButtonTime(buttonTime) {
        this.myRef.current.playAtTime(buttonTime);
    }

    render() {
        return (
            <div className="fillHeight">
                <UserPanel
                    wordObjectMap={this.state.wordObjectMap}
                    setNewWordObjectMap={this.setNewWordObjectMap.bind(this)}></UserPanel>
                <Waveplayer ref={this.myRef} setCurrentWordObjectMap={this.setCurrentWordObjectMap.bind(this)}
                    updateWordTimeStamp={this.updateWordTimeStamp.bind(this)}
                    incrementCurrentWord={this.incrementCurrentWord.bind(this)}
                    decrementCurrentWord={this.decrementCurrentWord.bind(this)}
                    currentWIDCount={this.state.currentWIDCount}
                    wordObjectMap={this.state.wordObjectMap}
                    buttonTime={this.state.buttonTime}
                    updateButtonTime={this.updateButtonTime.bind(this)}
                    currentRow={this.state.currentRow}></Waveplayer>
                <LyricDisplay parseLyrics={this.parseLyrics.bind(this)}
                    wordObjectMatrix={this.state.wordObjectMatrix}
                    updateButtonTime={this.updateButtonTime.bind(this)}
                    currentRow={this.state.currentRow}></LyricDisplay>
            </div>
        )
    }
}

export default LyricAuthorApp