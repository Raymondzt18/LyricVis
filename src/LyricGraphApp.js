import React from 'react';
import WaveSurfer from 'wavesurfer.js'
import mp3_file from './MyLady.mp3'
import jsonFile from './samplelyricjson2'
import Card from 'react-bootstrap/Card'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Chrome from 'react-color'

class LyricGraphApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            analyser: null,
            wavePlayer: null,
            wordObjectMap: null,
            wordObjectMatrix: null,
            currentWIDCount: 0,
            currentRow: 0,
            centerWordSize: 60,
            centerWordColor: 'rgb(255,255,255)',
            lineWordSize: 30,
            lineWordFilledColor: 'rgb(0,0,0)',
            lineWordEmptyColor: 'rgb(255,255,255)'
        }
    }

    componentDidMount() {

        let wavePlayer = WaveSurfer.create({ container: '#wavePlayer', waveColor: '#5B88C8', progressColor: '#264E73' });
        wavePlayer.on('seek', this.setNewWIDCount.bind(this));
        wavePlayer.load(mp3_file);
        fetch(jsonFile).then((r) => r.text()).then(text  => {
            this.setWordObjectMap(text);
        })  
        //this.buildWordObjectMatrix();
        let analyser = wavePlayer.backend.analyser;

        this.initCanvas.bind(this);

        this.setState({
            wavePlayer: wavePlayer,
            analyser: analyser
        }, () => {
            this.initCanvas();
        });
    }

    componentWillUnmount() {
        this.state.wavePlayer.destroy();
    }

    initCanvas() {

        let canvas, ctx, center_x, center_y, radius, bars, x_end, y_end, bar_height, bar_width, frequency_array, rotate_deg, rotate_incr;
        rotate_deg = 0;
        bars = 200;
        bar_width = 2;
        rotate_incr = 0.2;

        let boundAnim = animationLooper.bind(this);

        canvas = document.getElementById("waveVis");

        frequency_array = new Uint8Array(this.state.analyser.frequencyBinCount);

        function animationLooper() {
            if (!canvas) {
                return;
            }

            //Resizing clears the canvas smh
            //Set to the size of canvas
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx = canvas.getContext("2d");
            center_x = canvas.width / 2;
            center_y = canvas.height / 2;
            radius = 150;

            // style the background
            /*var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, "rgba(35, 7, 77, 1)");
            gradient.addColorStop(1, "rgba(204, 83, 51, 1)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);*/

            

            this.state.analyser.getByteFrequencyData(frequency_array);

            //Fill circle
            ctx.beginPath();
            ctx.arc(center_x, center_y, frequency_array[0]>170? radius-3: radius-5, 0, 2 * Math.PI);
            ctx.fillStyle = frequency_array[0]>170? "rgb(20,20,20)": "rgb(0,0,0)";
            ctx.globalAlpha = 0.5;
            ctx.fill();
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            this.tryDisplayWord(ctx, center_x, center_y);
            this.tryDisplayLine(ctx, canvas.width / 4, canvas.height * 0.9);

            for (var i = 0+50; i < bars+50; i++) {

                //divide a circle into equal parts
                let rads = Math.PI * 2 / bars;

                bar_height = frequency_array[i] * 0.7;

                // set coordinates
                let x = center_x + Math.cos(rads * (i + rotate_deg)) * (radius);
                let y = center_y + Math.sin(rads * (i + rotate_deg)) * (radius);
                x_end = center_x + Math.cos(rads * (i + rotate_deg)) * (radius + bar_height);
                y_end = center_y + Math.sin(rads * (i + rotate_deg)) * (radius + bar_height);

                //draw a bar
                drawBar(x, y, x_end, y_end, bar_width, frequency_array[i]);

            }
            rotate_deg += rotate_incr;
            window.requestAnimationFrame(boundAnim);
        }

        // for drawing a bar
        function drawBar(x1, y1, x2, y2, width, frequency) {

            var lineColor = "rgb(" + 255 + ", " + 0 + ", " + frequency + ")";

            ctx.strokeStyle = lineColor;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineCap = "round"
            ctx.stroke();
        }

        boundAnim();
    }


    //Sets currentWIDCount, depending on where current playhead is
    setNewWIDCount() {
        let newWIDCount = 0;
        let currentTime = this.state.wavePlayer.getCurrentTime();
        let wordObjectMap = this.state.wordObjectMap;
        for (let property in wordObjectMap) {
            if (wordObjectMap.hasOwnProperty(property)) {
                if (wordObjectMap[property].timeStamp > currentTime) {
                    break;
                }
                newWIDCount++;
            }
        }
        this.setState({
            currentWIDCount: newWIDCount
        });
    }

    togglePlay() {
        if (this.state.wavePlayer.isPlaying()) {
            this.state.wavePlayer.pause();
        }
        else {
            this.state.wavePlayer.play();
        }
    }

    //Try to display the word at the center of page
    tryDisplayWord(ctx, x, y) {
        if (this.state.wordObjectMap == null) {
            //Draw the word
            ctx.font = "30px Comic Sans MS";
            ctx.fillStyle = "red";
            ctx.globalAlpha = 1.0;
            ctx.textAlign = "center";
            ctx.fillText("Choose Struct", x, y);
            return;
        }
        let currentWIDCount = this.state.currentWIDCount;
        let nextWidCount = this.state.currentWIDCount + 1;

        if (this.state.wordObjectMap.hasOwnProperty('wid_' + nextWidCount)) {
            if (this.state.wordObjectMap['wid_' + nextWidCount].word == ' ') {
                nextWidCount++;
            }
            //Check if next object time is passed, if it has, update current displayed word to that word.
            if (this.state.wordObjectMap['wid_' + nextWidCount].timeStamp < this.state.wavePlayer.getCurrentTime()) {
                currentWIDCount++;
            }
        }

        let currentWordObject = this.state.wordObjectMap['wid_' + currentWIDCount];

        //If currentWordObject doesn't exist or their timestamp isn't reached yet, don't display word
        if (!currentWordObject || currentWordObject.timeStamp > this.state.wavePlayer.getCurrentTime()) {
            return;
        }
        let timeDiff = this.state.wavePlayer.getCurrentTime() - currentWordObject.timeStamp;
        let sizeIncrease = ((Math.log(timeDiff + 1)) * 10);
        ctx.font = (sizeIncrease + this.state.centerWordSize) + "px Comic Sans MS";
        ctx.fillStyle = this.state.centerWordColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.globalAlpha = (1 - timeDiff / 4) < 0 ? 0 : (1 - timeDiff / 4);
        ctx.fillText(currentWordObject.word, x, y);

        this.setState({
            currentWIDCount: currentWIDCount
        });
        ctx.globalAlpha = 1.0;
    }

    tryDisplayLine(ctx, x, y) {
        if (this.state.wordObjectMap == null) {
            return;
        }
        let currentWIDCount = this.state.currentWIDCount;
        let currentWordObject = this.state.wordObjectMap['wid_' + currentWIDCount];

        if (!currentWordObject) {
            return;
        }
        let currentWordObjectRow = currentWordObject.row;
        //let currentWordObjectRow = this.state.currentRow;
        let wordObjectArr = this.state.wordObjectMatrix[currentWordObjectRow];

        //Measure total length of line to determine where to place lyrics
        let totalLength = 0;
        for (let wordObj of wordObjectArr) {
            ctx.font = this.state.lineWordSize+"px Comic Sans MS";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            totalLength += ctx.measureText(wordObj.word + ' ').width;
        }
        let startPoint = window.innerWidth / 2 - totalLength / 2

        //Find fade in and fade out times
        let startTime = wordObjectArr[0].timeStamp
        let endTime = wordObjectArr[wordObjectArr.length-1].timeStamp
        let timeUntilStart = (startTime - this.state.wavePlayer.getCurrentTime()) > 0? (startTime - this.state.wavePlayer.getCurrentTime()) : 0;
        let timeAfterEnded = (this.state.wavePlayer.getCurrentTime() - endTime) > 0 ? (this.state.wavePlayer.getCurrentTime() - endTime) : 0;
        let lineAlpha = 1;
        if(this.state.wavePlayer.getCurrentTime() < startTime){
            lineAlpha = (lineAlpha - timeUntilStart) < 0? 0:(lineAlpha - timeUntilStart);
        } else if(this.state.wavePlayer.getCurrentTime() > endTime){
            lineAlpha = (lineAlpha - timeAfterEnded) < 0? 0:(lineAlpha - timeAfterEnded);
        }
        

        let offset = 0
        for (let wordObj of wordObjectArr) {
            ctx.beginPath();
            ctx.font = wordObj.wid == ('wid_' + currentWIDCount) ? this.state.lineWordSize+"px Comic Sans MS" : this.state.lineWordSize+"px Comic Sans MS";
            ctx.fillStyle = wordObj.timeStamp < this.state.wavePlayer.getCurrentTime() ? this.state.lineWordFilledColor : this.state.lineWordEmptyColor;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.globalAlpha = lineAlpha;
            ctx.fillText(wordObj.word, startPoint + offset, y);
            ctx.stroke();

            //Generating word shadow
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.shadowColor = 'red';
            ctx.shadowBlur = 5;
            ctx.fillText(wordObj.word, startPoint + offset, y);
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            //Calculating next offset
            offset += ctx.measureText(wordObj.word + ' ').width;
        }

        ctx.globalAlpha = 1;
    }

    loadSong(files) {
        this.state.wavePlayer.load(URL.createObjectURL(files[0]));
    }

    changeBackground(files) {
        document.getElementById('waveVis').style.backgroundImage = 'url(' + URL.createObjectURL(files[0]) + ')';
        document.getElementById('waveVis').style.backgroundSize = '100% 100%';
    }

    setWordObjectMap(wordObjectJSONString) {
        let wordObjectMap = JSON.parse(wordObjectJSONString);
        let wordObjectMatrix = this.buildWordObjectMatrix(wordObjectMap);
        this.setState({
            wordObjectMap: wordObjectMap,
            wordObjectMatrix: wordObjectMatrix
        });
    }

    buildWordObjectMatrix(newWordObjectMap) {

        let resultMatrix = [];
        let resultRow = [];
        let rowCount = 0;
        for (let property in newWordObjectMap) {
            if (newWordObjectMap.hasOwnProperty(property)) {
                if (newWordObjectMap[property].row > rowCount) {
                    resultMatrix.push(resultRow);
                    resultRow = [];
                    resultRow.push(newWordObjectMap[property]);
                    rowCount++;
                    while (newWordObjectMap[property].row > rowCount) {
                        resultMatrix.push([]);
                        rowCount++;
                    }
                } else {
                    resultRow.push(newWordObjectMap[property]);
                }
            }
        }
        resultMatrix.push(resultRow);
        return resultMatrix;
    }

    updateLineFontSize(value){
        this.setState({
            lineWordSize: value
        });
    }

    //Updates the center word size
    updateWordFontSize(value){
        this.setState({
            centerWordSize: value
        });
    }

    //Update the center word color
    updateWordColor(colorObject){
        let r = colorObject.rgb.r
        let g = colorObject.rgb.g
        let b = colorObject.rgb.b
        this.setState({
            centerWordColor: `rgb(${r},${g},${b})`
        });
    }

    updateLineWordFilledColor(colorObject){
        let r = colorObject.rgb.r
        let g = colorObject.rgb.g
        let b = colorObject.rgb.b
        this.setState({
            lineWordFilledColor: `rgb(${r},${g},${b})`
        });
    }

    updateLineWordEmptyColor(colorObject){
        let r = colorObject.rgb.r
        let g = colorObject.rgb.g
        let b = colorObject.rgb.b
        this.setState({
            lineWordEmptyColor: `rgb(${r},${g},${b})`
        });
    }

    render() {

        return (
            <div>
                <canvas id="waveVis"></canvas>
                <Card className="text-center">
                    <Card.Body>
                        <div id="wavePlayer"></div>
                    </Card.Body>
                    <Card.Footer>
                        <div className="row">
                            <div className="col-sm-4">
                                <button className="btn btn-primary" onClick={this.togglePlay.bind(this)}>Play/Pause</button>
                            </div>
                            <div className="col-sm-8">

                                <div className="row">
                                    <div className="col-sm-3">
                                        <label>Song</label>
                                    </div>
                                    <div className="col-sm-9">
                                        <input className="form-control-file" type="file" onChange={(e) => this.loadSong(e.target.files)}></input>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <label>Time Struct</label>
                                    </div>
                                    <div className="col-sm-9">
                                        <LyricModal parseLyrics={(lyrics) => { this.setWordObjectMap(lyrics) }}></LyricModal>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <label>Background</label>
                                    </div>
                                    <div className="col-sm-9">
                                        <input className="form-control-file" type="file" onChange={(e) => this.changeBackground(e.target.files)}></input>
                                    </div>
                                </div>
                                <div className="row form-group">
                                    <div className="col-sm-3">
                                        <label className="col-form-label">Center Word Size</label>
                                    </div>
                                    <div className="col-sm-9">
                                        <input className="form-control" onChange={(e) => { this.updateWordFontSize(e.target.valueAsNumber) }} type="range" min="1" max="100" defaultValue="60"></input>
                                    </div>
                                </div>
                                <div className="row form-group">
                                    <div className="col-sm-3">
                                        <label className="col-form-label">Line Word Size</label>
                                    </div>
                                    <div className="col-sm-9">
                                        <input className="form-control" onChange={(e) => { this.updateLineFontSize(e.target.valueAsNumber) }} type="range" min="1" max="100" defaultValue="30"></input>
                                    </div>
                                </div>
                                <div className="row form-group">
                                    <div className="col-sm-3">
                                        <label className="col-form-label">Center Word Color</label>
                                    </div>
                                    <div className="col-sm-9">
                                        <Chrome color={this.state.centerWordColor} onChangeComplete={this.updateWordColor.bind(this)}></Chrome>
                                    </div>
                                </div>
                                <div className="row form-group">
                                    <div className="col-sm-3">
                                        <label className="col-form-label">Line Word Filled Color</label>
                                    </div>
                                    <div className="col-sm-9">
                                        <Chrome color={this.state.lineWordFilledColor} onChangeComplete={this.updateLineWordFilledColor.bind(this)}></Chrome>
                                    </div>
                                </div>
                                <div className="row form-group">
                                    <div className="col-sm-3">
                                        <label className="col-form-label">Line Word Empty Color</label>
                                    </div>
                                    <div className="col-sm-9">
                                        <Chrome color={this.state.lineWordEmptyColor} onChangeComplete={this.updateLineWordEmptyColor.bind(this)}></Chrome>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card.Footer>
                </Card>
            </div>
        );
    }
}

class LyricModal extends React.Component {
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
                <div className="text-left">
                    <button onClick={this.openModal.bind(this)}>
                        Input Time Struct
                    </button>
                </div>
                
                <Modal show={this.state.showModal} onHide={this.closeModal.bind(this)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Input Lyrics</Modal.Title>
                    </Modal.Header>
                    <Modal.Body><Form.Control as="textarea" rows="3" onChange={(e) => { this.setState({ addedLyrics: e.target.value }) }}></Form.Control></Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={() => { this.props.parseLyrics(this.state.addedLyrics); this.setState({ showModal: false }) }}>
                            Render Timed Lyrics
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}

export default LyricGraphApp;