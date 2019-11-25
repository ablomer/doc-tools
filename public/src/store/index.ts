import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    files: Array<File>()
  },

  mutations: {
    addFile(state, file: File) {
      state.files.push(file)
    },
    
    removeFile(state, index: number) {
      state.files.splice(index, 1)
    },
    
    setFiles(state, files: Array<File>) {
      state.files = files
    },
  },
  
  actions: {
    addFile(context, file: File) {
      context.commit('addFile', file)
    },
    
    removeFile(context, index: number) {
      context.commit('removeFile', index)
    },
    
    setFiles(context, files: Array<File>) {
      context.commit('setFiles', files)
    }
  }
})
