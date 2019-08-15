import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import LyricAuthorApp from './LyricAuthorApp'
import LyricVisApp from './LyricVisApp'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

function About() {
    return <h2>About</h2>;
}

function Users() {
    return <h2>Users</h2>;
}


function AppRouter() {
    return (
        <Router>
            <div className="fillHeight">
                <Navbar bg="dark" variant="dark">
                    <Navbar.Brand>Lyric Vis</Navbar.Brand>
                    <Nav to="/">
                        <Link to="/">Author</Link>
                    </Nav>
                    <Nav>
                        <Link to="/vis/">Vis</Link>
                    </Nav>
                    <Nav>
                        <Link to="/users/">Users</Link>
                    </Nav>
                </Navbar>

                <Route path="/" exact component={LyricAuthorApp} />
                <Route path="/vis/" component={LyricVisApp} />
                <Route path="/users/" component={Users} />
            </div>
        </Router>
    );
}

ReactDOM.render(<AppRouter></AppRouter>, document.getElementById("root"));


