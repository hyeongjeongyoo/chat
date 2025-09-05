package cms.chat.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_session_log",
       indexes = {
           @Index(name = "idx_chat_session_log_thread_id", columnList = "thread_id"),
           @Index(name = "idx_chat_session_log_started_at", columnList = "started_at")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSessionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "thread_id", nullable = false, foreignKey = @ForeignKey(name = "fk_chat_session_log_thread"))
    private ChatThread thread;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @CreationTimestamp
    @Column(name = "started_at", nullable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "ended_reason", length = 100)
    private String endedReason;

    public static ChatSessionLog start(ChatThread thread, String sessionId) {
        ChatSessionLog log = new ChatSessionLog();
        log.thread = thread;
        log.sessionId = sessionId;
        return log;
    }

    public void finish(LocalDateTime endedAt, String reason) {
        this.endedAt = endedAt;
        this.endedReason = reason;
    }
}

