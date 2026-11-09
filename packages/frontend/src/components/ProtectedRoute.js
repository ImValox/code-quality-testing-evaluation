import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

// Le token est lu à chaque rendu (et non depuis l'état d'App) pour prendre en compte
// une connexion ou une inscription qui vient d'avoir lieu.
const ProtectedRoute = ({ children }) => {
  if (!localStorage.getItem('token')) {
    return <Navigate replace to="/login" />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;
