import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CategoriesManagement from './pages/CategoriesManagement';
import Collections from './pages/Collections';
import Brands from './pages/Brands';
import MaterialsColors from './pages/MaterialsColors';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Offers from './pages/Offers';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Inventory from './pages/Inventory';
import StockManagement from './pages/StockManagement';
import StockMovements from './pages/StockMovements';
import StockAlerts from './pages/StockAlerts';
import Users from './pages/Users';
import Staff from './pages/Staff';
import Blog from './pages/Blog';
import ShopByRoom from './pages/ShopByRoom';
import Promotions from './pages/Promotions';
import Backup from './pages/Backup';
import Phase2Overview from './pages/phase2/Phase2Overview';
import Coupons from './pages/phase2/Coupons';
import Reviews from './pages/phase2/Reviews';
import LoyaltyProgram from './pages/phase2/LoyaltyProgram';
import EmailCampaigns from './pages/phase2/EmailCampaigns';
import Analytics from './pages/phase2/Analytics';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              <Login />
            } 
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
            <Route
              path="categories"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><CategoriesManagement /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="collections"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Collections /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="brands"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Brands /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="materials-colors"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><MaterialsColors /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="products"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Products /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="products/add"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><AddProduct /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="products/edit/:slug"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><AddProduct /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="offers"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Offers /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route path="orders" element={<ErrorBoundary><Orders /></ErrorBoundary>} />
            <Route path="orders/:orderNumber" element={<ErrorBoundary><OrderDetail /></ErrorBoundary>} />
            <Route path="inventory" element={<ErrorBoundary><Inventory /></ErrorBoundary>} />
            <Route path="stock-management" element={<ErrorBoundary><StockManagement /></ErrorBoundary>} />
            <Route path="stock-movements" element={<ErrorBoundary><StockMovements /></ErrorBoundary>} />
            <Route path="stock-alerts" element={<ErrorBoundary><StockAlerts /></ErrorBoundary>} />
            <Route
              path="users"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Users /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="staff"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Staff /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="blog"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Blog /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="shop-by-room"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><ShopByRoom /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="promotions"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Promotions /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="backup"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Backup /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="phase2"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Phase2Overview /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="phase2/coupons"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Coupons /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="phase2/reviews"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Reviews /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="phase2/loyalty"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><LoyaltyProgram /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="phase2/email-campaigns"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><EmailCampaigns /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="phase2/analytics"
              element={
                <ProtectedRoute adminOnly>
                  <ErrorBoundary><Analytics /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
