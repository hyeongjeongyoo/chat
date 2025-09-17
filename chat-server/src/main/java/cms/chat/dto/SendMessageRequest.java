package cms.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    private Long threadId;
    private String content;
    private String senderName;
    private String senderType; // "USER" or "ADMIN"
    private String messageType; // "TEXT", "IMAGE", "FILE" 등
    private String fileName;
    private String fileUrl;
}