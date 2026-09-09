import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout, AuthLayout, ProtectedRoute, PublicRoute } from "./layouts";
import {
  Home,
  Login,
  Register,
  PsychicDetail,
  Bookings,
  BookingDetail,
  ConsultationPage,
  ReviewPage,
  Profile,
  NotFound,
} from "./pages";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="psychic/:id" element={<PsychicDetail />} />
            <Route path="bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="booking/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
            <Route path="consultation/:id" element={<ProtectedRoute><ConsultationPage /></ProtectedRoute>} />
            <Route path="review/:consultationId" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
