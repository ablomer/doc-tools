<template>
  <v-simple-table>
    <draggable v-model="files" tag="tbody">
      <tr v-for="(file, index) in files" :key="index" class="unselectable">
        <td style="col-1">
          <v-icon>mdi-drag-horizontal</v-icon>
        </td>
        <td style="col-8">{{ file.name }}</td>
        <td style="col-2">{{ humanFileSize(file.size, false) }}</td>
        <td style="col-1">
          <v-btn text icon color="red" @click="removeFile(index)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </td>
      </tr>
    </draggable>
  </v-simple-table>
</template>

<script>
// https://sortablejs.github.io/Vue.Draggable/#/table-example

import draggable from 'vuedraggable'

export default {
  components: {
    draggable
  },

  computed: {
    files: {
      get() {
        return this.$store.state.files
      },
      set(files) {
        this.$store.dispatch('setFiles', files)
      }
    }
  },

  methods: {
    removeFile(index) {
      this.$store.dispatch('removeFile', index)
    },

    humanFileSize(bytes, si) {
      var thresh = si ? 1000 : 1024
      if (Math.abs(bytes) < thresh) {
        return bytes + " B"
      }
      var units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
      var u = -1
      do {
        bytes /= thresh
        ++u
      } while (Math.abs(bytes) >= thresh && u < units.length - 1)
      return bytes.toFixed(1) + " " + units[u]
    }
  }
}
</script>

<style>
.unselectable {
  -webkit-user-select: none; /* Safari */        
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */
}
</style>