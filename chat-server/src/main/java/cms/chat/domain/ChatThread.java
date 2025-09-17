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
@Table(name = "chat_thread",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_chat_thread_channel_user", columnNames = {"channel_id", "user_identifier"})
       },
       indexes = {
           @Index(name = "idx_chat_thread_channel_id", columnList = "channel_id"),
           @Index(name = "idx_chat_thread_user_identifier", columnList = "user_identifier")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatThread {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "channel_id", nullable = false, foreignKey = @ForeignKey(name = "fk_chat_thread_channel"))
    private ChatChannel channel;

    @Column(name = "user_identifier", nullable = false, length = 255)
    private String userIdentifier;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(name = "user_ip", length = 50)
    private String userIp;

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

    public static ChatThread create(ChatChannel channel, String userIdentifier, String userName, String userIp, String actor) {
        ChatThread thread = new ChatThread();
        thread.channel = channel;
        thread.userIdentifier = userIdentifier;
        thread.userName = userName;
        thread.userIp = userIp;
        thread.createdBy = actor;
        thread.updatedBy = actor;
        thread.createdIp = (userIp != null && !userIp.isEmpty()) ? userIp : "127.0.0.1";
        thread.updatedIp = thread.createdIp;
        return thread;
    }

    @PrePersist
    protected void onCreate() {
        if (this.updatedAt == null) {
            this.updatedAt = java.time.LocalDateTime.now();
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
}

