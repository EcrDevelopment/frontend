// src/routes/index.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AbuoutPage';
import NotFoundPage from '../pages/NotFoundPage';
import CalculoFlete from '../components/importaciones/CalculoFletesExtranjeros/CalculoFlete';
import ReporteEstiba from '../components/importaciones/PagoEstibas/FormReporteEstiba';
import ListadoFletes from '../components/importaciones/ListaFletesExtranjeros/ListaFletexExtranjeros';

const AppRoutes = ({ resetContent }) => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="*" element={<NotFoundPage />} />

    {/* Rutas de importaciones */}    
    <Route path="/importaciones/calculo-fletes-ext" element={<CalculoFlete resetContent={resetContent}/>} />   
    <Route path="/importaciones/reporte-estiba" element={<ReporteEstiba resetContent={resetContent}/>} />  
    <Route path="/importaciones/lista-viajes" element={<ListadoFletes resetContent={resetContent}/>} /> 
    
  </Routes>
);

export default AppRoutes;
