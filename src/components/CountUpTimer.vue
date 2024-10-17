<template>
  <div class="timed-counter">Time Elapsed: {{ formattedTime }}</div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

export default {
  props: {
    startTimer: {
      type: Boolean,
      required: true,
    },
    restartTimer: {
      type: Boolean,
      required: true,
    },
    resetTimerCallback: {
      type: Function,
      required: true,
    },
  },

  setup(props) {
    const secondsElapsed = ref(0); // Tracks total elapsed time in seconds
    let intervalId = null;

    const startTimer = () => {
      intervalId = setInterval(() => {
        secondsElapsed.value++;
      }, 1000);
    };

    const stopTimer = () => {
      clearInterval(intervalId);
      intervalId = null;
    };

    const restartTimer = () => {
      stopTimer();
      secondsElapsed.value = 0;
    };

    // Watch the prop to start/stop the timer based on the prop value
    watch(
      () => props.startTimer,
      (newVal) => {
        if (newVal) {
          startTimer();
        } else {
          stopTimer();
        }
      }
    );

    watch(
      () => props.restartTimer,
      (newVal) => {
        if (newVal) {
          restartTimer();
          props.resetTimerCallback();
        }
      }
    );

    // Computed property to format hours, minutes, and seconds
    const formattedTime = computed(() => {
      const hours = Math.floor(secondsElapsed.value / 3600);
      const minutes = Math.floor((secondsElapsed.value % 3600) / 60);
      const seconds = secondsElapsed.value % 60;

      const formatUnit = (unit) => String(unit).padStart(2, "0");
      return `${formatUnit(hours)}:${formatUnit(minutes)}:${formatUnit(
        seconds
      )}`;
    });

    onMounted(() => {
      if (props.startTimer) {
        startTimer();
      }
    });

    onUnmounted(() => {
      stopTimer();
    });

    return {
      formattedTime,
    };
  },
};
</script>

<style scoped>
.timed-counter {
  justify-content: center;
  display: flex;
  font-weight: 600;
  font-size: 16px;
  margin-top: 4px;
}
</style>
