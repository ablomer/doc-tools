<template>
  <v-simple-table fixed-header>
    <template v-slot:default>
      <thead>
        <tr>
          <th></th>
          <th class="text-left">Name</th>
          <th class="text-left">Size</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(file, index) in files" :key="index">
          <td>
            <v-icon>mdi-drag-horizontal</v-icon>
          </td>
          <td>{{ file.name }}</td>
          <td>{{ humanFileSize(file.size, false) }}</td>
          <td>
            <v-btn text icon color="red" @click="removeFile(index)">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
import { serverBus } from "../main"

export default {
  props: [
    "files"
  ],

  methods: {
    removeFile(index) {
      serverBus.$emit('removeFile', index)
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