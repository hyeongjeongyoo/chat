package cms.board.domain;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bbs_category", indexes = {
        @Index(name = "IDX_CATEGORY_SORT", columnList = "BBS_ID, SORT_ORDER, DISPLAY_YN")
}, uniqueConstraints = {
        @UniqueConstraint(name = "UK_BBS_CATEGORY_CODE", columnNames = { "BBS_ID", "CODE" })
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BbsCategoryDomain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CATEGORY_ID")
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BBS_ID", nullable = false)
    private BbsMasterDomain bbsMaster;

    @Column(name = "CODE", nullable = false, length = 50)
    private String code;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "SORT_ORDER")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "DISPLAY_YN", length = 1)
    @Builder.Default
    private String displayYn = "Y";

    @Column(name = "CREATED_BY", length = 36)
    private String createdBy;

    @Column(name = "CREATED_IP", length = 45)
    private String createdIp;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_BY", length = 36)
    private String updatedBy;

    @Column(name = "UPDATED_IP", length = 45)
    private String updatedIp;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;

    public void update(String code, String name, Integer sortOrder, String displayYn) {
        if (code != null)
            this.code = code;
        if (name != null)
            this.name = name;
        if (sortOrder != null)
            this.sortOrder = sortOrder;
        if (displayYn != null)
            this.displayYn = displayYn;
    }
}