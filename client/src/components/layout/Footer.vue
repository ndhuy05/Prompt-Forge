<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-brand">
          <h3>🚀 CodeForge</h3>
          <p>AI Prompt Sharing Platform for Developers</p>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h4>Platform</h4>
            <a href="/prompts">Browse Prompts</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/about">About</a>
          </div>
          
          <div class="link-group">
            <h4>Support</h4>
            <a href="/help">Help Center</a>
            <a href="/contact">Contact</a>
            <a href="/feedback">Feedback</a>
          </div>
          
          <div class="link-group">
            <h4>Legal</h4>
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2025 CodeForge. All rights reserved.</p>
        <div class="social-links">
          <a href="#" aria-label="GitHub">🐙</a>
          <a href="#" aria-label="Twitter">🐦</a>
          <a href="#" aria-label="Discord">💬</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #2c3e50;
  color: white;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  margin-bottom: 30px;
}

.footer-brand h3 {
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.footer-brand p {
  color: #bdc3c7;
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.link-group h4 {
  margin-bottom: 15px;
  color: #ecf0f1;
}

.link-group a {
  display: block;
  color: #bdc3c7;
  text-decoration: none;
  margin-bottom: 8px;
  transition: color 0.2s;
}

.link-group a:hover {
  color: #667eea;
}

.footer-bottom {
  border-top: 1px solid #34495e;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-bottom p {
  color: #bdc3c7;
  margin: 0;
}

.social-links {
  display: flex;
  gap: 15px;
}

.social-links a {
  font-size: 1.2rem;
  text-decoration: none;
  transition: transform 0.2s;
}

.social-links a:hover {
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}
</style>
