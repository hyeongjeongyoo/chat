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

    @Column(name = "owner_user_uuid", length = 36)
    private String ownerUserUuid;

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

    public static ChatChannel create(String cmsCode, String cmsName, String actor) {
        return create(cmsCode, cmsName, actor, null);
    }

    public static ChatChannel create(String cmsCode, String cmsName, String actor, String ownerUserUuid) {
        ChatChannel channel = new ChatChannel();
        channel.cmsCode = cmsCode;
        channel.cmsName = cmsName;
        channel.ownerUserUuid = ownerUserUuid;
        channel.createdBy = actor;
        channel.updatedBy = actor;
        // 일부 운영 DB에서는 created_ip / updated_ip 가 NOT NULL 제약일 수 있음
        channel.createdIp = (channel.createdIp == null ? "127.0.0.1" : channel.createdIp);
        channel.updatedIp = (channel.updatedIp == null ? channel.createdIp : channel.updatedIp);
        return channel;
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
        if (this.deletedYn == null || this.deletedYn.isEmpty()) {
            this.deletedYn = "N";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (this.updatedIp == null || this.updatedIp.isEmpty()) {
            this.updatedIp = "127.0.0.1";
        }
    }

    // Soft delete method
    public void markDeleted(String actor) {
        this.deletedYn = "Y";
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = actor;
        this.updatedBy = actor;
        this.updatedAt = LocalDateTime.now();
    }

    // Check if deleted
    public boolean isDeleted() {
        return "Y".equals(this.deletedYn);
    }
}

