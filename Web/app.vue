<template>
  <div class="app-container">

    <div :class="['left-panel', { open: isLeftPanelOpen }]">
      <button @click="toggleLeftPanel" class="panel-toggle-btn">
        {{ isLeftPanelOpen ? "←" : "→" }}
      </button>
      <h3 v-if="isLeftPanelOpen" class="bubble-title">Chat Sessions</h3>
      <ul class="flex flex-col" v-if="isLeftPanelOpen">
        <button v-if="isLeftPanelOpen" class="panel-plus-btn self-center" @click="createNewChat">+</button>
      
        <li v-for="(session, index) in chatSessions" :key="index" @click="selectChat(index)">
          <span class="w-[90%] break-words">{{ session.title }}</span>

          <button @click.stop="deleteChat(index)" class="delete-btn">
            <img src="/public/icons/delete.png" alt="Delete">
          </button>
          
        </li>
      </ul>

    </div>

    <div class="chat-container">

      <div class="messages-wrapper" ref="messagesWrapper">
        <div v-for="(message, index) in chatHistory" :key="index" class="message" :class="message.role == 'assistant' ? 'ai' : 'user'">
          <div class="message-header">
            <span v-if="message.role === 'user'" class="username user-label">You</span>

            <img :src="message.role === 'user' ? userAvatar : aiAvatar" class="avatar" :class="message.role === 'user' ? 'ml-3' : 'mr-3'" />

            <span v-if="message.role === 'assistant'" class="username ai-label">مرصاد</span>
          </div>

          <p v-if="!(loading && message.role === 'assistant')">{{ message.content }}</p>
        </div>

        <div v-if="loading" class="loading-indicator">
          <div class="loader"></div>
        </div>
        
        <div ref="bottomAnchor"></div>

        <div v-if="!currentChat.id" class="absolute top-[50%] left-[50%] translate-x-[-50%]">
          <p class="text-2xl italic">Start a new converstaion...</p>
        </div>
      </div>

      <div id="input-container">
        <input v-model="userInput" @keyup.enter="sendMessage" placeholder="Type your message..." class="chat-input" />
        <span @click="sendMessage" class="send-button">➤</span>
      </div>
    </div>

    <div v-if="companyData && companyData.stock" class="right-container" :class="{ open: isRightPanelOpen }">
      <button @click="toggleRightPanel" class="panel-toggle-btn">
          <BootstrapIcon name="bar-chart-fill" />
      </button>
      <div :class="['right-panel', { open: isRightPanelOpen }]">
        <div v-if="isRightPanelOpen" class="content">
          <h3 class="bubble-title">{{ companyData.name }}</h3>
          
          <ClientOnly>
            <Stock :data="companyData.stock" />
          </ClientOnly>

          <p>{{ companyData.description }}</p>
          
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
  const companyData = ref({});

  const userInput = ref("");

  const { data: x } = useFetch("/api/chats");

  const chatSessions = ref([]);
  chatSessions.value = x.value;

  const chatHistory = ref([]);
  const currentChat = ref({});

  const userAvatar = "./icons/person-circle.svg";
  const aiAvatar = "./icons/Logo.png";
  const bottomAnchor = ref(null);

  const loading = ref(false);

  function scrollToBottom() {
    nextTick(() => {
      if (bottomAnchor.value) {
        bottomAnchor.value.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  async function sendMessage() {
    if (userInput.value.trim()) {
      chatHistory.value.push({ content: userInput.value, role: "user" });
      scrollToBottom();

      loading.value = true;

      // Create new chat (if no chat selected)
      if (!currentChat.value.id) {
        const createChannel = await $fetch("/api/create", {
          method: "POST",
        });

        chatSessions.value.push(createChannel);
        currentChat.value = createChannel;
      }

      const userMessage = userInput.value;
      userInput.value = "";

      const resp = await $fetch("/api/chat", {
        method: "POST",
        body: {
          id: currentChat.value.id,
          message: userMessage,
        },

        onResponseError() {
          chatHistory.value.push({ content: "لم يتم العثور على الشركة", role: "assistant" });
          loading.value = false;
        }
      });

      chatHistory.value.push({ content: "", role: "assistant" });
      scrollToBottom();

      if (resp.company) {
        companyData.value = resp.company;

        if (!isRightPanelOpen.value) isRightPanelOpen.value = true;
      }

      chatHistory.value.pop();
      loading.value = false;

      chatHistory.value.push({ content: resp.response, role: "assistant" });

      scrollToBottom();
    }
  }

  const isLeftPanelOpen = ref(false);
  function toggleLeftPanel() {
    isLeftPanelOpen.value = !isLeftPanelOpen.value;
  }

  const isRightPanelOpen = ref(false);
  function toggleRightPanel() {
    isRightPanelOpen.value = !isRightPanelOpen.value;
  }

  async function selectChat(index) {
    const data = await $fetch("/api/chat", {
      params: {
        id: chatSessions.value[index].id,
      },
    });

    data.history = data.history || [];
    data.company = data.company || {};

    chatHistory.value = data.history;
    companyData.value = data.company;

    currentChat.value = chatSessions.value[index];
  }

  async function createNewChat() {
    const createChannel = await $fetch("/api/create", { method: "POST" });

    chatSessions.value.push(createChannel);
    currentChat.value = createChannel;
  }

  async function deleteChat(index) {
    const data = await $fetch("/api/delete", {
      method: "POST",
      body: { id: chatSessions.value[index].id },

      onResponseError() {
        alert("Error occured!") 
      }
    });

    if(data.status) {
      if (currentChat.value === chatSessions.value[index]) {
        currentChat.value = {};
        chatHistory.value = [];
        companyData.value = {};
      }

      chatSessions.value.splice(index, 1);
    } else alert("Error occured");
  }
</script>

<style scoped>
  .app-container {
    display: flex;
    height: 100vh;
    background-color: #1a1a1d;
    color: #ffffff;
    padding: 20px;
    background: radial-gradient(circle, rgba(166, 77, 121, 0.5), transparent 60%);
    border-radius: 20px;
  }


  .chat-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    flex: 1;
    max-width: 600px;
    height: 100vh;
    border-radius: 12px;
    position: relative;
  }


  .messages-wrapper {
    flex: 1;
    width: 100%;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 70px;
  }


  .message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .message.user {
    align-items: flex-end;
  }


  .message-header {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-bottom: 5px;
  }

  .username {
    font-size: 14px;
    color: #ffffff;
  }


  .message p {
    margin: 0;
    padding: 12px;
    border-radius: 18px;
    max-width: 70%;
    word-wrap: break-word;
    font-size: 16px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .message.user p {
    background-color: #a64d79;
    color: #ffffff;
    border-radius: 18px 0 18px 18px;
    align-self: flex-end;
  }

  .message.ai p {
    background-color: #3b1c32;
    color: #ffffff;
    border-radius: 0 18px 18px 18px;
    align-self: flex-start;
    transition: background-color 0.3s ease;
  }


  #input-container {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 600px;
    display: flex;
    align-items: center;
    background-color: #1a1a1d;
    border: 2px solid #a64d79;
    border-radius: 8px;
    padding: 10px;
  }

  .chat-input {
    flex: 1;
    padding: 10px;
    background-color: transparent;
    color: #ffffff;
    border: none;
    outline: none;
    font-size: 16px;
  }

  .send-button {
    color: #ffffff;
    font-size: 24px;
    cursor: pointer;
    margin-left: 10px;
  }

  .send-button:hover {
    color: #a64d79;
  }

  .left-panel {
    position: absolute;
    left: 0;
    height: 100vh;
    width: 300px;
    background-color: transparent;
    transition: transform 0.4s ease, background-color 0.4s ease;
    overflow: hidden;
    border-right: 2px solid transparent;
    
    transform: translateX(-250px);
  }

  .left-panel.open {
    transform: translateX(0px);


    
    background-color: #3b1c32;
    border-right: 2px solid #53223a;
  }


  .panel-toggle-btn {
    position: absolute;
    top: 30px;
    right: 15px;
    background-color: #a64d79;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    margin-left: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
  }


  .panel-toggle-btn:hover {
    transform: scale(1.1);
  }
  .left-panel h3 {
    margin: 20px;
  }
  .left-panel ul {
    list-style: none;
    padding: 0;
    margin-top: 20px;
  }


  .left-panel li {
    cursor: pointer;
    padding: 12px 15px;
    margin: 10px 20px;
    background: linear-gradient(135deg, #a64d79, #884064, #3b1c32);
    border-radius: 20px;
    color: #ffffff;
    font-weight: bold;
    display: flex;
    align-items: start;
    justify-content: space-between;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }


  .left-panel li:hover {
    background: linear-gradient(135deg, #89265c, #6b304a);
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  }

  .delete-btn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
  }

  .delete-btn img {
    width: 18px;
    height: 18px;
    filter: brightness(0) invert(1);
    transition: transform 0.2s ease, filter 0.2s ease;
  }


  .delete-btn:hover img {
    transform: scale(1.1);
    filter: brightness(0) invert(0.7);
  }

  .loading-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
  }



  .loader {
    width: 45px;
    aspect-ratio: 0.75;
    --c: no-repeat linear-gradient(#fff 0 0);
    background: var(--c) 0% 50%, var(--c) 50% 50%, var(--c) 100% 50%;
    animation: l7 1s infinite linear alternate;
    margin-bottom: 40px;
  }
  @keyframes l7 {
    0% {
      background-size: 20% 50%, 20% 50%, 20% 50%;
    }
    20% {
      background-size: 20% 20%, 20% 50%, 20% 50%;
    }
    40% {
      background-size: 20% 100%, 20% 20%, 20% 50%;
    }
    60% {
      background-size: 20% 50%, 20% 100%, 20% 20%;
    }
    80% {
      background-size: 20% 50%, 20% 50%, 20% 100%;
    }
    100% {
      background-size: 20% 50%, 20% 50%, 20% 50%;
    }
  }


  .messages-wrapper {
    scrollbar-width: thin;
    scrollbar-color: white transparent;
  }

  .messages-wrapper::-webkit-scrollbar {
    width: 12px;
  }

  .messages-wrapper::-webkit-scrollbar-track {
    background: transparent;
  }

  .messages-wrapper::-webkit-scrollbar-thumb {
    background-color: #fff;
    border-radius: 10px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }


  .messages-wrapper:hover::-webkit-scrollbar-thumb,
  .messages-wrapper:active::-webkit-scrollbar-thumb {
    opacity: 1;
  }

  .messages-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: #fff;
  }

  .messages-wrapper::-webkit-scrollbar-button {
    display: none;
  }
  .bubble-title {
    display: inline-block;
    padding: 12px 25px;
    margin: 20px auto;
    border-radius: 25px;
    background: linear-gradient(145deg, #a64d79, #884064, #3b1c32);
    color: #ffffff;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }


  .bubble-title:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
    
  }

  .panel-plus-btn {
    display: flex;
    align-self: center;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #a64d79, #3b1c32);
    color: #ffffff;
    border: none;
    cursor: pointer;
    font-size: 20px;
    font-weight: bold;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }


  .panel-plus-btn:hover {
    transform: translateY(-3px);
    background: linear-gradient(135deg, #89265c, #6b304a);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  }


  .right-container {
    position: absolute;
    right: 0;

    height: 100vh;
    width: 340px;

    transition: transform 0.4s ease, background-color 0.4s ease;
    transform: translateX(80%);
  }

  .right-container.open {
    transform: translateX(0px);
  }

  .right-panel {
    position: absolute;
    right: 0;
    height: 100%;
    width: 290px;
    background-color: transparent;
    
    overflow: hidden;
    overflow-y: auto;

    border-left: 2px solid transparent;

    scrollbar-width: thin;

    transition: background-color 0.4s ease;
  }

  .right-panel.open {
    background-color: #3b1c32;
    border-left: 2px solid #53223a;
  }


  .right-container .panel-toggle-btn {
    top: 50%;
    left: -30px;
    background-color: #a64d79;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
  }


  .right-panel .content {
    padding: 8px;
  }

  .right-panel h3 {
    margin-bottom: 20px;
  }

  .right-panel ul {
    list-style: none;
    padding: 0;
  }

  .right-panel ul li {
    padding: 10px;
    background-color: #a64d79;
    border-radius: 8px;
    margin-bottom: 10px;
  }
</style>