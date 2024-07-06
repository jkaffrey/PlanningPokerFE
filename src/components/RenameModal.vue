<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <slot name="header">
        <h2>Change Username</h2>
      </slot>
      <slot name="body">
        <input
          type="text"
          v-model="inputValue"
          class="modal-rename-field"
          placeholder="Enter a new username"
        />
        <div v-if="error" class="error">
          {{ error }}
        </div>
      </slot>
      <div class="modal-buttons">
        <button class="btn-primary" @click="confirm">Confirm</button>
        <button @click="cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const error = ref("");
    return { error };
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    onConfirm: {
      type: Function,
      required: true,
    },
    onCancel: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      inputValue: "",
    };
  },
  methods: {
    confirm() {
      if (this.inputValue.length && this.inputValue.length >= 3) {
        this.onConfirm(this.inputValue);
      } else {
        this.error = "A username must be at least 3 characters long.";
      }
    },
    cancel() {
      this.error = "";
      this.onCancel();
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-width: 90%;
}
button {
  margin: 5px;
}
.modal-buttons {
  margin-top: 8px;
  float: right;
}
.modal-rename-field {
  width: -webkit-fill-available;
}
.error {
  font-family: "Arial", sans-serif;
  font-size: 12px;
  margin-top: 8px;
  color: #ff5722;
}
</style>
