import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/theme-provider";
import { ModalAddPage } from "./pages/ModalAddPage";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage/>
          </ProtectedRoute>
        }
      />
      <Route path="/add" element={<ModalAddPage/>}/>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </ThemeProvider>
    
  );
}
