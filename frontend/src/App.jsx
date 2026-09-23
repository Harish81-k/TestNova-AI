import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ChatInterface from './pages/ChatInterface';
import CodingInterface from './pages/CodingInterface';
import AssignmentInterface from './pages/AssignmentInterface';
import QuizInterface from './pages/QuizInterface';
import GamingBoardInterface from './pages/GamingBoardInterface';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('access_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }

    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    });

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          setToken(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />
          
          {/* Full Screen Routes */}
          <Route path="/quiz/:quizId" element={
            token ? <QuizInterface /> : <Navigate to="/login" />
          } />

          {/* Layout Wrapped Routes */}
          <Route path="/" element={
            token ? (
              <Layout setToken={setToken}>
                <ChatInterface />
              </Layout>
            ) : <Navigate to="/login" />
          } />

          <Route path="/chat/:id" element={
            token ? (
              <Layout setToken={setToken}>
                <ChatInterface />
              </Layout>
            ) : <Navigate to="/login" />
          } />
          
          <Route path="/code" element={
            token ? (
              <Layout setToken={setToken}>
                <CodingInterface />
              </Layout>
            ) : <Navigate to="/login" />
          } />

          <Route path="/gaming" element={
            token ? (
              <Layout setToken={setToken}>
                <GamingBoardInterface />
              </Layout>
            ) : <Navigate to="/login" />
          } />
          
          <Route path="/assignments" element={
            token ? (
              <Layout setToken={setToken}>
                <AssignmentInterface />
              </Layout>
            ) : <Navigate to="/login" />
          } />

          <Route path="/assignments/:id" element={
            token ? (
              <Layout setToken={setToken}>
                <AssignmentInterface />
              </Layout>
            ) : <Navigate to="/login" />
          } />

          <Route path="/profile" element={
            token ? (
              <Layout setToken={setToken}>
                <Profile />
              </Layout>
            ) : <Navigate to="/login" />
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
