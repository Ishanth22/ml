import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiHome, FiSearch, FiClock, FiBarChart2, FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FiShield size={22} />
        FraudGuard AI
      </div>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiHome size={16} /> Dashboard
        </NavLink>
        <NavLink to="/analyze" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiSearch size={16} /> Analyze
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiClock size={16} /> History
        </NavLink>
        <NavLink to="/performance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FiBarChart2 size={16} /> Performance
        </NavLink>
        <button className="nav-link logout" onClick={handleLogout}>
          <FiLogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
}
