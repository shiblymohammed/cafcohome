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
import Backup from './pages/Backup';

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
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="categories"
              element={
                <ProtectedRoute adminOnly>
                  <CategoriesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="collections"
              element={
                <ProtectedRoute adminOnly>
                  <Collections />
                </ProtectedRoute>
              }
            />
            <Route
              path="brands"
              element={
                <ProtectedRoute adminOnly>
                  <Brands />
                </ProtectedRoute>
              }
            />
            <Route
              path="materials-colors"
              element={
                <ProtectedRoute adminOnly>
                  <MaterialsColors />
                </ProtectedRoute>
              }
            />
            <Route
              path="products"
              element={
                <ProtectedRoute adminOnly>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="products/add"
              element={
                <ProtectedRoute adminOnly>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="products/edit/:slug"
              element={
                <ProtectedRoute adminOnly>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="offers"
              element={
                <ProtectedRoute adminOnly>
                  <Offers />
                </ProtectedRoute>
              }
            />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderNumber" element={<OrderDetail />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="stock-management" element={<StockManagement />} />
            <Route path="stock-movements" element={<StockMovements />} />
            <Route path="stock-alerts" element={<StockAlerts />} />
            <Route
              path="users"
              element={
                <ProtectedRoute adminOnly>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="staff"
              element={
                <ProtectedRoute adminOnly>
                  <Staff />
                </ProtectedRoute>
              }
            />
            <Route
              path="blog"
              element={
                <ProtectedRoute adminOnly>
                  <Blog />
                </ProtectedRoute>
              }
            />
            <Route
              path="shop-by-room"
              element={
                <ProtectedRoute adminOnly>
                  <ShopByRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="backup"
              element={
                <ProtectedRoute adminOnly>
                  <Backup />
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
