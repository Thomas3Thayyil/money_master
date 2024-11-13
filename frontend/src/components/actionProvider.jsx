// src/actionProvider.js
class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleHello() {
    const message = this.createChatBotMessage("Hi there! How can I help you?");
    this.setChatbotMessage(message);
  }
}

export default ActionProvider;
