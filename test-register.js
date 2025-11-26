// Script de test pour l'inscription
// Usage: node test-register.js

const testRegister = async () => {
  try {
    console.log('🧪 Test d\'inscription...\n');
    
    const userData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };
    
    console.log('📤 Envoi des données:', userData);
    
    const response = await fetch('http://localhost:5002/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });
    
    console.log('📊 Status:', response.status);
    
    const data = await response.json();
    console.log('📥 Réponse:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Inscription réussie!');
    } else {
      console.log('\n❌ Inscription échouée!');
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error.message);
  }
};

testRegister();



