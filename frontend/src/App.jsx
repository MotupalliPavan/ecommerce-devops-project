import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "./services/api";
import "./App.css";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        WildKart
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>

        {token ? (
          <button className="nav-button" onClick={logout}>
            Logout
          </button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">SPRING BOOT • KUBERNETES • AWS</p>

          <h1>
            Shop smarter🚀.
            <br />
            Build better.
          </h1>

          <p>
            A modern e-commerce platform powered by Spring Boot
            microservices and deployed with Kubernetes.
          </p>

          <Link to="/products" className="button">
            Browse Products
          </Link>
        </div>

        <img src="/src/assets/hero.png" alt="E-commerce" />
      </section>

      <section className="features">
        <div>
          <h3>Microservices</h3>
          <p>Product, order, inventory and user services.</p>
        </div>

        <div>
          <h3>Secure</h3>
          <p>JWT authentication through the API Gateway.</p>
        </div>

        <div>
          <h3>Cloud Ready</h3>
          <p>Docker, Kubernetes, AWS ECR and CI/CD.</p>
        </div>
      </section>
    </main>
  );
}

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/token", {
        username,
        password,
      });

      localStorage.setItem("token", response.data);

      navigate("/products");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check your username and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page auth-page">
      <form className="auth-card" onSubmit={login}>
        <h1>Welcome Back</h1>
        <p>Login to your account</p>

        {error && <div className="error">{error}</div>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-link">
          Don't have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </form>
    </main>
  );
}

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const register = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", form);

      localStorage.setItem("token", response.data);

      navigate("/products");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page auth-page">
      <form className="auth-card" onSubmit={register}>
        <h1>Create Account</h1>
        <p>Join our e-commerce platform</p>

        {error && <div className="error">{error}</div>}

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={updateField}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={updateField}
          required
        />

        <input
          name="firstName"
          placeholder="First name"
          value={form.firstName}
          onChange={updateField}
        />

        <input
          name="lastName"
          placeholder="Last name"
          value={form.lastName}
          onChange={updateField}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={updateField}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="auth-link">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please login to view products.");
      } else {
        setError("Unable to load products.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Products loaded from the Product Service.</p>
        </div>

        <button onClick={loadProducts} disabled={loading}>
          {loading ? "Loading..." : "Load Products"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {products.length === 0 && !loading && !error && (
        <div className="empty-state">
          <h3>No products loaded</h3>
          <p>Click "Load Products" to fetch products from the backend.</p>
        </div>
      )}

      <div className="product-grid">
        {products.map((product, index) => (
          <div className="product-card" key={product.id ?? index}>
            <div className="product-image">
              Product
            </div>

            <h3>
              {product.name ?? `Product ${index + 1}`}
            </h3>

            <p>
              {product.description ?? "Product from Product Service"}
            </p>

            {product.price !== undefined && (
              <strong>${product.price}</strong>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

function Cart() {
  return (
    <main className="page">
      <h1>Your Cart</h1>
      <p>Your shopping cart is currently empty.</p>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
