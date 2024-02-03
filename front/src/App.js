
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './component/Login';
import SignUp from './component/SignUp';
import Home from './component/home';
import NewEmail from './component/NewEmail';
  

function App() {
 
  return (
    
    <Router>
      <div className="App">
        <header className='App-header'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/rejestracja" element={<SignUp />} />
            <Route path="/nowy" element={<NewEmail />} />
            

            <Route path="*" element={<div><h1>Page Not Found</h1></div>} /> 

          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;

