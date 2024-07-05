<template>
  <nav>
    <div class="nav-left">
      <a href="/">Planning Poker</a>
    </div>
    <div class="nav-right">
      <button class="btn-primary" @click="createSession">Create A New Session</button>
    </div>
  </nav>
  <div class="container">
    <div class="story">
      <h3 v-if="sessionId && username">{{ adminSubmittedText }}</h3>
      <div v-if="isAdmin && sessionId && username" class="add-story">
        <input type="text" v-model="adminInput" placeholder="Enter text" />
        <button @click="submitAdminInput" class="btn-primary">Add A Story</button>
      </div>
    </div>
    <div class="welcome-bar" v-if="username && sessionId">
      <h2>Welcome, {{ username }} <span v-if="isAdmin">(Moderator)</span></h2>
      <div class="admin-actions" v-if="isAdmin">
        <button @click="revealVotes" v-bind:class="reveal ? '' : active ? 'btn-primary' : 'hidden'">Reveal Votes</button>
        <button @click="startTheVoting" v-bind:class="active ? 'hidden' : 'btn-primary'">Start Voting</button>
        <button @click="restartVoting" v-bind:class="!active ? 'hidden' : reveal ? 'btn-primary' : ''">Restart</button>
      </div>
    </div>
    <div class="voting-progress" v-if="sessionId && username">
      <div v-bind:class="!reveal && active ? 'vote-status active' : 'vote-status closed'">
        <span v-if="reveal && active">Voting is closed</span>
        <span v-else-if="!reveal && active">
          <div>Voting is in progress...</div>
          <div class="users-voted">({{ votes.length }} / {{ users.length }} users have voted.)</div>
        </span>
        <span v-else class="waiting-to-start">
          <div>Waiting for the moderator to start the session.</div>
          <div class="users-voted">({{ users.length }} user{{ users.length > 1 ? 's' : '' }} in the session.)</div>
        </span>
      </div>
    </div>
    <div class="planning-poker">
      <div v-if="!sessionId">
        <div class="create-join-container">
          <div class="create-session">
            <h2>Create a New Session</h2>
            <button @click="createSession" class="btn-primary">Create</button>
          </div>
          <div class="separator">
            <span>Or</span>
          </div>
          <div class="join-session">
            <h2>Join an Existing Session</h2>
            <input class="session-id" type="text" v-model="sessionInput" placeholder="Enter session ID" />
            <button @click="joinSession" class="btn-primary">Join</button>
          </div>
        </div>
      </div>
      <div v-if="sessionId && !username">
        <h3>Enter your name to join your session</h3>
        <input type="text" v-model="usernameInput" placeholder="Enter your name" />
        <button @click="join" class="btn-primary">Join</button>
      </div>
      <div class="main-content" v-if="sessionId && username">
        <div class="voting">
          <div>
            <button v-bind:class="reveal || !active ? 'disabled-card card' : 'card'" v-for="option in options" :key="option" @click="vote(option)">
              {{ option }}
            </button>
          </div>
          <div v-if="reveal">
            <h3>Vote Results</h3>
            <div class="reveal-vote-info" id="reveal-vote-info">
              <div class="vote-breakdown">
                <div v-for="(count, option) in voteCounts" :key="option" class="vote-item">
                  <div>{{ option }} Points</div>
                  <div class="vote-count">{{ count }} Player{{ count > 1 ? 's' : '' }}</div>
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
            <li v-for="user in users" :key="user">
              <div>
                <button class="kick-btn" v-if="user !== username && isAdmin" @click="kickUser(user)">Remove</button>
                {{ user }}
                <span v-if="hasVoted(user)" class="vote">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
                    <circle cx="8" cy="8" r="7" stroke="#0E0F19" stroke-width="1" fill="none"/>
                    <path d="M5 8l2 2l4-4" stroke="#0E0F19" stroke-width="1" fill="none"/>
                  </svg>
                </span>
              </div>
              <div class="votes-and-admin-actions">
                <span v-if="reveal" class="individual-vote">{{ getUserVote(user) }}</span>
              </div>
            </li>
            <li @click="expandInvite" class="invite-players">
              <div v-if="inviteExpanded" class="invite-players-container expanded">
                <span>
                  <input type="text" :value="currentSessionUrl" readonly />
                  <button class="btn-primary" @click.stop="copySessionUrl">Copy URL</button>
                </span>
              </div>
              <div v-else class="invite-players-container">
                <span>Invite players to the session.</span>
              </div>
              <svg v-bind:class="inviteExpanded ? 'chevron open' : 'chevron'" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9L18 15H6L12 9Z" fill="currentColor"/>
              </svg>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, inject, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from "vue-toastification";
