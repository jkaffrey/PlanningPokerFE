<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <slot name="header">
        <h2>{{ modalMessage.title || "Session Expired" }}</h2>
      </slot>
      <slot name="body">
        <div>
          {{
            modalMessage.message ||
            "The session you were connected to has expired. If you were the host, please create a new one"
          }}
        </div>
      </slot>
      <div class="modal-buttons">
        <button class="btn-primary" @click="confirm">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    onConfirm: {
      type: Function,
      required: true,
    },
    modalMessage: {
      type: Object,
      required: true,
    },
  },
  methods: {
    confirm() {
      this.onConfirm(false);
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
