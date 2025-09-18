package cms.file.controller;

import cms.common.dto.ApiResponseSchema;
import cms.file.dto.FileDto;
import cms.chat.service.ChatService;
import cms.chat.repository.ChatThreadRepository;
import cms.chat.domain.ChatThread;
import cms.file.entity.CmsFile;
import cms.file.service.FileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import javax.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.io.IOException;

@RestController
@RequestMapping("/cms/file")
@RequiredArgsConstructor
@Tag(name = "cms_00_File", description = "파일 업로드, 다운로드, 미리보기 API")
@Slf4j
public class FileController {

    private final FileService fileService;
    private final ChatService chatService;
    private final ChatThreadRepository chatThreadRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private FileDto convertToDto(CmsFile file) {
        FileDto dto = new FileDto();
        dto.setFileId(file.getFileId());
        dto.setMenu(file.getMenu());
        dto.setMenuId(file.getMenuId());
        dto.setOriginName(file.getOriginName());
        dto.setSavedName(file.getSavedName());
        dto.setMimeType(file.getMimeType());
        dto.setSize(file.getSize());
        dto.setExt(file.getExt());
        dto.setVersion(file.getVersion());
        dto.setPublicYn(file.getPublicYn());
        dto.setFileOrder(file.getFileOrder());
        dto.setCreatedDate(file.getCreatedDate());
        dto.setUpdatedDate(file.getUpdatedDate());
        
        // Always include download/view URLs in responses
        String base = "/api/v1/cms/file";
        if (file.getFileId() != null) {
            dto.setDownloadUrl(base + "/public/download/" + file.getFileId());
            if (file.getMimeType() != null && file.getMimeType().startsWith("image/")) {
                dto.setViewUrl(base + "/public/view/" + file.getFileId());
            }
        }
        return dto;
    }

