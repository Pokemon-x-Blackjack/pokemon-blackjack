import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Landing from './components/Landing';
import Result from './components/Result';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorPage from './components/Error404';

import './css/App.css';




function App() {

  return (
    <div className="App">

      <Routes>
        <Route path="/module" element={<Result />} />
        <Route path="/404" element={<ErrorPage />} />
      </Routes>

      <Header />
      <main>
        <Landing />
      </main>
      <Footer />


    </div>
  );
}

export default App;