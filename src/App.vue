<template>
  <nav>
    <div class="nav-left">
      <a href="/">Planning Poker</a>
    </div>
    <div class="nav-right">
      <button class="btn-primary" @click="createSession(true)">
        Create A New Session
      </button>
      <span class="dark-mode-toggle">
        <input
          class="toggle"
          type="checkbox"
          id="dark-mode-toggle"
          @change="toggleDarkMode"
          :checked="isDarkMode"
        />
        <label for="dark-mode-toggle" class="toggle-label"></label>
        <span class="dark-mode-text">Dark Mode</span>
      </span>
    </div>
  </nav>
  <div class="container">
    <!-- Settings Panel -->
    <div v-if="isSettingsPanelVisible" class="settings-panel">
      <span class="close-btn" @click="toggleSettingsPanel">x</span>
      <h3>Settings</h3>
      <span class="button-group-label">Sizing Technique</span>
      <div class="button-group">
        <button
          type="button"
          v-bind:class="sizingTechnique === 'fibonacci' ? 'btn active' : 'btn'"
          @click="changeSizingTechnique('fibonacci')"
        >
          Fibonacci
        </button>
        <button
          type="button"
          v-bind:class="sizingTechnique === 't-shirt' ? 'btn active' : 'btn'"
          @click="changeSizingTechnique('t-shirt')"
        >
          T-Shirt
        </button>
      </div>
    </div>
    <!-- Modals -->
    <RenameModal
      :visible="showRenameModal"
      :onConfirm="changeUsername"
      :onCancel="cancelUsernameChange"
    />
    <SessionExpiredModal
      :visible="showSessionExpiredModal"
      :onConfirm="toggleSessionExpiredModal"
      :modalMessage="sessionExpiredModalData"
    />
    <div class="story">
      <!-- TODO: Adjust here -->
      <h3 v-if="sessionId && username">
        <a
          class="redirect-link"
          v-if="linkText(adminSubmittedText)"
          :href="linkText(adminSubmittedText)"
          target="_blank"
          >{{ adminSubmittedText }}</a
        >
        <span v-else>
          {{ adminSubmittedText }}
        </span>
      </h3>
      <div v-if="isAdmin && sessionId && username" class="add-story">
        <input type="text" v-model="adminInput" placeholder="Enter text" />
        <button @click="submitAdminInput" class="btn-primary">
          Add A Story
        </button>
      </div>
    </div>
    <div class="welcome-bar" v-if="username && sessionId">
      <h2>Welcome, {{ username }} <span v-if="isAdmin">(Moderator)</span></h2>
      <div @click="activateRenameModal">
        <svg
          class="rename-user"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92-2.92l1.88 1.88L14.06 9.94l-1.88-1.88-6.26 6.26zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
            fill="currentColor"
          />
        </svg>
      </div>
      <!-- Settings Icon -->
      <div v-if="isAdmin" class="settings-icon" @click="toggleSettingsPanel">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-gear"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"
          />
          <path
            d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"
          />
        </svg>
      </div>
      <div class="admin-actions" v-if="isAdmin">
        <button
          @click="revealVotes"
          v-bind:class="reveal ? '' : active ? 'btn-primary' : 'hidden'"
        >
          Reveal Votes
        </button>
        <button
          @click="startTheVoting"
          v-bind:class="active ? 'hidden' : 'btn-primary'"
        >
          Start Voting
        </button>
        <button
          @click="restartVoting"
          v-bind:class="!active ? 'hidden' : reveal ? 'btn-primary' : ''"
        >
          Restart
        </button>
      </div>
    </div>
    <div class="voting-progress" v-if="sessionId && username">
      <div
        v-bind:class="
          !reveal && active ? 'vote-status active' : 'vote-status closed'
        "
      >
        <span v-if="reveal && active">Voting is closed</span>
        <span v-else-if="!reveal && active">
          <div>Voting is in progress...</div>
          <div v-if="isAdmin" class="users-voted">
            ({{ votes.length }} / {{ users.length }} users have voted.)
          </div>
        </span>
        <span v-else class="waiting-to-start">
          <div v-if="!isAdmin">
            Waiting for the moderator to start the session.
          </div>
          <div v-if="isAdmin">
            Players are waiting for you to start the session.
          </div>
          <!-- <div class="users-voted">
            ({{ users.length }} user{{ users.length > 1 ? "s" : "" }} in the
            session.)
          </div> -->
        </span>
        <CountUpTimer
          v-if="(reveal && active) || (!reveal && active)"
          :startTimer="active && !reveal"
          :restartTimer="restartTimer"
          :resetTimerCallback="restartTheTimer"
        />
      </div>
    </div>
    <div class="planning-poker">
      <div v-if="!sessionId">
        <div class="create-join-container">
          <div class="create-session">
            <h2>Create a New Session</h2>
            <button @click="createSession(false)" class="btn-primary">
              Create
            </button>
          </div>
          <div class="separator">
            <span>OR</span>
          </div>
          <div class="join-session">
            <h2>Join an Existing Session</h2>
            <input
              class="session-id"
              type="text"
              v-model="sessionInput"
              placeholder="Enter session ID"
            />
            <button @click="joinSession" class="btn-primary">Join</button>
          </div>
        </div>
      </div>
      <div v-if="sessionId && !username">
        <h3>Enter your name to join your session</h3>
        <input
          type="text"
          v-model="usernameInput"
          placeholder="Enter your name"
        />
        <button @click="join" class="btn-primary">Join</button>
      </div>
      <div class="main-content" v-if="sessionId && username">
        <div class="voting">
          <div>
            <button
              v-bind:class="reveal || !active ? 'disabled-card card' : 'card'"
              v-for="option in options"
              :key="option"
              @click="vote(option)"
            >
              <span v-html="renderFraction(option)"></span>
            </button>
          </div>
          <div v-if="reveal">
            <h3>
              Vote Results:
              <span
                v-bind:class="
                  Object.keys(voteCounts).length === 1
                    ? 'results-common'
                    : 'results-mixed'
                "
                >{{
                  Object.keys(voteCounts).length === 1
                    ? "Unanimous &#x1F64C;"
                    : "Mixed"
                }}</span
              >
            </h3>
            <div class="reveal-vote-info" id="reveal-vote-info">
              <div class="vote-breakdown">
                <div
                  v-for="(count, option) in voteCounts"
                  :key="option"
                  class="vote-item"
                >
                  <div class="point-count">{{ option }} Points</div>
                  <div class="vote-count">
                    {{ count }} Player{{ count > 1 ? "s" : "" }}
                  </div>
                </div>
              </div>
              <div class="chart-breakdown">
                <VotePieChart :data="voteCounts" />
              </div>
            </div>
          </div>
        </div>
        <div class="players">
          <h3 class="player-header">Players</h3>
          <ul>
            <transition-group name="fade" tag="ul">
              <li v-for="user in users" :key="user">
                <div>
                  <button
                    class="kick-btn"
                    v-if="user !== username && isAdmin"
                    @click="kickUser(user)"
                  >
                    Remove
                  </button>
                  {{ user }}
                  <span v-if="hasVoted(user)" class="vote">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      width="16"
                      height="16"
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="7"
                        stroke="#0E0F19"
                        stroke-width="1"
                        fill="none"
                      />
                      <path
                        d="M5 8l2 2l4-4"
                        stroke="#0E0F19"
                        stroke-width="1"
                        fill="none"
                      />
                    </svg>
                  </span>
                </div>
                <div class="votes-and-admin-actions">
                  <span v-if="reveal" class="individual-vote">{{
                    getUserVote(user)
                  }}</span>
                </div>
              </li>
            </transition-group>
            <li @click="expandInvite" class="invite-players">
              <div
                v-if="inviteExpanded"
                class="invite-players-container expanded"
              >
                <span>
                  <input type="text" :value="currentSessionUrl" readonly />
                  <button class="btn-primary" @click.stop="copySessionUrl">
                    Copy URL
                  </button>
                </span>
              </div>
              <div v-else class="invite-players-container">
                <span>Invite players to the session.</span>
              </div>
              <svg
                v-bind:class="inviteExpanded ? 'chevron open' : 'chevron'"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 9L18 15H6L12 9Z" fill="currentColor" />
              </svg>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <button
      id="scrollToTopBtn"
      v-bind:class="reveal ? 'scroll-to-top' : 'hidden'"
      @click="scrollToTop"
    >
      <span>Scroll To Top</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
      >
        <path d="M12 4l-8 8h6v8h4v-8h6l-8-8z" fill="currentColor" />
      </svg>
    </button>
  </div>
