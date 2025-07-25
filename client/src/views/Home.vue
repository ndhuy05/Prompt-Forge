<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            🚀 Welcome to CodeForge
          </h1>
          <p class="hero-subtitle">
            Discover, share, and improve AI prompts with the developer community
          </p>
          <div class="hero-actions">
            <router-link to="/register" class="btn btn-primary">
              Get Started
            </router-link>
            <router-link to="/prompts" class="btn btn-secondary">
              Browse Prompts
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2 class="section-title">Why Choose CodeForge?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Smart Search</h3>
            <p>Find prompts by keywords, tags, programming languages with AI-powered recommendations</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🧠</div>
            <h3>AI Summary</h3>
            <p>Automatic AI-generated summaries for better understanding of complex prompts</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">👍</div>
            <h3>Community Driven</h3>
            <p>Like and comment on prompts. Connect with the community</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h3>Analytics</h3>
            <p>Track trending prompts, top contributors, and popular programming languages</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// No script needed for this component
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 120px 0 80px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.3rem;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.features {
  padding: 80px 0;
  background: #f8f9fa;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 60px;
  color: #2c3e50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
}

.feature-card p {
  color: #6c757d;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero {
    padding: 80px 0 60px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .features {
    padding: 60px 0;
  }
  
  .section-title {
    font-size: 2rem;
    margin-bottom: 40px;
  }
  
  .features-grid {
    gap: 30px;
  }
  
  .feature-card {
    padding: 30px 20px;
  }
}
</style>
