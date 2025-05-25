<template>
  <div>
    <NavBar />
    <RouterView />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
</style>

