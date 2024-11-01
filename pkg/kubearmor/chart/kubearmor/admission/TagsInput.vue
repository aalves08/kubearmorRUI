<template>
    <div>
      <h4>Tags</h4>
      <div class="tags-input">
        <div v-for="(tag, index) in tags" :key="index" class="tag-item">
          <input
            v-model="tags[index]"
            @input="updateTags"
            placeholder="Enter tag"
            class="tag-input"
          />
          <button @click="removeTag(index)" class="remove-btn">x</button>
        </div>
        <button @click="addTag" class="add-btn">Add Tag</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      value: {
        type: Array,
        default: () => []
      }
    },
  
    data() {
      return {
        tags: this.value
      };
    },
  
    watch: {
      tags: {
        deep: true,
        handler(newTags) {
          this.$emit('input', newTags);
        }
      }
    },
  
    methods: {
      addTag() {
        this.tags.push('');
      },
      removeTag(index) {
        this.tags.splice(index, 1);
      },
      updateTags() {
        this.$emit('input', this.tags);
      }
    }
  };
  </script>
  
  <style scoped>
  .tags-input {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .tag-item {
    display: flex;
    align-items: center;
  }
  
  .tag-input {
    flex: 1;
    padding: 6px;
    margin-right: 6px;
  }
  
  .remove-btn {
    background-color: red;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  .add-btn {
    margin-top: 10px;
    background-color: #5cb85c;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
  }
  </style>
  