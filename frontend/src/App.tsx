import { BrowserRouter, Route, Routes } from "react-router-dom";
import FoodStatusTracker from "./components/screens/FoodStatusTracker";
import Layout from "./components/utils/Layout";
import PersistentLogin from "./components/utils/PersistentLogin";
import Homepage from "./components/screens/Homepage";
import BarcodeScanner from "./components/screens/BarcodeScanner";
import Login from "./components/screens/Login";
import Callback from "./components/utils/Callback";
import Signup from "./components/screens/Signup";
import Profile from "./components/screens/Profile";
import { RedirectToMain } from "./components/utils/Redirect";
import UserScannedItems from "./components/screens/UserScannedItems";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback/signup" element={<Callback />} />
        <Route path="/auth/callback/login" element={<Callback />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route element={<PersistentLogin />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/foodScan/:foodId" element={<FoodStatusTracker />} />
            <Route
              path="/foodScan/barcodescanner"
              element={<BarcodeScanner />}
            />
            <Route path="/userActivity" element={<UserScannedItems />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        <Route path="*" element={<RedirectToMain />} />
      </Routes>
    </BrowserRouter>
  );
}
