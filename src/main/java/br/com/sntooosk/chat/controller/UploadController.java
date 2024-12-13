package br.com.sntooosk.chat.controller;

import br.com.sntooosk.chat.model.User;
import br.com.sntooosk.chat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UploadController {

    @Autowired
    private  UserRepository userRepository;

    @PostMapping("/upload-profile-picture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        Path uploadPath = Paths.get(uploadDir);

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Falha ao criar diretório de uploads", e);
        }

        String filePath = uploadDir + file.getOriginalFilename();
        File dest = new File(filePath);

        try {
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar o arquivo", e);
        }

        Map<String, String> response = new HashMap<>();
        response.put("url", "/uploads/" + file.getOriginalFilename());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/user")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }
}
