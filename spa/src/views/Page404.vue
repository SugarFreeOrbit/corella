<template>
  <div class="page404">
    <div>
      <img src="../assets/birb.svg" alt="">
      <h1>Whoops, the page you are looking for is either unavailable to you or does not exist!</h1>
      <router-link class="back" to="/">Click to return main page</router-link>
    </div>
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
  background-color: #87A330;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  > div {
    margin-top: -200px;
    text-align: center;

    > img {
      width: 300px;
      object-fit: contain;
    }

    > h1 {
      max-width: 900px;
      margin-top: -100px;
    }

    > .back {
      display: block;
      margin-top: 20px;
      color: #666666;
      font-weight: 600;
    }

  }

}
</style>
