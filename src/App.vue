<template>
  <div id="app">
    <div id="nav">
      <!-- <router-link to="/blog/">Back to Moogle</router-link> -->
      <h1>Welcome to the Moogle Blog!</h1>
    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: "Poppins", Arial, sans-serif;
  font-size: 0.875rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
