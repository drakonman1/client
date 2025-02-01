import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import logo from "../../assets/InvoxLogo.png";
import dashboardPreview from "../../assets/dashboard-preview.png";

// Feature Data Array
const features = [
  {
    id: 1,
    icon: "📊",
    title: "AI-Powered Analytics",
    description: "Real-time business insights and predictive financial forecasting"
  },
  {
    id: 2,
    icon: "⚡",
    title: "Instant Payments",
    description: "Accept credit cards, bank transfers, and crypto with 1-click checkout"
  },
  {
    id: 3,
    icon: "🤖",
    title: "Smart Automation",
    description: "Auto-generate invoices, reminders, and payroll with AI"
  },
  {
    id: 4,
    icon: "🔒",
    title: "Bank-Grade Security",
    description: "SOC 2 certified with end-to-end encryption"
  }
];

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="landing-container">
      {/* Enhanced Header */}
      <header className="landing-header">
        <div className="nav-container">
          
          {/* Hamburger Menu */}
          <button 
            className="hamburger-menu" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            ☰
          </button>

          {/* Navigation Links */}
          <nav className={`nav-links ${isMenuOpen ? "active" : ""}`}>
            <ul>
              <li><Link to="/features" onClick={() => setIsMenuOpen(false)}>Features</Link></li>
              <li><Link to="/pricing" onClick={() => setIsMenuOpen(false)}>Pricing</Link></li>
              <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link></li>
              <li className="desktop-only"><Link to="/login" className="login-btn">Login</Link></li>
              <li><Link to="/register" className="signup-btn">Get Started</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 🔹 IMPROVED HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Transform Your Business Finances with AI-Powered Efficiency</h1>
            <p className="subtitle">Automate invoicing, payroll, and reporting while saving 10+ hours monthly</p>
            <div className="hero-buttons">
              <Link to="/register" className="cta-button">
                Start Free Trial <span className="free-trial">(No credit card needed)</span>
              </Link>
              <Link to="/features" className="secondary-button">
                Watch Demo Video
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src={dashboardPreview} 
              alt="Invox dashboard showing financial analytics" 
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 🔹 TRUST BADGES SECTION */}
      <div className="trust-badges">
        <p>Trusted by 5,000+ businesses worldwide</p>
        <div className="company-logos">
          {[1, 2, 3, 4].map((num) => (
            <img 
              key={num}
              src={`/company-logo-${num}.png`} 
              alt="Trusted company" 
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {/* 🔹 ENHANCED FEATURES GRID */}
      <section className="features-section">
        <h2>Everything You Need to Streamline Finances</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.id}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link to="/features" className="feature-link">
                Learn More →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 IMPROVED PRICING SECTION */}
      <section className="pricing-section">
        <h2>Simple, Transparent Pricing</h2>
        <p className="pricing-subtitle">Start free, upgrade as you grow</p>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Starter</h3>
            <div className="price">$0<span>/month</span></div>
            <ul className="features-list">
              <li>✓ Basic Invoicing</li>
              <li>✓ 5 Clients</li>
              <li>✓ 1 Team Member</li>
            </ul>
            <Link to="/register" className="price-cta">
              Get Started Free
            </Link>
          </div>

          <div className="pricing-card popular">
            <div className="popular-badge">Most Popular</div>
            <h3>Professional</h3>
            <div className="price">$15<span>/month</span></div>
            <ul className="features-list">
              <li>✓ Unlimited Invoices</li>
              <li>✓ Client Portal</li>
              <li>✓ Advanced Analytics</li>
              <li>✓ 5 Team Members</li>
            </ul>
            <Link to="/register" className="price-cta">
              Start 14-Day Trial
            </Link>
          </div>

          <div className="pricing-card">
            <h3>Business</h3>
            <div className="price">$50<span>/month</span></div>
            <ul className="features-list">
              <li>✓ Everything in Pro</li>
              <li>✓ Payroll Management</li>
              <li>✓ Priority Support</li>
              <li>✓ Unlimited Team</li>
            </ul>
            <Link to="/register" className="price-cta">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* 🔹 ENHANCED TESTIMONIALS */}
      <section className="testimonials-section">
        <h2>What Our Customers Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>“Invox cut our accounting time by 70%! The AI automation is a game-changer.”</p>
              <div className="author">
                <img src="/user1.jpg" alt="Sarah Johnson" />
                <div>
                  <h4>Sarah Johnson</h4>
                  <p>CEO, TechStart Inc.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>“From setup to daily use, Invox just works. Our finance team loves it!”</p>
              <div className="author">
                <img src="/user2.jpg" alt="Mike Chen" />
                <div>
                  <h4>Mike Chen</h4>
                  <p>CFO, Digital Agency Co.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 FOOTER WITH IMPROVED LAYOUT */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-column">
            <h4>Product</h4>
            <ul>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/integrations">Integrations</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/webinars">Webinars</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/security">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Invox. All rights reserved.</p>
          <div className="social-links">
            <a href="#twitter" aria-label="Twitter"><img src="/twitter-icon.svg" alt="" /></a>
            <a href="#linkedin" aria-label="LinkedIn"><img src="/linkedin-icon.svg" alt="" /></a>
            <a href="#facebook" aria-label="Facebook"><img src="/facebook-icon.svg" alt="" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;