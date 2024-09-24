import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface PublicRouteProps extends RouteProps { component: React.ComponentType<any>; }

const PublicRoute: React.FC<PublicRouteProps> = ({ component: Component, ...rest }) => {
  const { currentUser } = useAuth();

  return (
    <Route
      {...rest}
      render={props =>
        !currentUser ? (
          <Component {...props} />
        ) : (
          <Redirect to="/home" />
        )
      }
    />
  );
};

export default PublicRoute;