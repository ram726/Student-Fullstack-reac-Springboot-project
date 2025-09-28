import './App.css';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Navbar from './layout/Navbar';
import Home from './pages/Home';
import NotificationProvider from './components/NotificationProvider';
// ensure axios interceptor is registered
import './services/axiosConfig';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddUsers from './users/AddUsers';
import EditUsers from './users/EditUser';
import ViewUsers from './users/ViewUsers';
import Footer from './pages/Footer';




function App() {
  return (
    <div className="App">
      <Router>
        <NotificationProvider>
          <Navbar />

          {/* Main content area will grow to push footer to the bottom when page is short */}
          <main className="content">
            <Routes>
              <Route exact path='/' element={<Home />} />
              <Route exact path='/adduser' element={<AddUsers />} />
              <Route exact path='/update/:id' element={<EditUsers />} />
              <Route exact path='/view/:id' element={<ViewUsers />} />
            </Routes>
          </main>

          <Footer />
        </NotificationProvider>
      </Router>

    </div>
  );
}

export default App;