</template>

<script>
import { ref, inject, onMounted, onBeforeUnmount, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import VotePieChart from "./components/VotePieChart.vue";
import RenameModal from "./components/RenameModal.vue";
import SessionExpiredModal from "./components/SessionExpiredModal.vue";
import CountUpTimer from "./components/CountUpTimer.vue";

export default {
  components: {
    VotePieChart,
    RenameModal,
    SessionExpiredModal,
    CountUpTimer,
  },
  setup() {
    const toast = useToast();
    const searchParams = new URLSearchParams(window.location.search);
    const session_id = searchParams ? searchParams.get("sessionId") : null;
    const tShirtSizing = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    //const fibonacciSizing = ["0", "1/2", "1", "2", "3", "5", "8", "13", "20"];
    const fibonacciSizing = ["1/2", "1", "2", "3", "5", "8"];

    const socket = inject("socket");
    const route = useRoute();
    const router = useRouter();
    const sessionId = ref(session_id || null);
    const username = ref("");
    const usernameInput = ref("");
    const sessionInput = ref("");
    const users = ref([]);
    const votes = ref([]);
    const isAdmin = ref(false);
    const reveal = ref(false);
    const active = ref(false);
    const adminInput = ref("");
    const adminSubmittedText = ref("");
    const inviteExpanded = ref(false);
    const showRenameModal = ref(false);
    const showSessionExpiredModal = ref(false);
    const sessionExpiredModalData = ref({});
    const isDarkMode = ref(false);
    const lastHealthCheck = ref(true);
    const isSettingsPanelVisible = ref(false);
    const sizingTechnique = ref("fibonacci");
    const options = ref([]);
    const restartTimer = ref(false);

    const restartTheTimer = () => {
      restartTimer.value = false;
    };

    const isFraction = (value) => {
      return /\d+\/\d+/.test(value);
    };

    const renderFraction = (value) => {
      if (!isFraction(value)) return `<span>${value}</span>`;
      const [numerator, denominator] = value.split("/");
      return `<span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${denominator}</span></span>`;
    };

    const toggleSessionExpiredModal = (show) => {
      showSessionExpiredModal.value = show;
    };

    const toggleDarkMode = (event) => {
      isDarkMode.value = event.target.checked;
      if (isDarkMode.value) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }

      localStorage.setItem("darkMode", isDarkMode.value);
    };

    const toggleSettingsPanel = () => {
      isSettingsPanelVisible.value = !isSettingsPanelVisible.value;
    };

    const activateRenameModal = () => {
      showRenameModal.value = true;
    };

    const changeUsername = (newUsername) => {
      let oldUsername = username.value;
      showRenameModal.value = false;
      username.value = newUsername;
      localStorage.setItem("username", newUsername);
      // toast.success("Your username has been changed.");
      socket.emit("add-history-event", {
        sessionId: sessionId.value,
        historyEvent: {
          eventType: "user-action",
          eventMessage: `${oldUsername} changed their name to ${newUsername}`,
        },
      });
      socket.emit("username-changed", {
        sessionId: sessionId.value,
        username: newUsername,
        oldUsername,
      });
    };

    const cancelUsernameChange = () => {
      showRenameModal.value = false;
    };

    const voteCounts = computed(() => {
      return votes.value.reduce((acc, vote) => {
        acc[vote.vote] = (acc[vote.vote] || 0) + 1;
        return acc;
      }, {});
    });

    const hasVoted = (user) => {
      let hasVoted = false;
      votes.value.filter((vote) => {
        if (vote.username === user) {
          hasVoted = true;
        }
      });

      return hasVoted;
    };

    const getUserVote = (user) => {
      let voteValue = "-";
      votes.value.filter((vote) => {
        if (vote.username === user) {
          voteValue = vote.vote;
        }
      });

      return voteValue;
    };

    const createSession = (alertUsers) => {
      lastHealthCheck.value = true;
      socket.emit("create-session", { adminUsername: username.value });
      votes.value = [];
      adminSubmittedText.value = "";
      if (alertUsers) {
        alert("A new session has been created. Please invite players to join.");
      }
    };

    const joinSession = () => {
      if (sessionInput.value.trim() !== "") {
        router.push({
          path: "/",
          query: { sessionId: sessionInput.value.trim() },
        });
        sessionId.value = sessionInput.value.trim();
      }
    };

    const join = () => {
      if (usernameInput.value.trim() !== "") {
        username.value = usernameInput.value.trim();
        localStorage.setItem("username", username.value);
        socket.emit("join-session", {
          sessionId: sessionId.value,
          username: username.value,
        });
      } else {
        toast.warning("Please enter a valid name.");
      }
    };

    const vote = (option) => {
      if (reveal.value || !active.value) {
        toast.warning("Voting is currently closed.");
        return;
      }
      socket.emit("vote", option);
    };

    const revealVotes = () => {
      socket.emit("reveal-votes", sessionId.value);
      active.value = true;
    };

    const startTheVoting = () => {
      socket.emit("start-the-voting", sessionId.value);
    };

    const restartVoting = () => {
      socket.emit("restart-voting", sessionId.value);
      active.value = false;
      // restartTimer.value = true;
    };

    const kickUser = (user) => {
      socket.emit("kick-user", { sessionId: sessionId.value, username: user });
      // toast.success("User " + user + " has been kicked from this session.");
      socket.emit("add-history-event", {
        sessionId: sessionId.value,
        historyEvent: {
          eventType: "user-action",
          eventMessage: `${user} has been kicked from the session.`,
        },
      });
    };

    const changeSizingTechnique = (technique) => {
      socket.emit("change-sizing-technique", {
        sessionId: sessionId.value,
        technique,
      });
      sizingTechnique.value = technique;
    };

    const submitAdminInput = () => {
      if (!adminInput.value) {
        return;
      }
      socket.emit("admin-input", {
        sessionId: sessionId.value,
        text: adminInput.value,
      });
      restartVoting();
      adminInput.value = "";
    };

    const copySessionUrl = () => {
      navigator.clipboard.writeText(currentSessionUrl.value);
      toast.success("Link has been copied.", { timeout: 1000 });
    };

    const linkText = (link) => {
      try {
        new URL(link);
        return link;
      } catch (_) {
        return null;
      }
    };

    const currentSessionUrl = computed(() => {
      return `${window.location.origin}?sessionId=${sessionId.value}`;
    });

    const expandInvite = () => {
      inviteExpanded.value = !inviteExpanded.value;
    };

    function waitForElm(selector) {
      return new Promise((resolve) => {
        if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
          if (document.querySelector(selector)) {
            observer.disconnect();
            resolve(document.querySelector(selector));
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      });
    }

    const handleErrors = (err, from) => {
      if (from === "disconnected" && sessionId?.value?.length) {
        showSessionExpiredModal.value = true;
      }
      sessionId.value = "";
      router.push({ path: "/" });
    };

    const scrollToTop = () => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    };

    onMounted(() => {
      // adjust sizing
      options.value =
        sizingTechnique.value === "fibonacci" ? fibonacciSizing : tShirtSizing;

      // Darkmode Logic
      isDarkMode.value = JSON.parse(localStorage.getItem("darkMode")) === true;
      if (isDarkMode.value) {
        document.body.classList.add("dark-mode");
      }

      // Check session is still active
      // setInterval(() => {
      //   if (
      //     sessionId.value &&
      //     sessionId.value.length &&
      //     lastHealthCheck.value
      //   ) {
      //     try {
      //       socket.emit("health-check", { sessionId: sessionId.value });
      //     } catch (err) {
      //       console.log("Failed to complete health check.");
      //     }
      //   }
      // }, 15000);

      socket.on("connect_error", (err) => handleErrors(err, "connect_error"));
      socket.on("connect_failed", (err) => handleErrors(err, "connect_failed"));
      socket.on("disconnect", (err) => handleErrors(err, "disconnected"));

      socket.on("health-callback", ({ sessionHealthy }) => {
        lastHealthCheck.value = sessionHealthy;
        if (sessionHealthy) {
        } else {
          showSessionExpiredModal.value = true;
          sessionExpiredModalData.value = {
            title: "Session Not Found",
            message:
              "This session you are attempting to connect to does not exist.",
          };
          router.push({ path: "/" });
          router.go();
          // sessionId.value = null;
        }
      });

      // App Logic
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        username.value = storedUsername;
      }

      if (sessionId.value && username.value) {
        socket.emit("join-session", {
          sessionId: sessionId.value,
          username: username.value,
        });
      }

      socket.on("error", (msg) => {
        sessionId.value = "";
        router.push({ path: "/" });
        showSessionExpiredModal.value = true;
        sessionExpiredModalData.value = msg;
        console.log(sessionExpiredModalData.value);
      });

      socket.on("session-created", (id) => {
        console.log("New session created, joining it");
        router.push({ path: "/", query: { sessionId: id } });
        sessionId.value = id;
        isAdmin.value = true;
      });

      socket.on(
        "user-joined",
        ({
          username: usernameSession,
          oldUsername,
          users: userList,
          adminUsername,
          ticketText,
          revealVotes,
          sessionVotes,
          votingActive,
          planSizingTechnique,
        }) => {
          sizingTechnique.value = planSizingTechnique;
          users.value = userList;
          if (username.value === adminUsername) {
            isAdmin.value = true;
          }
          if (ticketText) {
            adminSubmittedText.value = ticketText;
          }

          reveal.value = revealVotes;
          active.value = votingActive;

          if (oldUsername) {
            const existingVoteIndex = votes.value.findIndex(
              (vote) => vote.username === oldUsername
            );
            delete votes.value.splice(existingVoteIndex, 1);
          }

          if (sessionVotes) {
            for (const [key, value] of Object.entries(sessionVotes)) {
              const existingVoteIndex = votes.value.findIndex(
                (vote) => vote.username === key
              );
              if (existingVoteIndex === -1) {
                votes.value.push({
                  username: key,
                  vote: value,
                });
              }
            }
          }

          socket.emit("add-history-event", {
            sessionId: sessionId.value,
            historyEvent: {
              eventType: "user-action",
              eventMessage: `${username.value} joined.`,
            },
          });
        }
      );

      socket.on("user-left", ({ username, users: userList }) => {
        if (username) {
          users.value = userList;
          // toast.warning(`${username} left`);
          socket.emit("add-history-event", {
            sessionId: sessionId.value,
            historyEvent: {
              eventType: "user-action",
              eventMessage: `${username} left.`,
            },
          });
        }
      });

      socket.on("vote", (vote) => {
        const existingVoteIndex = votes.value.findIndex(
          (v) => v.username === vote.username
        );
        if (existingVoteIndex !== -1) {
          votes.value[existingVoteIndex].vote = vote.vote;
        } else {
          votes.value.push(vote);
        }
      });

      socket.on("voting-reset", () => {
        reveal.value = false;
        active.value = false;
        restartTimer.value = true;
        votes.value = [];
      });

      socket.on("votes-revealed", () => {
        reveal.value = true;
        // let results = document.getElementById('reveal-vote-info');
        waitForElm("#reveal-vote-info").then((elm) => {
          elm.scrollIntoView({ behavior: "smooth" });
        });
      });

      socket.on("voting-active", () => {
        active.value = true;
      });

      socket.on(
        "user-kicked",
        ({ username: usernameSession, users: userList }) => {
          users.value = userList;
          votes.value = votes.value.filter(
            (vote) => vote.username !== usernameSession
          );
          if (usernameSession === username.value) {
            sessionId.value = "";
            router.push({ path: "/" });
            toast.error("You have been kicked from the session.");
          }
        }
      );

      socket.on("admin-input", ({ text }) => {
        adminSubmittedText.value = text;
      });

      socket.on("sizing-technique-changed", ({ technique }) => {
        sizingTechnique.value = technique;
        votes.value = [];
      });
    });

    watch(sizingTechnique, (newTechnique) => {
      options.value =
        newTechnique === "fibonacci" ? fibonacciSizing : tShirtSizing;
    });

    watch(route, (newRoute) => {
      const newSessionId = newRoute.query.sessionId;
      if (newSessionId) {
        sessionId.value = newSessionId;
        if (username.value) {
          socket.emit("join-session", {
            sessionId: newSessionId,
            username: username.value,
          });
        }
      }
    });

    onBeforeUnmount(() => {
      socket.off("health-callback");
      socket.off("error");
      socket.off("session-created");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("vote");
      socket.off("voting-reset");
      socket.off("votes-revealed");
      socket.off("voting-active");
      socket.off("user-kicked");
      socket.off("admin-input");
      socket.off("sizing-technique-changed");
    });

    return {
      active,
      sessionId,
      username,
      usernameInput,
      sessionInput,
      users,
      votes,
      options,
      vote,
      reveal,
      createSession,
      joinSession,
      join,
      revealVotes,
      restartVoting,
      isAdmin,
      kickUser,
      voteCounts,
      adminInput,
      adminSubmittedText,
      submitAdminInput,
      hasVoted,
      getUserVote,
      currentSessionUrl,
      copySessionUrl,
      linkText,
      expandInvite,
      inviteExpanded,
      startTheVoting,
      VotePieChart,
      waitForElm,
      RenameModal,
      showRenameModal,
      activateRenameModal,
      changeUsername,
      cancelUsernameChange,
      isDarkMode,
      toggleDarkMode,
      isFraction,
      renderFraction,
      lastHealthCheck,
      handleErrors,
      showSessionExpiredModal,
      sessionExpiredModalData,
      toggleSessionExpiredModal,
      SessionExpiredModal,
      scrollToTop,
      isSettingsPanelVisible,
      toggleSettingsPanel,
      sizingTechnique,
      changeSizingTechnique,
      CountUpTimer,
      restartTimer,
      restartTheTimer,
    };
  },
};
</script>

