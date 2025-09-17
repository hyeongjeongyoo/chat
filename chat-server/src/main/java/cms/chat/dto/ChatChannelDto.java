package cms.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatChannelDto {
    private Long id;
    private String cmsCode;
    private String cmsName;
    private Long unreadCount;
}