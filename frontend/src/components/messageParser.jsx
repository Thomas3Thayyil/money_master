// src/messageParser.js
class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    if (message.includes("hello")) {
      this.actionProvider.handleHello();
    }
  }
}

export default MessageParser;