<style>
body {
  font-family: "Arial", sans-serif;
  background: linear-gradient(135deg, #f5f5f5 0%, #ede6ff 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  margin: 0;
  min-height: 100vh;
}

nav {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background-color: #8bbf9f;
  color: #f5f5f5;
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-left a {
  color: #f5f5f5;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;
}

.nav-right {
  display: flex;
  margin-right: 32px;
}

.dark-mode-toggle {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-left: 8px;
}

.nav-right button {
  background-color: #3b5249;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.container {
  width: 90vw;
  max-width: 1200px;
  background-color: #fff;
  padding: 40px 20px 40px 20px;
  margin-top: 96px;
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.settings-icon {
  /* position: absolute;
  top: 16px;
  right: 16px; */
  cursor: pointer;
}

.settings-icon svg {
  width: 24px;
  height: 24px;
}

.settings-icon svg path {
  stroke: #000;
  stroke-width: 1px;
}

.settings-panel {
  position: absolute;
  top: 44px;
  right: 16px;
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-radius: 4px;
}

.settings-panel .close-btn {
  position: absolute;
  right: 12px;
}

.settings-panel .close-btn:hover {
  cursor: pointer;
  color: #adadad;
  transition: color 0.3s;
}

.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 16px;
  z-index: 1000;
}

.scroll-to-top span {
  font-size: 14px;
}

.scroll-to-top:hover {
  background-color: #646464;
}

.scroll-to-top svg {
  margin-left: 8px;
}

.scroll-to-top:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5);
}

