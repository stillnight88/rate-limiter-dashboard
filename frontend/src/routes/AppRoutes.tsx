import { Routes, Route } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';
import Login from '@/pages/Login.jsx';
import Signup from '@/pages/Signup';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
    </Routes>
  );
};
