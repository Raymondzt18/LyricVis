import React, { Component } from 'react'
import ButtonToolBar from 'react-bootstrap/ButtonToolbar';
import Button from 'react-bootstrap/Button'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js'
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js'
import Scroll from 'react-scroll'

class Waveplayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            offset: 0.2,
            wavePlayer: null,
            currentTime: null,
            regionsList: []
        }
    }

    componentWillUnmount() {
        this.state.wavePlayer.destroy();
    }

    componentDidMount() {
        this.setState({
            wavePlayer: WaveSurfer.create({
                container: "#waveform",
                plugins: [
                    RegionsPlugin.create(),
                    CursorPlugin.create({
                        showTime: true,
                        opacity: 1,
                        customShowTimeStyle: {
                            "background-color": "#000",
                            color: "#fff",
                            padding: "2px",
                            "font-size": "10px"
                        }
                    })
                ],
                scrollParent: true,
                autoCenter: true,
                responsive: true,
                partialRender: true,
                waveColor: "violet",
                progressColor: "purple"
            })
        }, () => { //Call back after state set
            this.state.wavePlayer.on("audioprocess", function () {
                let currentTime = this.state.wavePlayer.getCurrentTime()
                this.setState({
                    currentTime: currentTime
                })
            }.bind(this));

            this.state.wavePlayer.on('region-in', function (regionObj) {
                this.props.wordObjectMap[regionObj.attributes.wid].beforePlayHead = true;
                this.props.setCurrentWordObjectMap(this.props.wordObjectMap);
                this.scrollLine(this.props.wordObjectMap[regionObj.attributes.wid].row);
            }.bind(this));

            this.state.wavePlayer.on('region-update-end', function (regionObj) {
                this.props.updateWordTimeStamp(regionObj.attributes.wid, regionObj.start + this.state.offset);
                if (regionObj.start > this.state.wavePlayer.getCurrentTime()) {
                    this.props.wordObjectMap[regionObj.attributes.wid].beforePlayHead = false;
                } else {
                    this.props.wordObjectMap[regionObj.attributes.wid].beforePlayHead = true;
                }
                this.props.setCurrentWordObjectMap(this.props.wordObjectMap);
            }.bind(this));

            this.state.wavePlayer.on('seek', this.setBeforePlayheadValues.bind(this));
            this.state.wavePlayer.on('play', this.setBeforePlayheadValues.bind(this));
        });

        document.addEventListener("keydown", this._handleKeyDown.bind(this));
    }

    scrollLine(rowNum) {
        if (this.props.currentRow == rowNum) {
            return;
        }
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

    setBeforePlayheadValues() {
        let currentTime = this.state.wavePlayer.getCurrentTime();
        let wordObjectMap = this.props.wordObjectMap;
        for (let property in wordObjectMap) {
            if (wordObjectMap.hasOwnProperty(property)) {
                if (wordObjectMap[property].timeStamp > currentTime) {
                    wordObjectMap[property].beforePlayHead = false;
                } else {
                    wordObjectMap[property].beforePlayHead = true;
                }
            }
        }
        this.props.setCurrentWordObjectMap(wordObjectMap);
    }

    _handleKeyDown(event) {
        if (event.keyCode == 39) {
            this.createMarker();
        }
        if (event.keyCode == 37) {
            this.removeMarker();
        }
        if (event.keyCode == 32) {
            if (this.state.wavePlayer.isPlaying()) {
                this.state.wavePlayer.pause();
            } else {
                this.state.wavePlayer.play();
            }
        }
    }

    createMarker() {
        if (!this.props.wordObjectMap) {
            console.log("WordObjectMap doesn't exist");
            return;
        }
        let currentWordObject = this.props.wordObjectMap['wid_' + this.props.currentWIDCount];
        if (!currentWordObject) {
            console.log("WordObject doesn't exist");
            return;
        }
        console.log("GOT HERE ADDING REGION");
        if (!this.props.incrementCurrentWord(this.state.wavePlayer.getCurrentTime())) {
            throw Error("Failed to increment word");
        }
        let regionParams = {
            start: this.state.wavePlayer.getCurrentTime() - this.state.offset,
            end: this.state.wavePlayer.getCurrentTime() + 0.1,
            resize: false,
            attributes: {
                label: currentWordObject.word,
                sometattr: "some attr",
                wid: currentWordObject.wid
            }
        };
        let newRegion = this.state.wavePlayer.addRegion(regionParams);
        this.state.regionsList.push(newRegion);
        this.setState({
            regionsList: this.state.regionsList
        });
    }

    removeMarker() {
        if (this.state.regionsList.length == 0) {
            console.log("No regions to remove");
            return;
        }
        let regionToRemove = this.state.regionsList.pop();
        this.playAtTime(this.props.wordObjectMap[regionToRemove.attributes.wid].timeStamp - 2.5);
        regionToRemove.remove();
        this.props.decrementCurrentWord();
    }

    //Push in new markers according to newWordObjectMap
    loadMarkers() {
        for (let region of this.state.regionsList) {
            region.remove();
        }
        this.state.regionsList = [];
        for (let property in this.props.wordObjectMap) {
            if (this.props.wordObjectMap.hasOwnProperty(property)) {
                let currentWordObject = this.props.wordObjectMap[property];
                let regionParams = {
                    start: currentWordObject.timeStamp - this.state.offset,
                    end: currentWordObject.timeStamp + 0.1,
                    resize: false,
                    attributes: {
                        label: currentWordObject.word,
                        sometattr: "some attr",
                        wid: currentWordObject.wid
                    }
                };
                let newRegion = this.state.wavePlayer.addRegion(regionParams);
                this.state.regionsList.push(newRegion);
            }
        }
        this.setState({
            regionsList: this.state.regionsList
        });
    }

    loadSong(files) {
        this.state.wavePlayer.load(URL.createObjectURL(files[0]));
    }

    togglePlay() {
        if (this.state.wavePlayer.isPlaying()) {
            this.state.wavePlayer.pause();
        } else {
            this.state.wavePlayer.play();
        }
    }

    updateZoom(zoomLevel) {
        this.state.wavePlayer.zoom(Number(zoomLevel));
        console.log("zoom updated: " + zoomLevel)
    }

    playAtTime(time) {
        if (time < 0) {
            return;
        }
        this.state.wavePlayer.play(time);
    }

    render() {
        return (
            <div className="Waveplayer">
                <div className="container">
                    <div className="card">
                        <div className="card-header">
                            {this.state.currentTime}
                        </div>
                        <div className="card-body">
                            <div id="waveform"></div>
                        </div>
                        <div className="card-footer">
                            <ButtonToolBar>
                                <Button variant="primary" onClick={() => this.togglePlay()}>Play/Pause</Button>
                                <Button variant="primary" onClick={() => this.createMarker()}>Add Marker</Button>
                                <input onChange={(e) => { this.updateZoom(e.target.value) }} type="range" min="1" max="200" defaultValue="100"></input>

                                <input type="file" onChange={(e) => this.loadSong(e.target.files)}></input>
                            </ButtonToolBar>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Waveplayer