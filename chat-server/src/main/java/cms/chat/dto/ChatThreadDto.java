package cms.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatThreadDto {
    private Long id;
    private Long channelId;
    private String userIdentifier;
    private String userName;
    private String lastMessage;
    private String lastMessageTimestamp;
    private Long unreadCount;
}