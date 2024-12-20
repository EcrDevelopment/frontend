// src/routes/index.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AbuoutPage';
import NotFoundPage from '../pages/NotFoundPage';
import CalculoFlete from '../components/importaciones/CalculoFletesExtranjeros/CalculoFlete';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="*" element={<NotFoundPage />} />

    {/* Rutas de importaciones */}    
    <Route path="/importaciones/calculo-fletes-ext" element={<CalculoFlete />} />   
    
  </Routes>
);

export default AppRoutes;
