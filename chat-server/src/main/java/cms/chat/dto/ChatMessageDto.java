package cms.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long id;
    private Long threadId;
    private String content;
    private String senderType;
    private String senderName;
    private String messageType;
    private String fileName;
    private String fileUrl;
    private boolean isRead;
    private String readAt;
    private String createdAt;
}