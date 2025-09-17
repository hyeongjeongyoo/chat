package cms.file.controller;

import cms.common.dto.ApiResponseSchema;
import cms.file.dto.FileDto;
import cms.file.entity.CmsFile;
import cms.file.repository.FileRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Lightweight presign API facade to integrate frontend without external object storage.
 * - Upload uses existing /cms/file/public/upload (multipart/form-data)
 * - Complete resolves the latest uploaded file by (menu, menuId, originName)
 */
@RestController
@RequestMapping("/attachments")
@RequiredArgsConstructor
@Slf4j
public class AttachmentPresignController {

    private final FileRepository fileRepository;

    @Data
    public static class PresignRequest {
        private String fileName;
        private String contentType;
        private Long size;
        private String checksum; // optional: sha256:<hex>
        private String scope;    // e.g. CHAT
        private Long menuId;     // e.g. threadId
        private String disposition; // inline|attachment (optional)
    }

    @PostMapping("/presign")
    public ResponseEntity<?> presign(@RequestBody PresignRequest req) {
        // Basic validations (keep minimal to avoid breaking existing flows)
        if (req.getFileName() == null || req.getFileName().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponseSchema.error("fileName is required", "VALIDATION_ERR"));
        }
        if (req.getContentType() == null || req.getContentType().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponseSchema.error("contentType is required", "VALIDATION_ERR"));
        }
        if (req.getScope() == null || req.getScope().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponseSchema.error("scope is required", "VALIDATION_ERR"));
        }
        if (req.getMenuId() == null) {
            return ResponseEntity.badRequest().body(ApiResponseSchema.error("menuId is required", "VALIDATION_ERR"));
        }

        Map<String, Object> body = new HashMap<>();
        body.put("method", "POST");
        // Reuse existing upload endpoint
        body.put("uploadUrl", "/api/v1/cms/file/public/upload");
        Map<String, Object> fields = new HashMap<>();
        fields.put("menu", req.getScope());
        fields.put("menuId", req.getMenuId());
        // Frontend should send the file(s) in form-data key: "files" (or "file")
        fields.put("fileField", "files");
        body.put("fields", fields);
        body.put("headers", Map.of("Content-Type", req.getContentType()));
        body.put("storageKey", "local://pending/" + req.getFileName());
        body.put("expiresAt", Instant.now().plus(10, ChronoUnit.MINUTES).toString());
        body.put("maxSize", 50 * 1024 * 1024); // 50MB

        return ResponseEntity.ok(ApiResponseSchema.success(body, "ok"));
    }

    @Data
    public static class CompleteRequest {
        private String storageKey;
        private String fileName;
        private String contentType;
        private Long size;
        private String scope;
        private Long menuId;
        private String checksum;
    }

    @PostMapping("/complete")
    public ResponseEntity<?> complete(@RequestBody CompleteRequest req) {
        if (req.getFileName() == null || req.getFileName().isEmpty() || req.getScope() == null || req.getMenuId() == null) {
            return ResponseEntity.badRequest().body(ApiResponseSchema.error("fileName, scope, menuId are required", "VALIDATION_ERR"));
        }
        // Resolve the latest uploaded file by menu/menuId/originName
        Optional<CmsFile> latest = fileRepository.findTopByMenuAndMenuIdAndOriginNameOrderByCreatedDateDesc(
                req.getScope(), req.getMenuId(), req.getFileName());
        if (latest.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponseSchema.error("Uploaded file not found yet. Retry shortly.", "FILE_NOT_FOUND"));
        }
        CmsFile f = latest.get();
        FileDto dto = new FileDto();
        dto.setFileId(f.getFileId());
        dto.setOriginName(f.getOriginName());
        dto.setMimeType(f.getMimeType());
        dto.setSize(f.getSize());
        dto.setMenu(f.getMenu());
        dto.setMenuId(f.getMenuId());
        dto.setDownloadUrl("/api/v1/cms/file/public/download/" + f.getFileId());
        if (f.getMimeType() != null && f.getMimeType().startsWith("image/")) {
            dto.setViewUrl("/api/v1/cms/file/public/view/" + f.getFileId());
        }
        return ResponseEntity.ok(ApiResponseSchema.success(dto, "ok"));
    }

    @Data
    public static class PresignGetRequest {
        private String storageKey; // optional if fileId provided
        private Long fileId;       // preferred
        private String disposition; // inline|attachment
    }

    @PostMapping("/presign-get")
    public ResponseEntity<?> presignGet(@RequestBody PresignGetRequest req) {
        CmsFile f = null;
        if (req.getFileId() != null) {
            f = fileRepository.findById(req.getFileId()).orElse(null);
        }
        if (f == null && req.getStorageKey() != null) {
            // savedName maps to storageKey in local storage scenario
            f = fileRepository.findBySavedName(req.getStorageKey());
        }
        if (f == null) {
            return ResponseEntity.status(404).body(ApiResponseSchema.error("File not found", "FILE_NOT_FOUND"));
        }
        Map<String, Object> body = new HashMap<>();
        body.put("method", "GET");
        body.put("downloadUrl", "/api/v1/cms/file/public/download/" + f.getFileId());
        Map<String, String> headers = new HashMap<>();
        headers.put("Response-Content-Type", f.getMimeType());
        if ("attachment".equalsIgnoreCase(req.getDisposition())) {
            headers.put("Response-Content-Disposition", "attachment; filename*=UTF-8''" + java.net.URLEncoder.encode(f.getOriginName(), java.nio.charset.StandardCharsets.UTF_8));
        }
        body.put("headers", headers);
        body.put("expiresAt", Instant.now().plus(5, ChronoUnit.MINUTES).toString());
        return ResponseEntity.ok(ApiResponseSchema.success(body, "ok"));
    }
}





