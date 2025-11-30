<script setup lang="ts">
import { useRouter } from 'vue-router'
import { MODELING, INSTANCE_PAGE_BASE } from '@/router'

const router = useRouter()

const navigateTo = (route: string) => {
  router.push({ name: route })
}
</script>

<template>
  <main class="home-view">
    <div class="welcome-header">
      <h1>Model UI</h1>
      <p>Wählen Sie einen Bereich aus</p>
    </div>

    <div class="cards-container">
      <div class="feature-card metamodel-card" @click="navigateTo(MODELING)">
        <div class="card-icon metamodel-icon">
          <i class="pi pi-sitemap"></i>
        </div>
        <h2>MetaModel</h2>
        <p>Erstellen und bearbeiten Sie Meta-Modelle, Packages und Klassen</p>
      </div>

      <div class="feature-card instance-card" @click="navigateTo(INSTANCE_PAGE_BASE)">
        <div class="card-icon instance-icon">
          <i class="pi pi-database"></i>
        </div>
        <h2>Instance</h2>
        <p>Verwalten und bearbeiten Sie Modell-Instanzen und Daten</p>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.welcome-header {
  text-align: center;
  margin-bottom: 4rem;
  color: white;

  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  p {
    font-size: 1.25rem;
    opacity: 0.9;
  }
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 400px));
  gap: 2rem;
  max-width: 1200px;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2d3748;
  }

  p {
    font-size: 1rem;
    color: #718096;
    line-height: 1.6;
  }
}

.card-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  color: white;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  .feature-card:hover & {
    transform: scale(1.1);
  }
}

.metamodel-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.instance-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
</style>
