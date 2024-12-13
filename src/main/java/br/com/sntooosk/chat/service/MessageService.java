package br.com.sntooosk.chat.service;

import br.com.sntooosk.chat.model.Message;
import br.com.sntooosk.chat.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public List<Message> getPrivateMessages(String senderUsername, String recipientUsername) {
        try {
            return messageRepository.findConversationMessages(senderUsername, recipientUsername);
        } catch (Exception e) {
            System.err.println("Erro ao buscar mensagens privadas: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}
