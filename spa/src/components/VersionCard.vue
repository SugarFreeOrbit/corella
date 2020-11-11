<template>
  <div class="version-card" :class="{'version-card--permission--edit': canEditVersion}">
    <div class="version-card__header">
      <div class="version-card__header-content">
        <div class="version-card__title">{{ cardData.version }}</div>
        <div class="version-card__date" v-if="dateOfReleaseText">{{ dateOfReleaseText }}</div>
        <div class="version-card__date" v-else>No date</div>
      </div>
    </div>
    <div class="version-card__body">
      <span class="version-card__description">
        {{ cardData.description }}
      </span>
      <div class="version-card__options">
        <el-tooltip class="item" effect="dark" content="Edit" placement="left">
          <el-button @click="editVersion" size="mini" type="primary" icon="el-icon-edit" circle></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="Delete" placement="left">
          <el-button @click="deleteVersion" size="mini" type="danger" icon="el-icon-delete" circle></el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import AddVersionModal from "@/components/modals/AddVersionModal";

export default {
  name: "version-card",
  components: {AddVersionModal},
  props: {
    cardData: {
      type: Object
    }
  },
  data() {
    return {
      dateOfReleaseText: ''
    }
  },
  computed: {
    canEditVersion: function () {
      return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.editVersion;
    },
  },
  mounted() {
    if (this.cardData.dateOfRelease) {
      this.dateOfReleaseText = new Date(this.cardData.dateOfRelease).toLocaleDateString("en-GB", {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    }
  },
  methods: {
    deleteVersion() {
      this.$emit('deleteEvent', this.cardData._id)
    },
    editVersion() {
      this.$emit('editVersion', this.cardData._id)
    },
  },
}
</script>

<style scoped lang="scss">
.version-card {
  width: 200px;
  min-height: 150px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  transition: all .3s;

  &--permission--edit {
    &:hover {
      cursor: pointer;
      transform: scale(1.1);

      .version-card__options {
        right: -30px;
        opacity: 1;
      }
    }
  }

  &__header {
    border-bottom: 1px solid #87A330;

    &-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 10px;
    }
  }

  &__title {
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    margin-right: 5px;
    align-self: flex-start;
  }

  &__date {
    align-self: flex-end;
  }

  &__description {
    word-wrap: break-word;
  }

  &__body {
    position: relative;
    padding: 10px;
    height: calc(100% - 45px);
  }

  &__options {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 30px;
    opacity: 0;

    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;

    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    transition: all .3s;
  }
}
</style>

<style lang="scss">
.version-card {
  .el-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 20px;
    font-size: 10px;
    margin: 0 !important;
  }
}
</style>
