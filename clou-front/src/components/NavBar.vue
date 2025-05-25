<!-- src/components/NavBar.vue -->
<template>
    <nav class="nav">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/movies">Movie</RouterLink>
      <RouterLink to="/emotions">Emotion</RouterLink>
    </nav>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .nav {
    display: flex;
    gap: 1rem;
    background-color: #222;
    padding: 1rem;
  }
  a {
    color: white;
    text-decoration: none;
  }
  .router-link-active {
    font-weight: bold;
    text-decoration: underline;
  }
  </style>
  