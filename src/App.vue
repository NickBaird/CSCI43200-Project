<template>
<navigation-header></navigation-header>
<RouterView />
</template>
    
<script>
import NavigationHeader from './components/NavigationHeader.vue';

export default {
  components: {
    NavigationHeader
  },
  data() {
    return {
    }
  },
  methods: {

  }
}
</script>

<style>
:root {
  --yellow: #dae36b;
  --blue: #6cb5e3;
  --pink: #f3657f;
  --teal: #7fcdbb;
  --green: #b6e696;
  --purple: #a95ea3;
  --dark: #222222;
}

* {
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Trebuchet MS', sans-serif;
}
</style>  