<template>
  <div class="page404">
    <h1>This page does not exist.</h1>
    <h2>Go to <router-link to="/">Home page</router-link></h2>
    <img src="https://bench.co/gifs/bigfoot.gif" alt="">
  </div>
</template>

<script>
export default {
  name: 'page404',
  components: {
  }
}
</script>

<style scoped lang="scss">
.page404 {
  padding-top: 100px;
  background-color: #EFEDE8;
  min-height: 100vh;

  > h1 {
    margin: 0 auto;
    width: max-content;
  }

  > h2 {
    margin: 10px auto;
    width: max-content;
    font-size: 22px;
  }

  > img {
    display: block;
    margin: 0 auto;
    width: 900px;
    object-fit: contain;
  }

}
</style>