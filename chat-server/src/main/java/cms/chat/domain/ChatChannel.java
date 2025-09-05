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
@Table(name = "chat_channel",
       indexes = {
           @Index(name = "idx_chat_channel_cms_code", columnList = "cms_code", unique = true)
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatChannel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "cms_code", nullable = false, length = 50, unique = true)
    private String cmsCode;

    @Column(name = "cms_name", length = 100)
    private String cmsName;

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

    public static ChatChannel create(String cmsCode, String cmsName, String actor) {
        ChatChannel channel = new ChatChannel();
        channel.cmsCode = cmsCode;
        channel.cmsName = cmsName;
        channel.createdBy = actor;
        return channel;
    }
}

