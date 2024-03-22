<template>
<header>
    <h1>E2EE Messaging App</h1>
    <nav>
        <RouterLink to="/" class="page"><b>Main</b></RouterLink>
    </nav>
</header>
</template>

<style scoped>
* {
    font-size: 24px;
}

h1 {
    display: flex;
    font-size: 38px;
    margin-top: auto;
    margin-bottom: auto;
    margin-left: 40px;
    color: white;
}

.page {
    width: auto;
    height: 2.5em;
    padding: 0.4em;
    text-align: center;
    justify-content: center;
    background-color: var(--teal);
    color: black;
    opacity: 100%;
    border-radius: 10px;
    border-width: 2px;
    border-color: black;
    border-style: solid;
    transition: 0.2s ease-in-out;
    text-decoration: none;
    margin: 20px;
}

.page:visited {
    text-decoration: none;
}

.page:hover {
    background-color: var(--yellow);
    color: black;
    cursor: pointer;
}

header {
    top: 0;
    width: 100%;
    height: 100px;
    position: fixed;
    background-color: var(--pink);
    display: flex;
    box-shadow: 0px 6px var(--blue);
    white-space: nowrap;
}

nav {
    margin: auto;
    margin-right: 40px;
    margin-left: auto;
    text-decoration: none;
}

.router-link-active {
  background-color: var(--blue);
  color: white;
}
</style>