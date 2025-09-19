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
@Table(name = "chat_channel_customer",
       indexes = {
           @Index(name = "idx_chat_channel_customer_channel", columnList = "channel_id"),
           @Index(name = "idx_chat_channel_customer_user", columnList = "user_uuid")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatChannelCustomer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "channel_id", nullable = false)
    private Long channelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", referencedColumnName = "id", insertable = false, updatable = false)
    private ChatChannel channel;

    @Column(name = "user_uuid", nullable = false, length = 50)
    private String userUuid;

    @Column(name = "note", length = 100)
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static ChatChannelCustomer create(Long channelId, String userUuid, String note) {
        ChatChannelCustomer customer = new ChatChannelCustomer();
        customer.channelId = channelId;
        customer.userUuid = userUuid;
        customer.note = note;
        return customer;
    }
}

