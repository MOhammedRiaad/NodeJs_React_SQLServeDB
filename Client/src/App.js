import React ,{Component} from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  state={
    response : '',
      login : {
        userName : '',
          password : ''
      },
      UserInfo:[]
  }
  componentDidMount() {
    this.callApi()
      .then(res => {

        // Parse Data [STRING into JSON]
        const parsedData = JSON.parse(res.express)
        console.log(parsedData["recordset"]
        )
        const data = parsedData["recordset"]

        // State Management
        this.setState({ response: res.express })

        // Show Data
        this.showData(data)

      })
      .catch(err => console.log(err))
  }
   callApi = async () => {
    const response = await fetch('/api/')
    const body = await response.json()
    if (response.status !== 200) throw Error(body.message)
    return body
  }

  showData = (trends) => {
    const dataTable = document.querySelector("#datashow")

    // Clear current data
    dataTable.innerHTML = ""

    // Fill it with trends
    trends.map(trend => {

      // Create Row & Columns
      const row = document.createElement("ul")
      const col_trendName = document.createElement("li")
     // const col_trendVolume = document.createElement("a")

      // Fill them with data
      col_trendName.innerHTML = `<a href="#" value="${trend.Serial}">${trend.First_Name}</a> `
      //col_trendVolume.innerText = trend.FatherID

      // Append Children
      row.appendChild(col_trendName)
    //  row.appendChild(col_trendVolume)
      dataTable.appendChild(row)
      
    })
  }

  UserLogin =   async e => {
          const {login}= this.state;
          let divView = document.querySelector('.loginData');

          e.preventDefault()
          const response =  fetch(`/api/login/post?userName=${login.userName}&Password=${login.password}`, {
              method: 'Get',
              headers: {
                  'Content-Type': 'application/json',
              },
          }).then(response => response.json()).then(
              response => {

      const UserData = JSON.parse(response.express);
      console.log(UserData["recordset"]["0"]);
this.setState({UserInfo :UserData["recordset"]["0"] })
                  console.log(this.state.UserInfo)
      divView.append(this.state.UserInfo)
              }
              );

      };



  render(){

      const {login} = this.state
    return (
      <div className="App">
        <div className="tree">
        <div id="datashow"></div>
        </div>
          <div >
              <input value={login.userName} onChange={e => this.setState({login : {...login,userName:e.target.value}})}/>
              <input value={login.password} onChange={e => this.setState({login : {...login,password:e.target.value}})}/>
              <button onClick={this.UserLogin}>login</button>
          </div>
          <div className='loginData'></div>
      </div>
    );
  }
  
}

export default App;
