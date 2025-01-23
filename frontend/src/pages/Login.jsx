import './Login.css'
// import { FaUser, FaLock } from 'react-icons/fa';


function Login() {
  return (
    <div className="login">
      <div className="login-container">
        <div className='login-header'>
          <h1>Druel</h1>
          <h4>AI Automated Ultrasound Interpretation.</h4>
        </div>
        <form className='login-form'>
          <input type="text" placeholder="Username" className='login-input'/>
          <input type="password" placeholder="Password" className='login-input'/>
          <button type="submit" className='login-btn'>Login</button>
        </form>
        <p>Forgot your password?</p>
          <p>
            Do not have an account?
            <a href="">Sign Up</a>
          </p>
      </div>
    </div>
  )
}

export default Login
