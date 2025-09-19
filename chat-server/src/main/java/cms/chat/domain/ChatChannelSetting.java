package cms.chat.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_channel_setting",
        indexes = {
            @Index(name = "idx_chat_channel_setting_channel", columnList = "channel_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatChannelSetting {

    @Id
    @Column(name = "channel_id")
    private Long channelId;

    @Column(name = "config", columnDefinition = "JSON")
    private String config;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static ChatChannelSetting create(Long channelId, String config, String actor) {
        ChatChannelSetting setting = new ChatChannelSetting();
        setting.channelId = channelId;
        setting.config = config;
        setting.createdBy = actor;
        setting.updatedBy = actor;
        return setting;
    }
}
