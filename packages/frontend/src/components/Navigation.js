import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';

import { logout } from '../services/api';

const Navigation = ({ onLogout }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    logout();
    onLogout();
    navigate('/login');
  };

  const greeting = (() => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const randomEmoji = ['👋', '😊', '🌟', '✨'][Math.floor(Math.random() * 4)];
    return `Good ${timeOfDay}, ${user.firstname || 'User'} ${randomEmoji}`;
  })();

  return (
    <nav className="mb-5 flex items-center justify-between bg-[#333] p-2.5">
      <div>
        <Link className="mr-5 text-white no-underline" to="/users">
          Users
        </Link>
        <Link className="text-white no-underline" to="/products">
          Products
        </Link>
      </div>
      <div className="flex items-center">
        <span className="mr-5 text-white">{greeting}</span>
        <button className="cursor-pointer rounded border-none bg-[#f44336] px-4 py-2 text-white" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

Navigation.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default Navigation;
