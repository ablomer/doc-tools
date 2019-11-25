<template>
  <div
    v-cloak
    @drop.prevent="addFile"
    @dragover.prevent>

    <router-view :key="$route.fullPath"></router-view>
    
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'App',

  components: {
    
  },

  data() {
    return {
      
    }
  },

  methods: {
    
    addFile(dragEvent: any) {
      const self = this
      const droppedFiles = dragEvent.dataTransfer.files

      if (droppedFiles) {
        for (let file of droppedFiles) {
          this.$store.dispatch('addFile', file)
        }
      }
    }

  }
})
</script>