import VotePieChart from './components/VotePieChart.vue';

export default {
  components: {
    VotePieChart
  },
  setup() {
    const toast = useToast();
    const searchParams = new URLSearchParams(window.location.search);
    const session_id = searchParams ? searchParams.get('sessionId') : null;

    const socket = inject('socket');
    const route = useRoute();
    const router = useRouter();
    const sessionId = ref(session_id || null);
    const username = ref('');
    const usernameInput = ref('');
    const sessionInput = ref('');
    const users = ref([]);
    const votes = ref([]);
    const options = ['0', '1/2', '1', '2', '3', '5', '8', '13', '20'];
    const isAdmin = ref(false);
    const reveal = ref(false);
    const active = ref(false);
    const adminInput = ref('');
    const adminSubmittedText = ref('');
    const inviteExpanded = ref(false);

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
      })

      return hasVoted;
    }

    const getUserVote = (user) => {
      let voteValue = '-';
      votes.value.filter((vote) => {
        if (vote.username === user) {
          voteValue = vote.vote
        }
      })

      return voteValue;
    }

    const createSession = () => {
      socket.emit('create-session', { adminUsername: username.value });
      votes.value = [];
      adminSubmittedText.value = '';
      toast.success('A new session has been started, invite your players to begin planning.')
    };

    const joinSession = () => {
      if (sessionInput.value.trim() !== '') {
        router.push({ path: '/', query: { sessionId: sessionInput.value.trim() } });
        sessionId.value = sessionInput.value.trim();
      }
    };

    const join = () => {
      if (usernameInput.value.trim() !== '') {
        username.value = usernameInput.value.trim();
        localStorage.setItem('username', username.value);
        socket.emit('join-session', { sessionId: sessionId.value, username: username.value });
      }
    };

    const vote = (option) => {
      if (reveal.value || !active.value) {
        toast.warning('Voting is currently closed.')
        return;
      }
      socket.emit('vote', option);
      toast.success("Your vote has been submitted.")
    };

    const revealVotes = () => {
      socket.emit('reveal-votes', sessionId.value);
      active.value = true;
    };

    const startTheVoting = () => {
      socket.emit('start-the-voting', sessionId.value);
    }

    const restartVoting = () => {
      socket.emit('restart-voting', sessionId.value);
      active.value = false;
    };

    const kickUser = (user) => {
      socket.emit('kick-user', { sessionId: sessionId.value, username: user });
      toast.success("User " + user + " has been kicked from this session.");
    };

    const submitAdminInput = () => {
      if (!adminInput.value) {
        toast.warning("Looks like you forgot to type in a story.");
        return;
      }
      socket.emit('admin-input', { sessionId: sessionId.value, text: adminInput.value });
      restartVoting();
      adminInput.value = '';
    };

    const copySessionUrl = () => {
      navigator.clipboard.writeText(currentSessionUrl.value);
      toast.success("Session URL has been copied to your clipboard. Share it with your players!");
    };

    const currentSessionUrl = computed(() => {
      return `${window.location.origin}?sessionId=${sessionId.value}`;
    });

    const expandInvite = () => {
      inviteExpanded.value = !inviteExpanded.value
    }

    function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

    onMounted(() => {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        username.value = storedUsername;
      }

      if (sessionId.value && username.value) {
        socket.emit('join-session', { sessionId: sessionId.value, username: username.value });
      }

      socket.on('error', (msg) => {
        sessionId.value = '';
        router.push({ path: '/' });
        toast.error("Your session has either ended or something has gone wrong.")
      });

      socket.on('session-created', (id) => {
        router.push({ path: '/', query: { sessionId: id } });
        sessionId.value = id;
        isAdmin.value = true;
      });

      socket.on('user-joined', ({ username: usernameSession, users: userList, adminUsername, ticketText, revealVotes, sessionVotes, votingActive }) => {
        users.value = userList;
        if (username.value === adminUsername) {
          isAdmin.value = true;
        }
        if (ticketText) {
          adminSubmittedText.value = ticketText;
        }

        reveal.value = revealVotes;
        active.value = votingActive;

        if (sessionVotes) {
          for (const [key, value] of Object.entries(sessionVotes)) {
            const existingVoteIndex = votes.value.findIndex(vote => vote.username === key);
            if (existingVoteIndex === -1) {
              votes.value.push({
                username: key,
                vote: value
              });
            }
          }
        }
      });

      socket.on('user-left', ({ username, users: userList }) => {
        users.value = userList;
        toast.warning(`${username} left`);
      });

      socket.on('vote', (vote) => {
        const existingVoteIndex = votes.value.findIndex(v => v.username === vote.username);
        if (existingVoteIndex !== -1) {
          votes.value[existingVoteIndex].vote = vote.vote;
        } else {
          votes.value.push(vote);
        }
      });

      socket.on('voting-reset', () => {
        reveal.value = false;
        active.value = false;
        votes.value = [];
      });

      socket.on('votes-revealed', () => {
        reveal.value = true;
        // let results = document.getElementById('reveal-vote-info');
        waitForElm('#reveal-vote-info').then((elm) => {
          elm.scrollIntoView({ behavior: "smooth" });
        })
      });

      socket.on('voting-active', () => {
        active.value = true;
      })

      socket.on('user-kicked', ({ username: usernameSession, users: userList }) => {
        users.value = userList;
        votes.value = votes.value.filter(vote => vote.username !== usernameSession);
        if (usernameSession === username.value) {
          sessionId.value = '';
          router.push({ path: '/' });
          toast.error('You have been kicked from the session.');
        }
      });

      socket.on('admin-input', ({ text }) => {
        adminSubmittedText.value = text;
        toast.success('The story has been updated.');
      });
    });

    watch(route, (newRoute) => {
      const newSessionId = newRoute.query.sessionId;
      if (newSessionId) {
        sessionId.value = newSessionId;
        if (username.value) {
          socket.emit('join-session', { sessionId: newSessionId, username: username.value });
        }
      }
    });

    onBeforeUnmount(() => {
      socket.off('session-created');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('vote');
      socket.off('votes-revealed');
      socket.off('user-kicked');
      socket.off('admin-input');
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
      expandInvite,
      inviteExpanded,
      startTheVoting,
      VotePieChart,
      waitForElm
    };
  }
};
</script>