.voting-progress {
  margin-bottom: 16px;
  margin-left: auto;
  margin-right: auto;
}

.waiting {
  background-color: #ff3d00;
}

.story {
  text-align: center;
}

h1,
h2,
h3 {
  color: #333333;
}

.add-story {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

input[type="text"] {
  padding: 12px;
  border: 2px solid #8bbf9f;
  border-radius: 8px;
  width: -webkit-fill-available;
  max-width: 400px;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus {
  outline: none;
  border-color: #3b5249;
}

input[type="text"]::placeholder {
  color: #757575;
}

button {
  padding: 12px 20px;
  margin: 5px;
  background-color: #857e7b;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #646464;
}

.btn-primary {
  background-color: #8bbf9f;
}

.btn-primary:hover {
  background-color: #6ba98f;
}

.welcome-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.rename-user:hover {
  cursor: pointer;
  color: #3b5249;
}

.admin-actions {
  display: flex;
  gap: 10px;
}

.planning-poker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
}

.create-join-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.create-session,
.join-session {
  width: 90%;
  max-width: 400px;
  padding: 20px;
  border: 2px solid #8bbf9f;
  border-radius: 12px;
  text-align: center;
  background: linear-gradient(135deg, #ede6ff 0%, #f5f5f5 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.session-id {
  width: auto !important;
}

.separator {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  width: 100%;
  color: #8bbf9f;
}

.separator::before,
.separator::after {
  content: "";
  flex: 1;
  border-bottom: 2px solid #8bbf9f;
}

.separator::before {
  margin-right: 0.25em;
}

.separator::after {
  margin-left: 0.25em;
}

.separator span {
  padding: 0 10px;
  font-weight: 700;
}

.voting {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  flex: 2;
}

.reveal-vote-info {
  display: flex;
  gap: 32px;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
}

.chart-breakdown {
  width: 200px;
}

.results-common {
  color: #8bbf9f;
}

.results-mixed {
  color: #ec9a29;
}

.vote-breakdown {
  display: block;
}

.vote-item {
  background-color: #f5f5f5;
  border: 2px solid #333333;
  border-radius: 12px;
  padding: 10px;
  width: 120px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin-top: 8px;
}

.vote-count {
  font-size: 16px;
  color: #8bbf9f;
}

.point-count {
  font-size: 20px;
}

.card {
  display: inline-block;
  padding: 20px;
  border: 2px solid #333333;
  border-radius: 12px;
  width: 120px;
  height: 180px;
  background-color: #f5f5f5;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  background-color: #8bbf9fb6;
}

.card:active {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card.disabled-card {
  cursor: not-allowed;
}

.card.disabled-card:hover {
  background-color: none;
  transform: none;
}

.fraction {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  font-size: 0.8em; /* Adjust the font size for fractions */
}

.fraction .numerator,
.fraction .denominator {
  display: block;
  padding: 0 0.2em;
}

.fraction .numerator {
  padding-bottom: 0.3em;
  border-bottom: 3px solid #000;
}

.fraction .denominator {
  margin-top: 0.35em; /* Adjust this value for better alignment */
}

.vote-status {
  padding: 16px;
  text-align: center;
  font-weight: bold;
  color: #fff;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.vote-status.active {
  background-color: #8bbf9f;
}

.vote-status.closed {
  background-color: #757575;
}

.player-header {
  font-weight: 700;
  margin: 0;
  padding: 12px;
  background-color: #8bbf9f;
  color: #fff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  text-align: center;
}

.individual-vote {
  font-weight: 700;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.players {
  max-width: 298px;
  min-width: 298px;
}

.players li {
  padding: 12px;
  background-color: #f3f3f3;
  border: 2px solid #fff;
  border-left: none;
  border-right: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0; /* Initial state for entering/leaving */
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in; /* Duration and easing for the transition */
}

.players li:first-child {
  border-top: none;
}

.players li:not(:last-child) {
  border-bottom: none;
}

.kick-btn {
  color: #ff5722;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0px;
}

.kick-btn:hover {
  color: #ff3d00;
  background-color: transparent;
}

.invite-players {
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  background-color: #f2f2f2 !important;
  padding: 12px !important;
  cursor: pointer !important;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
}

.invite-players-container {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  margin: auto;
}

.invite-players-container.expanded {
  margin: inherit;
}

.chevron {
  transition: transform 0.3s ease;
  transform: rotate(180deg);
}

.chevron.open {
  transform: rotate(0deg);
}

.hidden {
  display: none;
}

/* Button Group */
.button-group {
  display: inline-flex;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.button-group-label {
  font-size: 14px;
  margin-right: 8px;
}

.button-group .btn {
  padding: 10px 20px;
  border: none;
  border-radius: 0;
  background-color: #8bbf9f;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  margin: 0;
}

.button-group .btn:not(:last-child) {
  border-right: 1px solid #ccc;
}

.button-group .btn:hover {
  background-color: #6ba98f;
}

.button-group .btn.active {
  background-color: #3b5249;
}

.button-group .btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Checkmark toggle */
/* Hide the default checkbox */
.dark-mode-text {
  font-size: 12px;
  margin-top: 4px;
}

input.toggle {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #ccc;
  border-radius: 24px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-right: 4px;
}

.toggle-label:before {
  content: "";
  position: absolute;
  left: 4px;
  top: 4px;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

input.toggle:checked + .toggle-label {
  background-color: #8bbf9f;
}

input.toggle:checked + .toggle-label:before {
  transform: translateX(26px);
}

.redirect-link {
  color: #3b5249; /* Same color as unvisited links */
  text-decoration: underline; /* Keeps the same text decoration */
}

.redirect-link:visited {
  color: #3b5249; /* Same color as unvisited links */
  text-decoration: underline; /* Keeps the same text decoration */
}

/* Add a shadow for better visual effect */
.toggle-label:before {
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}

/* Begin dark mode styling */
body.dark-mode {
  background: linear-gradient(135deg, #333333 0%, #111111 100%);
  color: #f5f5f5;
}

body.dark-mode nav {
  background-color: #444444;
  color: #f5f5f5;
}

body.dark-mode h1 {
  color: #fff;
}

body.dark-mode h2 {
  color: #fff;
}

body.dark-mode h3 {
  color: #fff;
}

body.dark-mode .create-session {
  border: 2px solid #555555;
  background: linear-gradient(135deg, #333333 0%, #444444 100%);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

body.dark-mode .join-session {
  border: 2px solid #555555;
  background: linear-gradient(135deg, #333333 0%, #444444 100%);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

body.dark-mode .modal-content {
  background-color: #444444;
}

body.dark-mode .container {
  background-color: #222222;
  color: #f5f5f5;
}

body.dark-mode input[type="text"] {
  background-color: #444444;
  color: #f5f5f5;
  border-color: #555555;
}

body.dark-mode .card {
  background-color: #444444;
  border-color: #555555;
  color: #f5f5f5;
}

body.dark-mode .card:hover {
  background-color: #6d6d6d;
}

body.dark-mode .players li {
  padding: 12px;
  background-color: #444444;
  border: 2px solid #6d6d6d;
  border-left: none;
  border-right: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

body.dark-mode .invite-players {
  background-color: #444444 !important;
}

body.dark-mode .vote svg circle {
  stroke: #fff !important;
}

body.dark-mode .vote svg path {
  stroke: #fff !important;
}

body.dark-mode .fraction .numerator {
  border-bottom: 3px solid #fff;
}

body.dark-mode .settings-icon svg path {
  stroke: #fff;
}

body.dark-mode .settings-panel {
  background-color: #6d6d6d;
  border-color: #444444;
  box-shadow: 0 4px 12px rgba(252, 252, 252, 0.1);
}

body.dark-mode .redirect-link {
  color: #8bbf9f;
  text-decoration: underline;
}

body.dark-mode .redirect-link:visited {
  color: #8bbf9f;
  text-decoration: underline;
}

@media screen and (max-width: 480px) {
  .container {
    width: 100%;
    padding: 10px;
  }

  .create-session,
  .join-session {
    width: 100%;
  }

  .admin-actions {
    flex-direction: column;
    gap: 5px;
  }

  .main-content {
    flex-direction: column;
  }
}
</style>
