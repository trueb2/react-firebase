import React, { Component } from 'react';
import firebase from 'firebase';
import logo from './logo.svg';
import './App.css';

class ItemList extends Component {
  render() {
    const listItems = this.props.keys.map(function(key, idx) {
      return (
        <li key={key}>
          {this.props.items[idx].text}
          <span onClick={this.props.removeItem.bind(null, key)}
            style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
            &times;
          </span>
        </li>
      );
    }.bind(this));
    return (<ul> {listItems} </ul>);
  }
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: false,
      text: '',
      keys: [],
      items: []
    };
  }

  componentWillMount() {
    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyACt3yZHVgJ6x_TQAIPouj4hdqY2d5cYdw",
      authDomain: "reacttestproj-4875c.firebaseapp.com",
      databaseURL: "https://reacttestproj-4875c.firebaseio.com",
      projectId: "reacttestproj-4875c",
      storageBucket: "",
      messagingSenderId: "141751384347"
    };
    firebase.initializeApp(config);

    //listen to items
    this.firebaseRef = firebase.database().ref("items");
    this.firebaseRef.on('value', function(dataSnapshot) {
      const items = dataSnapshot.val() || {};
      this.setState({
        keys: Object.keys(items),
        items: Object.values(items)
      });
    }.bind(this));
  }

  componentWillUnmount() {
    this.firebaseRef.off();
  }

  removeItem(key) {
    console.log(key);
    this.firebaseRef.child(key).remove();
  }

  handleSubmit(e) {
    e.preventDefault();
    if(this.state.text && this.state.text.trim().length !== 0) {
      this.firebaseRef.push({
        text: this.state.text
      }).catch(function(error) {
        console.log(error);
      });
    }
    this.setState({text: ""});
  }

  onChange(e) {
    this.setState({text: e.target.value});
  }

  signInWithGoogle(e) {
    const _this = this;
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      const token = result.credential.accessToken;
      console.log(token);
      _this.setState({
        user: result.user
      })
    }).catch(function(error) {
      console.log(error.message);
    });
  }

  signOut(e) {
    const _this = this;
    firebase.auth().signOut().then(function() {
      alert("You have been signed out");
    }).catch(function(error) {
      alert("Failed to sign out");
    }).then(function() {
      _this.setState({ user: null })
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Sign in to Add or Remove an Item</h2>
        </div>
        { this.state.user ?
          <button onClick={this.signOut.bind(this)}>
            Sign Out from {this.state.user.displayName}
          </button>
          :
          <button onClick={this.signInWithGoogle.bind(this)}>
            Auth with Google
          </button>
        }

        <form onSubmit={this.handleSubmit.bind(this)}>
          <input onChange={this.onChange.bind(this)} value={this.state.text} />
          <button> { 'Add #' + this.state.items.length } </button>
        </form>

        <ItemList keys={this.state.keys} items={this.state.items} removeItem={this.removeItem.bind(this)} />
      </div>
    );
  }
}

export default App;