<style>
body {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #F5F5F5 0%, #EDE6FF 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  /* height: 100vh; */
  margin: auto;
  margin: 0;
}

/* #app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
} */

nav {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background-color: #8BBF9F;
  color: #F5F5F5;
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
  color: #F5F5F5;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;
}

.nav-right {
  margin-right: 32px;
}

.nav-right button {
  background-color: #3B5249;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-right button:hover {
  background-color: #FF5722;
}

.container {
  width: 90vw;
  max-width: 1200px;
  background-color: #FFF;
  padding: 40px 20px 40px 20px;
  margin-top: 96px;
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.voting-progress {
  margin-bottom: 16px;
  margin-left: auto;
  margin-right: auto;
}

.waiting {
  background-color: #FF3D00;
}

.story {
  text-align: center;
}

h1, h2, h3 {
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
  border: 2px solid #8BBF9F;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus {
  outline: none;
  border-color: #3B5249;
}

input[type="text"]::placeholder {
  color: #757575;
}

button {
  padding: 12px 20px;
  margin: 5px;
  background-color: #857E7B;
  color: #FFF;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #646464;
}

.btn-primary {
  background-color: #8BBF9F;
}

.btn-primary:hover {
  background-color: #6BA98F;
}


.welcome-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
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

.create-session, .join-session {
  width: 90%;
  max-width: 400px;
  padding: 20px;
  border: 2px solid #8BBF9F;
  border-radius: 12px;
  text-align: center;
  background: linear-gradient(135deg, #EDE6FF 0%, #F5F5F5 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.create-session:hover, .join-session:hover {
  /* transform: translateY(-10px); */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.session-id {
  width: auto !important;
}

.separator {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
}

.separator::before, .separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #8BBF9F;
}

.separator::before {
  margin-right: .25em;
}

.separator::after {
  margin-left: .25em;
}

.separator span {
  padding: 0 10px;
  background-color: #FFF;
  color: #333333;
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

.vote-breakdown {
  display: block;
}

.vote-item {
  background-color: #F5F5F5;
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
  font-size: 24px;
  color: #FF5722;
}

.card {
  display: inline-block;
  padding: 20px;
  border: 2px solid #333333;
  border-radius: 12px;
  width: 120px;
  height: 180px;
  background-color: #F5F5F5;
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

.vote-status {
  padding: 16px;
  text-align: center;
  font-weight: bold;
  color: #FFF;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.vote-status.active {
  background-color: #8BBF9F;
}

.vote-status.closed {
  background-color: #757575;
}

.player-header {
  font-weight: 700;
  margin: 0;
  padding: 12px;
  background-color: #8BBF9F;
  color: #FFF;
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

.players li:first-child {
  border-top: none;
}

.players li:not(:last-child) {
  border-bottom: none;
}

.kick-btn {
  color: #FF5722;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0px;
}

.kick-btn:hover {
  color: #FF3D00;
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

@media screen and (max-width: 480px) {
  .container {
    width: 100%;
    padding: 10px;
  }

  .create-session, .join-session {
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
