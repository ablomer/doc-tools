<template>
  <v-app id="inspire">

    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
    >
      <v-list dense>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-settings</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-left
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>

    <v-content>
      <v-card class="mx-auto">

        <files-table
          :files="files" />

      </v-card>

      <v-btn
        fab
        bottom
        right
        :disabled="mergeDisabled()" 
        :loading="loading"
        @click="merge()"
      >
        <v-icon dark>mdi-merge</v-icon>
      </v-btn>

    </v-content>

    <v-footer app>
      <span>&copy; 2019 Augusto Blomer</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
  // https://blog.shovonhasan.com/using-promises-with-filereader/
  // https://github.com/Hopding/pdf-lib
  // https://pdf-lib.js.org/docs/api/

  import Vue from 'vue'
  import Component from 'vue-class-component'

  import FilesTable from '@/components/FilesTable.vue'
  
  import { serverBus } from "../main"

  import { PDFDocument, PDFPage } from 'pdf-lib'

  @Component({
    components: { FilesTable }
  })
  export default class Home extends Vue {

    drawer: any = null
    files: Blob[] = []
    loading: boolean = false

    vuetify(): any {
      const self = this as any
      return self.$vuetify
    }

    mergeDisabled() {
      return this.files.length < 2
    }

    created() {
      this.vuetify().theme.dark = true

      const self = this

      serverBus.$on("addFile", function(file: Blob) {
        self.files.push(file)
      })

      serverBus.$on("removeFile", function(index: number) {
        self.files.splice(index, 1)
      })
    }

    readUploadedFileAsArrayBuffer(inputFile: Blob) {
      const temporaryFileReader = new FileReader()

      return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
          temporaryFileReader.abort()
          reject(new DOMException("Problem parsing input file"))
        }

        temporaryFileReader.onload = () => {
          resolve(temporaryFileReader.result as ArrayBuffer)
        }

        temporaryFileReader.readAsArrayBuffer(inputFile)
      })
    }

    forceFileDownload(data: Uint8Array) {
      const blob = new Blob([data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'merged.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
    }

    async merge() {
      
      this.loading = true

      const mergedDoc: PDFDocument = await PDFDocument.create()

      for (let file of this.files) {
        const docBytes = await this.readUploadedFileAsArrayBuffer(file) as ArrayBuffer
        const donorPdfDoc: PDFDocument = await PDFDocument.load(docBytes)

        // console.log(`Copying document (${donorPdfDoc.getPageCount()} pages)`)

        for (let index = 0; index < donorPdfDoc.getPageCount(); index++) {
          const [copiedPage] = await mergedDoc.copyPages(donorPdfDoc, [index])
          mergedDoc.addPage(copiedPage)
        }
      }

      const data: Uint8Array = await mergedDoc.save()

      this.forceFileDownload(data)

      this.loading = false
    }

  }
</script>

<style>
  [v-cloak] > * { display:none }
  [v-cloak]::before { content: "Loading…" }
</style>