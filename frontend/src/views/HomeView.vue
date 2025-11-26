<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">Gestionnaire de Groupes</span>
          <br>& Tâches Collaboratif
        </h1>
        <p class="hero-subtitle">
          Organisez vos projets, gérez vos équipes et suivez vos tâches en temps réel.
          Simple, efficace et collaboratif.
        </p>
        <div class="hero-actions">
          <RouterLink to="/register" class="btn btn-primary">
            Commencer gratuitement
          </RouterLink>
          <RouterLink to="/login" class="btn btn-secondary">
            Se connecter
          </RouterLink>
        </div>
      </div>
      <div class="hero-visual">
        <div class="floating-card card-1">
          <div class="card-icon"></div>
          <div class="card-text">Groupes</div>
        </div>
        <div class="floating-card card-2">
          <div class="card-icon">📋</div>
          <div class="card-text">Tâches</div>
        </div>
        <div class="floating-card card-3">
          <div class="card-icon">✅</div>
          <div class="card-text">Suivi</div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2 class="section-title">Fonctionnalités principales</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon"></div>
          <h3>Gestion de groupes</h3>
          <p>Créez des groupes, invitez des membres et collaborez efficacement sur vos projets.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"></div>
          <h3>Suivi des tâches</h3>
          <p>Assignez des tâches, définissez des priorités et suivez la progression en temps réel.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔗</div>
          <h3>Invitations faciles</h3>
          <p>Partagez des liens d'invitation sécurisés pour ajouter rapidement de nouveaux membres.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"></div>
          <h3>Vue d'ensemble</h3>
          <p>Visualisez l'état de vos projets et tâches d'un seul coup d'œil.</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-content">
        <h2>Prêt à organiser vos projets ?</h2>
        <p>Rejoignez-nous et commencez à collaborer dès maintenant</p>
        <RouterLink to="/register" class="btn btn-cta">
          Créer un compte gratuitement
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
}

/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 80vh;
}

.hero-content {
  animation: fadeInUp 0.8s ease-out;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.gradient-text {
  background: linear-gradient(135deg, #42b983 0%, #2c8e5f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #42b983 0%, #2c8e5f 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 185, 131, 0.4);
}

.btn-secondary {
  background: white;
  color: #42b983;
  border: 2px solid #42b983;
}

.btn-secondary:hover {
  background: #f0fdf7;
  transform: translateY(-2px);
}

/* Hero Visual */
.hero-visual {
  position: relative;
  height: 400px;
  animation: fadeIn 1s ease-out;
}

.floating-card {
  position: absolute;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  animation: float 3s ease-in-out infinite;
}

.card-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.card-2 {
  top: 50%;
  right: 10%;
  animation-delay: 0.5s;
}

.card-3 {
  bottom: 10%;
  left: 30%;
  animation-delay: 1s;
}

.card-icon {
  font-size: 3rem;
}

.card-text {
  font-weight: 600;
  color: #2c3e50;
}

/* Features Section */
.features {
  padding: 6rem 2rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* CTA Section */
.cta {
  background: linear-gradient(135deg, #42b983 0%, #2c8e5f 100%);
  padding: 6rem 2rem;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.btn-cta {
  background: white;
  color: #42b983;
  padding: 1.25rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.btn-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Responsive */
@media (max-width: 968px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
    padding: 3rem 1.5rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-visual {
    height: 300px;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-content h2 {
    font-size: 2rem;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 2rem;
  }

  .btn {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }

  .floating-card {
    padding: 1.5rem;
  }

  .card-icon {
    font-size: 2rem;
  }
}
</style>

