import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import Landing from './pages/landing.tsx'
import Input from './pages/inputs.tsx'
import Dashboard from './pages/dashboard.tsx'
import Chatbot from './pages/chatbot.tsx'
import DocumentAnalysis from './pages/document-analysis.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/input" element={<Input />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/document-analysis" element={<DocumentAnalysis />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
