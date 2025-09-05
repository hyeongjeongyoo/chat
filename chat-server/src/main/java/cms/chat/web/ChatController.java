package cms.chat.web;

import cms.chat.domain.*;
import cms.chat.repository.ChatChannelRepository;
import cms.chat.repository.ChatThreadRepository;
import cms.chat.service.ChatService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.constraints.NotBlank;

@RestController
@RequestMapping({"/chat", "/cms/chat"})
@Validated
public class ChatController {

    private final ChatService chatService;
    private final ChatChannelRepository chatChannelRepository;
    private final ChatThreadRepository chatThreadRepository;

    public ChatController(ChatService chatService,
                          ChatChannelRepository chatChannelRepository,
                          ChatThreadRepository chatThreadRepository) {
        this.chatService = chatService;
        this.chatChannelRepository = chatChannelRepository;
        this.chatThreadRepository = chatThreadRepository;
    }

    @PostMapping("/channels")
    public ResponseEntity<ChatChannel> createOrGetChannel(@RequestParam @NotBlank String cmsCode,
                                                          @RequestParam(required = false) String cmsName,
                                                          @RequestParam(defaultValue = "system") String actor) {
        ChatChannel channel = chatService.getOrCreateChannel(cmsCode, cmsName, actor);
        return ResponseEntity.ok(channel);
    }

    @PostMapping("/threads")
    public ResponseEntity<ChatThread> createOrGetThread(@RequestParam Long channelId,
                                                        @RequestParam @NotBlank String userIdentifier,
                                                        @RequestParam(required = false) String userName,
                                                        @RequestParam(required = false) String userIp,
                                                        @RequestParam(defaultValue = "system") String actor) {
        ChatChannel channel = chatChannelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
        ChatThread thread = chatService.getOrCreateThread(channel, userIdentifier, userName, userIp, actor);
        return ResponseEntity.ok(thread);
    }

    @GetMapping("/threads/{threadId}/messages")
    public ResponseEntity<Page<ChatMessage>> getMessages(@PathVariable Long threadId,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "20") int size) {
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thread not found"));
        Page<ChatMessage> messages = chatService.getMessages(thread, page, size);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/threads/{threadId}/messages")
    public ResponseEntity<ChatMessage> sendText(@PathVariable Long threadId,
                                                @RequestParam @NotBlank String senderType,
                                                @RequestParam @NotBlank String content,
                                                @RequestParam(defaultValue = "system") String actor) {
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thread not found"));
        ChatMessage message = chatService.sendTextMessage(thread, senderType, content, actor);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/threads/{threadId}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long threadId,
                                         @RequestParam(defaultValue = "system") String actor) {
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thread not found"));
        chatService.markMessagesAsRead(thread, java.time.LocalDateTime.now(), actor);
        return ResponseEntity.ok().build();
    }
}