    private boolean shouldAutoCreateMessage(boolean autoMessageParam) {
        if (!autoMessageParam) return false;
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) return false;
            for (GrantedAuthority ga : auth.getAuthorities()) {
                String r = ga.getAuthority();
                if ("ROLE_ADMIN".equalsIgnoreCase(r) || "ROLE_SYSTEM_ADMIN".equalsIgnoreCase(r)) {
                    return true;
                }
            }
        } catch (Exception ignore) {}
        return false;
    }

    private List<FileDto> convertToDtoList(List<CmsFile> files) {
        return files.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 메시지에 파일들을 바인딩합니다. 업로드 후 메시지 생성이 완료되면 호출합니다.
     */
    @PostMapping("/private/attach")
    public ResponseEntity<ApiResponseSchema<?>> attachFilesToMessage(
            @RequestParam Long messageId,
            @RequestParam List<Long> fileIds) {
        try {
            fileService.setMessageIdBulk(fileIds, messageId);
            return ResponseEntity.ok(ApiResponseSchema.success(
                    String.format("%d files attached to message %d", fileIds.size(), messageId),
                    "Files attached successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseSchema.error("Failed to attach files: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    private CmsFile convertToEntity(FileDto dto) {
        return CmsFile.builder()
                .fileId(dto.getFileId())
                .menu(dto.getMenu())
                .menuId(dto.getMenuId())
                .originName(dto.getOriginName())
                .savedName(dto.getSavedName())
                .mimeType(dto.getMimeType())
                .size(dto.getSize())
                .ext(dto.getExt())
                .version(dto.getVersion())
                .publicYn(dto.getPublicYn())
                .fileOrder(dto.getFileOrder())
                .build();
    }

    // 관리자 API
    @PostMapping(value = "/public/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponseSchema<?>> uploadFiles(
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestPart(value = "file", required = false) MultipartFile singleFile,
            @RequestParam("menu") String menu,
            @RequestParam("menuId") Long menuId,
            @RequestParam(value = "autoMessage", defaultValue = "true") boolean autoMessage) {
        
        log.debug("---------------- File Upload (using @RequestPart) Start ----------------");
        log.debug("Received menu: {}, menuId: {}", menu, menuId);
        log.debug("Received 'files' part: {} file(s)", (files != null ? files.size() : 0));
        log.debug("Received 'file' part: {}", (singleFile != null && !singleFile.isEmpty() ? singleFile.getOriginalFilename() : "empty or null"));
        
        List<MultipartFile> fileList = new ArrayList<>();
        
        try {
            // 'files' 파라미터 처리
            if (files != null && !files.isEmpty()) {
                files.stream()
                    .filter(f -> f != null && !f.isEmpty())
                    .forEach(fileList::add);
                log.debug("Added {} valid files from 'files' part.", fileList.size());
            }

            // 'file' 파라미터 처리 (중복 방지 포함)
            if (singleFile != null && !singleFile.isEmpty()) {
                boolean alreadyAdded = fileList.stream()
                    .anyMatch(existingFile -> existingFile.getOriginalFilename().equals(singleFile.getOriginalFilename()) &&
                                            existingFile.getSize() == singleFile.getSize());
                if (!alreadyAdded) {
                    fileList.add(singleFile);
                    log.debug("Added single file from 'file' part: {}", singleFile.getOriginalFilename());
                } else {
                    log.debug("Single file in 'file' part already processed via 'files' part: {}", singleFile.getOriginalFilename());
                }
            }
            
            log.debug("---------------- File Upload Debug End ------------------");

            if (fileList.isEmpty()) {
                log.warn("No valid files were uploaded for menu: {}, menuId: {}", menu, menuId);
                return ResponseEntity.badRequest()
                    .body(ApiResponseSchema.error(
                        "No files were uploaded or provided files are empty. Please use 'files' or 'file' parameter.",
                        "FILE_UPLOAD_ERR"
                    ));
            }
                
        List<CmsFile> uploadedFiles = fileService.uploadFiles(menu, menuId, fileList);
            log.info("Successfully uploaded {} files for menu: {}, menuId: {}", uploadedFiles.size(), menu, menuId);

            // Auto-create chat messages for CHAT menu uploads so attachments persist
            try {
                if ("CHAT".equalsIgnoreCase(menu) && menuId != null && shouldAutoCreateMessage(autoMessage)) {
                    ChatThread thread = chatThreadRepository.findById(menuId)
                            .orElse(null);
                    if (thread != null) {
                        for (CmsFile f : uploadedFiles) {
                            String messageType = (f.getMimeType() != null && f.getMimeType().startsWith("image/")) ? "IMAGE" : "FILE";
                            String downloadUrl = "/api/v1/cms/file/public/download/" + f.getFileId();
                            cms.chat.domain.ChatMessage saved = chatService.sendFileMessage(thread, "ADMIN", f.getOriginName(), downloadUrl, "system", messageType);
                            // 업로드된 파일을 방금 생성된 메시지에 바인딩
                            fileService.setMessageId(f.getFileId(), saved.getId());
                            // 실시간 브로드캐스트로 즉시 반영
                            try {
                                java.util.Map<String, Object> payload = new java.util.HashMap<>();
                                payload.put("id", saved.getId());
                                payload.put("threadId", thread.getId());
                                payload.put("senderType", saved.getSenderType());
                                payload.put("content", saved.getContent());
                                payload.put("createdAt", saved.getCreatedAt());
                                payload.put("messageType", saved.getMessageType());
                                payload.put("fileName", saved.getFileName());
                                payload.put("fileUrl", saved.getFileUrl());
                                messagingTemplate.convertAndSend("/sub/chat/" + thread.getId(), payload);
                            } catch (Exception ignore) {}
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Failed to auto-create chat messages for uploaded files. menu={}, menuId={}, error={}", menu, menuId, ex.getMessage());
            }
            return ResponseEntity.ok(ApiResponseSchema.success(
                convertToDtoList(uploadedFiles),
                "Files uploaded successfully"
            ));
                
        } catch (Exception e) {
            log.error("File upload failed unexpectedly for menu: {}, menuId: {}", menu, menuId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseSchema.error(
                    "File upload failed: " + e.getMessage(),
                    "INTERNAL_SERVER_ERR"
                    // Consider omitting stack trace in production for security
                    // , e.getStackTrace().toString()
                ));
        }
    }

    @GetMapping("/private/list")
    public ResponseEntity<ApiResponseSchema<?>> getFileList(
            @RequestParam String menu,
            @RequestParam Long menuId,
            @RequestParam(required = false) String publicYn) {
        try {
        List<CmsFile> files = fileService.getList(menu, menuId, publicYn);
            return ResponseEntity.ok(ApiResponseSchema.success(
                convertToDtoList(files),
                "File list retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Failed to get file list for menu: {}, menuId: {}, publicYn: {}", menu, menuId, publicYn, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseSchema.error(
                    "Failed to get file list: " + e.getMessage(),
                    "INTERNAL_SERVER_ERR"
                ));
        }
    }

    @GetMapping("/private/{fileId}")
    public ResponseEntity<ApiResponseSchema<?>> getFile(@PathVariable Long fileId) {
        try {
        CmsFile file = fileService.getFile(fileId);
            return ResponseEntity.ok(ApiResponseSchema.success(
                convertToDto(file),
                "File retrieved successfully"
            ));
        } catch (EntityNotFoundException e) {
            log.warn("File not found for fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseSchema.error(
                    "File not found with id: " + fileId,
                    "FILE_NOT_FOUND"
                ));
        } catch (Exception e) {
            log.error("Failed to get file for fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseSchema.error(
                    "Failed to get file: " + e.getMessage(),
                    "INTERNAL_SERVER_ERR"
                ));
        }
    }

    @PutMapping("/private/{fileId}")
    public ResponseEntity<ApiResponseSchema<?>> updateFile(
            @PathVariable Long fileId,
            @RequestBody FileDto fileDto) {
        try {
        CmsFile fileToUpdate = convertToEntity(fileDto);
        CmsFile updatedFile = fileService.updateFile(fileId, fileToUpdate);
            return ResponseEntity.ok(ApiResponseSchema.success(
                convertToDto(updatedFile),
                 "File updated successfully"
                 ));
        } catch (EntityNotFoundException e) {
            log.warn("File not found for update, fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseSchema.error(
                    "File not found with id: " + fileId + " for update.",
                    "FILE_NOT_FOUND"
                ));
        } catch (Exception e) {
            log.error("Failed to update file for fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseSchema.error(
                    "Failed to update file: " + e.getMessage(),
                    "INTERNAL_SERVER_ERR"
                ));
        }
    }

    @DeleteMapping("/private/{fileId}")
    public ResponseEntity<ApiResponseSchema<?>> deleteFile(@PathVariable Long fileId) {
        try {
        fileService.deleteFile(fileId);
            return ResponseEntity.ok(ApiResponseSchema.success(
                "File deleted successfully"
            ));
        } catch (EntityNotFoundException e) {
            log.warn("File not found for deletion, fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseSchema.error(
                    "File not found with id: " + fileId + " for deletion.",
                    "FILE_NOT_FOUND"
                ));
        } catch (Exception e) {
            log.error("Failed to delete file for fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseSchema.error(
                    "Failed to delete file: " + e.getMessage(),
                    "INTERNAL_SERVER_ERR"
                ));
        }
    }

    @PutMapping("/private/order")
    public ResponseEntity<ApiResponseSchema<?>> updateFileOrder(@RequestBody List<FileDto> fileOrders) {
        try {
        List<CmsFile> files = fileOrders.stream()
                .map(dto -> CmsFile.builder().fileId(dto.getFileId()).fileOrder(dto.getFileOrder()).build())
                .collect(Collectors.toList());
        fileService.updateFileOrder(files);
            return ResponseEntity.ok(ApiResponseSchema.success(
                "File order updated successfully"
            ));
        } catch (Exception e) {
            log.error("Failed to update file order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseSchema.error(
                    "Failed to update file order: " + e.getMessage(),
                    "INTERNAL_SERVER_ERR"
                ));
        }
    }

    @GetMapping("/private/all")
    public ResponseEntity<ApiResponseSchema<?>> getAllFiles(
            @RequestParam(required = false) String menu,
            @RequestParam(required = false) String publicYn,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
        List<CmsFile> files = fileService.getAllFiles(menu, publicYn, page, size);
            return ResponseEntity.ok(ApiResponseSchema.success(
                convertToDtoList(files),
                "All files retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Failed to get all files for menu: {}, publicYn: {}, page: {}, size: {}", menu, publicYn, page, size, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseSchema.error(
                    "Failed to get all files: " + e.getMessage(),
                    "INTERNAL_SERVER_ERR"
                ));
        }
    }

    // 공개 API
    @GetMapping("/public/list")
    public ResponseEntity<ApiResponseSchema<?>> getPublicFileList(
            @RequestParam String menu,
            @RequestParam Long menuId) {
        try {
            List<CmsFile> files = fileService.getPublicList(menu, menuId);
            return ResponseEntity.ok(ApiResponseSchema.success(
                convertToDtoList(files),
                "Public file list retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Failed to get public file list for menu: {}, menuId: {}", menu, menuId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseSchema.error(
                    "Failed to get public file list: " + e.getMessage(),
                    "INTERNAL_SERVER_ERR"
                ));
        }
    }

    /**
     * 채널 ID로 해당 채널의 모든 스레드에 속한 CHAT 파일들을 모아 반환합니다.
     * 내부적으로 threadId 목록을 조회한 뒤 file(menu='CHAT', menuId in threadIds)을 합쳐서 내려줍니다.
     */
    @GetMapping("/private/list-by-channel")
    public ResponseEntity<ApiResponseSchema<?>> listFilesByChannel(@RequestParam Long channelId) {
        try {
            // 채널에 속한 스레드 조회
            cms.chat.domain.ChatChannel channel = chatService.getChannelById(channelId);
            if (channel == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponseSchema.error("Channel not found: " + channelId, "CHANNEL_NOT_FOUND"));
            }
            List<ChatThread> threads = chatThreadRepository.findByChannelOrderByUpdatedAtDesc(channel);
            if (threads == null || threads.isEmpty()) {
                return ResponseEntity.ok(ApiResponseSchema.success(new ArrayList<>(), "No threads for channel"));
            }
            List<Long> threadIds = threads.stream().map(ChatThread::getId).collect(Collectors.toList());
            // FileService에 헬퍼가 없으면 단건 반복 조회로 대체(규모가 크면 별도 repo 쿼리 추가)
            List<CmsFile> all = new ArrayList<>();
            for (Long tid : threadIds) {
                List<CmsFile> list = fileService.getList("CHAT", tid, null);
                if (list != null && !list.isEmpty()) all.addAll(list);
            }
            // 최신순(업데이트일시, 없으면 createdDate) 정렬
            all.sort((a, b) -> {
                java.time.LocalDateTime la = a.getUpdatedDate() != null ? a.getUpdatedDate() : a.getCreatedDate();
                java.time.LocalDateTime lb = b.getUpdatedDate() != null ? b.getUpdatedDate() : b.getCreatedDate();
                return lb.compareTo(la);
            });
            return ResponseEntity.ok(ApiResponseSchema.success(convertToDtoList(all), "ok"));
        } catch (Exception e) {
            log.error("Failed list-by-channel, channelId={}", channelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseSchema.error("Failed to list files by channel: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @GetMapping("/public/{fileId}")
    public ResponseEntity<ApiResponseSchema<?>> getPublicFile(@PathVariable Long fileId) {
        try {
            CmsFile file = fileService.getFile(fileId);
            if (!"Y".equals(file.getPublicYn())) {
                log.warn("Access denied for public fileId: {}. File is not public.", fileId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseSchema.error(
                        "Access denied: File is not public",
                        "ACCESS_DENIED"
                    ));
            }
            return ResponseEntity.ok(ApiResponseSchema.success(
                convertToDto(file),
                "Public file retrieved successfully"
            ));
        } catch (EntityNotFoundException e) {
            log.warn("Public file not found for fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseSchema.error(
                    "Public file not found with id: " + fileId,
                    "FILE_NOT_FOUND"
                ));
        } catch (Exception e) {
            log.error("Failed to get public file for fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseSchema.error(
                    "Failed to get public file: " + e.getMessage(),
                    "INTERNAL_SERVER_ERR"
                ));
        }
    }

    // Helper method to build ResponseEntity for file serving
    private ResponseEntity<?> buildFileResponse(Long fileId, boolean inlineDisposition) {
        try {
            CmsFile fileInfo = fileService.getFile(fileId);
            if (fileInfo == null || !"Y".equals(fileInfo.getPublicYn())) {
                log.warn("Attempt to access non-public or non-existent file: {}", fileId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponseSchema.error("File not found or not public.", "FILE_NOT_FOUND"));
            }

            Resource resource = fileService.loadFileAsResource(fileInfo.getSavedName());

            String contentType = fileInfo.getMimeType();
        try {
                if (contentType == null || contentType.equals(MediaType.APPLICATION_OCTET_STREAM_VALUE)) {
                    contentType = java.nio.file.Files.probeContentType(resource.getFile().toPath());
                }
            } catch (IOException | UnsupportedOperationException ex) { // Added UnsupportedOperationException for certain Resource types
                log.info("Could not determine file type for {} via probeContentType. Relying on stored MIME type or defaulting. Error: {}", fileInfo.getSavedName(), ex.getMessage());
                // Keep stored contentType if probe fails or is not supported
            }
            if (contentType == null) { // Still null after probe or if probe failed
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));

            String encodedFileName = URLEncoder.encode(fileInfo.getOriginName(), StandardCharsets.UTF_8.toString()).replaceAll("\\+", "%20");

            if (inlineDisposition) {
                headers.setContentDispositionFormData("inline", encodedFileName);
            } else {
                headers.setContentDispositionFormData("attachment", encodedFileName);
            }
            
            // Add Cache-Control header to prevent caching of sensitive files if needed, or allow caching for public images
            // For example, for public images that change infrequently:
            // headers.setCacheControl(CacheControl.maxAge(3600, TimeUnit.SECONDS).mustRevalidate().cachePublic());
            // For downloads or sensitive files:
            // headers.setCacheControl(CacheControl.noCache().noStore().mustRevalidate());
            // For now, let's use a general no-cache for simplicity, adjust as needed.
            headers.setCacheControl("no-cache, no-store, must-revalidate");
            headers.setPragma("no-cache");
            headers.setExpires(0L);


            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);

        } catch (EntityNotFoundException e) {
            log.warn("File not found, fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseSchema.error("File not found with id: " + fileId, "FILE_NOT_FOUND"));
        } catch (Exception e) {
            log.error("Error during file serving for fileId: {}. Inline: {}", fileId, inlineDisposition, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseSchema.error("Could not serve file: " + e.getMessage(), "INTERNAL_SERVER_ERR"));
        }
    }

    @GetMapping("/public/view/{fileId}")
    public ResponseEntity<?> viewPublicFile(@PathVariable Long fileId) {
        log.debug("Request to view file with ID: {}", fileId);
        return buildFileResponse(fileId, true); // true for inline disposition
    }

    @GetMapping("/public/download/{fileId}")
    public ResponseEntity<?> downloadPublicFile(@PathVariable Long fileId) {
        log.debug("Request to download file with ID: {}", fileId);
        return buildFileResponse(fileId, false); // false for attachment disposition
    }
} 