<template>
  <v-app id="inspire">

    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
    >
      <v-list>
        <v-list-item link :href="twitter">
          <v-list-item-action>
            <v-icon>mdi-twitter</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Twitter</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link :href="paypal">
          <v-list-item-action>
            <v-icon>mdi-gift-outline</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Donate</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-left
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>doctools.io</v-toolbar-title>
    </v-app-bar>

    <v-content>

      <v-layout
        style="height: 100%"
        v-if="files.length === 0"
      >
        <v-card
          id="emptyMessage"
          class="mx-auto my-auto unselectable"
          outlined
        >

          <v-icon
            dark
            x-large
            style="opacity: .5; margin-top: .9em"
            >
            mdi-file-document-outline
          </v-icon>

          <p
            id="message"
            class="font-weight-medium"
            style="font-size: 1.6em; opacity: .5; margin-top: .3em"
          >
            Drop PDFs here
          </p>

        </v-card>
      </v-layout>
  
      <files-table
        :files="files" />

      <v-layout column class="fab-container">
        <v-btn
          class="center-horizontally"
          style="margin-bottom: 16px"
          color="green"
          fab
          small
        >
          <v-icon dark>mdi-plus</v-icon>
        </v-btn>
        <v-btn
          fab
          color="blue darken-2"
          :disabled="mergeDisabled()" 
          :loading="loading"
          @click="merge()"
        >
          <v-icon dark>mdi-download</v-icon>
        </v-btn>
      </v-layout>

      <div class="text-center ma-2">
        <v-snackbar
          v-model="snackbar"
          :timeout="7000"
        >
          Thank you for using doctools.io, feel free to send me comments or suggestions on Twitter
          <v-btn
            color="blue darken-2"
            text
            @click="snackbar = false"
          >
            Close
          </v-btn>
        </v-snackbar>
      </div>

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

    twitter: string = "https://twitter.com/augustoblomer"
    paypal: string = "http://paypal.me/augustoblomer"

    drawer: any = null
    files: Blob[] = []
    loading: boolean = false
    snackbar: boolean = false

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
      this.snackbar = true

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

  #emptyMessage {
    height: 10em;
    width: 18em;
    text-align: center;
    opacity: 0.6;
  }
  
  .fab-container {
    position: fixed;
    bottom: 0;
    right: 0;

    text-align: center;

    margin-bottom: 2em;
    
    padding-bottom: 2em;
    padding-right: 2em;
  }

  .center-horizontally {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .unselectable {
    -webkit-user-select: none; /* Safari */        
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
    user-select: none; /* Standard */
  }
</style>