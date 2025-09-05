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
@Table(name = "chat_message",
       indexes = {
           @Index(name = "idx_chat_message_thread_id", columnList = "thread_id"),
           @Index(name = "idx_chat_message_created_at", columnList = "created_at")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "thread_id", nullable = false, foreignKey = @ForeignKey(name = "fk_chat_message_thread"))
    private ChatThread thread;

    @Column(name = "sender_type", nullable = false, length = 20)
    private String senderType; // USER or ADMIN

    @Column(name = "message_type", nullable = false, length = 20)
    private String messageType; // TEXT, IMAGE, FILE

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_url", length = 512)
    private String fileUrl;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(name = "read_at")
    private LocalDateTime readAt;

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

    public static ChatMessage createText(ChatThread thread, String senderType, String content, String actor) {
        ChatMessage message = new ChatMessage();
        message.thread = thread;
        message.senderType = senderType;
        message.messageType = "TEXT";
        message.content = content;
        message.isRead = false;
        message.createdBy = actor;
        return message;
    }

    public boolean isUnread() {
        return !this.isRead;
    }

    public void markRead(LocalDateTime readAt, String actor) {
        this.isRead = true;
        this.readAt = readAt;
        this.updatedBy = actor;
    }
}

