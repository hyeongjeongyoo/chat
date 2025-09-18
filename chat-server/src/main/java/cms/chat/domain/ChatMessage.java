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

    @Column(name = "sender_name", nullable = false, length = 100)
    private String senderName;

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

    @Column(name = "created_ip", length = 50)
    private String createdIp;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "updated_ip", length = 50)
    private String updatedIp;

  // Soft delete fields
  @Column(name = "deleted_yn", length = 1, nullable = false)
  private String deletedYn = "N";

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @Column(name = "deleted_by", length = 64)
  private String deletedBy;

    public static ChatMessage createText(ChatThread thread, String senderType, String content, String actor) {
        ChatMessage message = new ChatMessage();
        message.thread = thread;
        message.senderType = senderType;
        // Sender name: ADMIN 은 actor, USER 는 스레드 사용자명(없으면 식별자)
        if ("ADMIN".equalsIgnoreCase(senderType)) {
            message.senderName = (actor != null && !actor.isEmpty()) ? actor : "admin";
        } else {
            String fromThread = (thread != null && thread.getUserName() != null && !thread.getUserName().isEmpty())
                    ? thread.getUserName()
                    : (thread != null ? thread.getUserIdentifier() : null);
            message.senderName = (fromThread != null && !fromThread.isEmpty()) ? fromThread : "user";
        }
        message.messageType = "TEXT";
        message.content = content;
        message.isRead = false;
        message.createdBy = actor;
        message.updatedBy = actor;
        message.updatedAt = LocalDateTime.now();
        // 기본 IP 값 (일부 운영 DB에서 NOT NULL 제약 가능)
        message.createdIp = (thread != null && thread.getUserIp() != null && !thread.getUserIp().isEmpty()) ? thread.getUserIp() : "127.0.0.1";
        message.updatedIp = message.createdIp;
        return message;
    }

    @PrePersist
    protected void onCreate() {
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        if (this.deletedYn == null || this.deletedYn.isEmpty()) {
        this.deletedYn = "N";
        }
        if (this.senderName == null || this.senderName.isEmpty()) {
            this.senderName = ("ADMIN".equalsIgnoreCase(this.senderType)) ?
                    ((this.createdBy != null && !this.createdBy.isEmpty()) ? this.createdBy : "admin") : "user";
        }
        if (this.updatedBy == null || this.updatedBy.isEmpty()) {
            this.updatedBy = (this.createdBy != null && !this.createdBy.isEmpty()) ? this.createdBy : "system";
        }
        if (this.createdIp == null || this.createdIp.isEmpty()) {
            this.createdIp = "127.0.0.1";
        }
        if (this.updatedIp == null || this.updatedIp.isEmpty()) {
            this.updatedIp = this.createdIp;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (this.updatedIp == null || this.updatedIp.isEmpty()) {
            this.updatedIp = "127.0.0.1";
        }
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

