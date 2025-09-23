package cms.chat.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import cms.common.dto.ApiResponseSchema;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/cms/chat/config")
public class ChannelConfigController {

    // 업체별 채널 설정을 위한 YAML 설정 관리
    private final Map<String, Map<String, Object>> channelConfigs = new HashMap<>();

    @GetMapping("/channels/{uuid}")
    public ResponseEntity<?> getChannelConfig(@PathVariable String uuid) {
        Map<String, Object> config = channelConfigs.get(uuid);
        if (config == null) {
            return ResponseEntity.ok(ApiResponseSchema.error("Channel config not found", "NOT_FOUND"));
        }
        return ResponseEntity.ok(ApiResponseSchema.success(config, "ok"));
    }

    @PostMapping("/channels/{uuid}")
    public ResponseEntity<?> setChannelConfig(@PathVariable String uuid, @RequestBody Map<String, Object> config) {
        channelConfigs.put(uuid, config);
        return ResponseEntity.ok(ApiResponseSchema.success(config, "Channel config saved"));
    }

    @GetMapping("/channels")
    public ResponseEntity<?> getAllChannelConfigs() {
        return ResponseEntity.ok(ApiResponseSchema.success(channelConfigs, "ok"));
    }

    @DeleteMapping("/channels/{uuid}")
    public ResponseEntity<?> deleteChannelConfig(@PathVariable String uuid) {
        Map<String, Object> removed = channelConfigs.remove(uuid);
        if (removed == null) {
            return ResponseEntity.ok(ApiResponseSchema.error("Channel config not found", "NOT_FOUND"));
        }
        return ResponseEntity.ok(ApiResponseSchema.success(removed, "Channel config deleted"));
    }

}
