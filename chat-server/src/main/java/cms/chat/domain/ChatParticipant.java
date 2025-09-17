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
@Table(name = "chat_participant",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_chat_participant_thread_user", columnNames = {"thread_id", "user_identifier"})
       },
       indexes = {
           @Index(name = "idx_chat_participant_thread_id", columnList = "thread_id")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "thread_id", nullable = false, foreignKey = @ForeignKey(name = "fk_chat_participant_thread"))
    private ChatThread thread;

    @Column(name = "user_identifier", nullable = false, length = 255)
    private String userIdentifier;

    @Column(name = "role", nullable = false, length = 20)
    private String role; // USER, ADMIN

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(name = "left_at")
    private LocalDateTime leftAt;

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

    public static ChatParticipant join(ChatThread thread, String userIdentifier, String role, String actor, LocalDateTime joinedAt) {
        ChatParticipant p = new ChatParticipant();
        p.thread = thread;
        p.userIdentifier = userIdentifier;
        p.role = role;
        p.joinedAt = joinedAt;
        p.createdBy = actor;
        return p;
    }
}





