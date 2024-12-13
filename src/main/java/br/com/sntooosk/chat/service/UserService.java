package br.com.sntooosk.chat.service;

import br.com.sntooosk.chat.model.User;
import br.com.sntooosk.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User createUser(String username, String profilePictureUrl) {
        User user = new User(username, profilePictureUrl);
        return userRepository.save(user);
    }
}
