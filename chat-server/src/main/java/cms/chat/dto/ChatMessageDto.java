package cms.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long id;
    private Long threadId;
    private Long channelId;
    private String content;
    private String senderType;
    private String senderName;
    private String messageType;
    private String fileName;
    private String fileUrl;
    private boolean isRead;
    private String readAt;
    private String createdAt;
    private List<cms.file.dto.FileDto> attachments;
    private Boolean edited;
}