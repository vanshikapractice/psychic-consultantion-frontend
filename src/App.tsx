import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "./contexts/AuthContext";
import { store } from "./store";
import {
  MainLayout,
  AuthLayout,
  ProtectedRoute,
  RoleProtectedRoute,
  PublicRoute,
} from "./layouts";
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
  PsychicDashboard,
} from "./pages";
import { queryClient } from "./react-query/queryClient";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
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
                 <Route
                   path="psychic/dashboard"
                   element={
                     <RoleProtectedRoute allowedRoles={["psychic"]}>
                       <PsychicDashboard />
                     </RoleProtectedRoute>
                   }
                 />
               </Route>

              <Route element={<AuthLayout />}>
                <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </QueryClientProvider>
  );
}
